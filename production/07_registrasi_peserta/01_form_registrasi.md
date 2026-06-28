# 01 — Form Registrasi Peserta (Publik)

> **Prasyarat:** Template editor sudah selesai (folder `06_template_editor` selesai).
> **File target:** `src/pages/public/RegisterPage.tsx`, `src/lib/image-compressor.ts`, `src/services/participantService.ts`

---

## Tujuan

Mengimplementasikan form registrasi peserta yang diakses via QR code. Mobile-first, dengan upload selfie yang otomatis dikompresi sebelum disimpan.

---

## 1. Image Compressor (`src/lib/image-compressor.ts`)

```typescript
import imageCompression from 'browser-image-compression'

export async function compressSelfie(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.3,           // Target: 300 KB per selfie (hemat storage)
    maxWidthOrHeight: 800,     // Max dimensi 800px
    useWebWorker: true,
    fileType: 'image/jpeg' as const,
  }

  const compressedFile = await imageCompression(file, options)
  return compressedFile
}
```

---

## 2. Participant Service (`src/services/participantService.ts`)

```typescript
import { supabase } from '../lib/supabase'
import type { ParticipantInsert, Participant } from '../types/database'

// Generate kode sertifikat unik
function generateCertificateCode(prefix: string): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000) // 4 digit acak
  return `${prefix}-${randomNum}`
}

// Cek apakah kode sudah ada
async function isCodeUnique(code: string): Promise<boolean> {
  const { data } = await supabase
    .from('certificate_codes')
    .select('id')
    .eq('code', code)
    .single()
  return !data
}

// Generate kode unik (retry jika duplikat)
export async function generateUniqueCode(prefix: string): Promise<string> {
  let attempts = 0
  while (attempts < 10) {
    const code = generateCertificateCode(prefix)
    const unique = await isCodeUnique(code)
    if (unique) return code
    attempts++
  }
  throw new Error('Gagal membuat kode sertifikat unik setelah 10 percobaan')
}

// Upload selfie ke Supabase Storage
export async function uploadSelfie(eventId: string, file: File): Promise<string> {
  const fileName = `${eventId}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`

  const { error } = await supabase.storage
    .from('selfies')
    .upload(fileName, file, {
      contentType: 'image/jpeg',
    })

  if (error) throw error
  return fileName
}

// Register peserta baru
export async function registerParticipant(
  eventId: string,
  fullName: string,
  email: string,
  selfieFile: File,
  eventPrefix: string
): Promise<Participant> {
  // 1. Upload selfie
  const selfiePath = await uploadSelfie(eventId, selfieFile)

  // 2. Generate kode unik
  const certificateCode = await generateUniqueCode(eventPrefix)

  // 3. Insert participant
  const { data: participant, error: participantError } = await supabase
    .from('participants')
    .insert({
      event_id: eventId,
      full_name: fullName,
      email: email,
      selfie_path: selfiePath,
      certificate_code: certificateCode,
    })
    .select()
    .single()

  if (participantError) throw participantError

  // 4. Insert certificate code
  const { error: codeError } = await supabase
    .from('certificate_codes')
    .insert({
      code: certificateCode,
      participant_id: participant.id,
      event_id: eventId,
    })

  if (codeError) throw codeError

  return participant
}

// Fetch data event untuk halaman registrasi (publik)
export async function fetchEventForRegistration(eventId: string) {
  const { data, error } = await supabase
    .from('events')
    .select('id, name, description, organizer, location, event_date, event_time, status, prefix')
    .eq('id', eventId)
    .single()

  if (error) throw error
  return data
}

// ============================================
// ADMIN: Fetch participants
// ============================================

export async function fetchParticipants(eventId: string) {
  const { data, error } = await supabase
    .from('participants')
    .select(`
      *,
      template_overrides(*)
    `)
    .eq('event_id', eventId)
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return data
}

export async function fetchParticipantById(participantId: string) {
  const { data, error } = await supabase
    .from('participants')
    .select(`
      *,
      template_overrides(*),
      delivery_logs(*)
    `)
    .eq('id', participantId)
    .single()

  if (error) throw error
  return data
}
```

---

## 3. Form Registrasi (`src/pages/public/RegisterPage.tsx`)

```typescript
import { useEffect, useState, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Input, FileUploadBox } from '../../components/ui'
import { compressSelfie } from '../../lib/image-compressor'
import * as participantService from '../../services/participantService'
import { ACCEPTED_IMAGE_TYPES, MAX_SELFIE_SIZE_MB } from '../../constants'

export default function RegisterPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()

  const [event, setEvent] = useState<any>(null)
  const [isLoadingEvent, setIsLoadingEvent] = useState(true)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedData, setSubmittedData] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load event data
  useEffect(() => {
    if (!eventId) return
    loadEvent()
  }, [eventId])

  const loadEvent = async () => {
    try {
      const data = await participantService.fetchEventForRegistration(eventId!)
      
      if (data.status !== 'active') {
        navigate(`/event/${eventId}/closed`)
        return
      }
      
      setEvent(data)
    } catch (error) {
      navigate(`/event/${eventId}/closed`)
    } finally {
      setIsLoadingEvent(false)
    }
  }

  // Handle selfie selection
  const handleSelfieSelect = async (file: File) => {
    // Validasi tipe file
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrors(prev => ({ ...prev, selfie: 'Format file harus JPG, JPEG, atau PNG' }))
      return
    }

    // Validasi ukuran
    if (file.size > MAX_SELFIE_SIZE_MB * 1024 * 1024) {
      setErrors(prev => ({ ...prev, selfie: `Ukuran file maksimal ${MAX_SELFIE_SIZE_MB} MB` }))
      return
    }

    setIsCompressing(true)
    setErrors(prev => ({ ...prev, selfie: '' }))

    try {
      const compressed = await compressSelfie(file)
      setSelfieFile(compressed)
      setSelfiePreview(URL.createObjectURL(compressed))
    } catch (error) {
      setErrors(prev => ({ ...prev, selfie: 'Gagal memproses gambar. Coba foto lain.' }))
    } finally {
      setIsCompressing(false)
    }
  }

  // Validate form
  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!fullName.trim()) newErrors.fullName = 'Nama lengkap wajib diisi'
    if (!email.trim()) newErrors.email = 'Email wajib diisi'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Format email tidak valid'
    if (!selfieFile) newErrors.selfie = 'Foto selfie wajib diupload'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate() || !eventId || !selfieFile || !event) return

    setIsSubmitting(true)
    try {
      const participant = await participantService.registerParticipant(
        eventId,
        fullName.trim(),
        email.trim(),
        selfieFile,
        event.prefix
      )
      setSubmittedData(participant)
      setIsSuccess(true)
    } catch (error: any) {
      setErrors({ submit: error.message || 'Gagal mendaftar. Coba lagi.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (isLoadingEvent) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
            <span className="text-5xl block mb-4">✅</span>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Pendaftaran Berhasil!</h2>
            <p className="text-neutral-500 mb-6">
              Sertifikat akan dikirim ke email Anda setelah event berlangsung.
            </p>

            <div className="text-left bg-neutral-50 rounded-lg p-4 space-y-2">
              <p className="text-sm"><span className="text-neutral-500">Nama:</span> <strong>{submittedData?.full_name}</strong></p>
              <p className="text-sm"><span className="text-neutral-500">Email:</span> <strong>{submittedData?.email}</strong></p>
              <p className="text-sm"><span className="text-neutral-500">Kode:</span> <strong className="font-mono">{submittedData?.certificate_code}</strong></p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Registration form
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Event Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-neutral-900">{event?.name}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {event?.organizer} • {new Date(event?.event_date).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-5">Formulir Pendaftaran</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.submit && (
              <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
                <p className="text-sm text-danger-600">{errors.submit}</p>
              </div>
            )}

            <Input
              id="fullName"
              label="Nama Lengkap *"
              placeholder="Masukkan nama lengkap Anda"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }))
              }}
              error={errors.fullName}
              autoFocus
            />

            <Input
              id="email"
              label="Email *"
              type="email"
              placeholder="contoh@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
              }}
              error={errors.email}
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Foto Selfie *
              </label>
              <FileUploadBox
                accept="image/jpeg,image/jpg,image/png"
                maxSizeMB={MAX_SELFIE_SIZE_MB}
                onFileSelect={handleSelfieSelect}
                label="Ambil / Upload Selfie"
                hint="JPG, JPEG, atau PNG. Maks 5 MB."
                preview={selfiePreview}
                icon="camera"
                disabled={isCompressing}
              />
              {isCompressing && (
                <p className="mt-1 text-xs text-primary-600">⏳ Memproses gambar...</p>
              )}
              {errors.selfie && (
                <p className="mt-1 text-sm text-danger-600">{errors.selfie}</p>
              )}
            </div>

            {/* Peringatan */}
            <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <p className="text-sm text-warning-700">
                ⚠️ <strong>Pastikan nama sesuai identitas asli.</strong> Nama pada sertifikat
                akan mengikuti data yang Anda masukkan.
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isSubmitting}
              disabled={isCompressing}
            >
              Daftar Sekarang
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
```

---

## 4. Event Closed Page (`src/pages/public/EventClosedPage.tsx`)

```typescript
import { useParams } from 'react-router-dom'

export default function EventClosedPage() {
  const { eventId } = useParams()

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="text-5xl block mb-4">🔒</span>
        <h1 className="text-xl font-bold text-neutral-900 mb-2">Registrasi Ditutup</h1>
        <p className="text-neutral-500">
          Registrasi untuk event ini sudah tidak tersedia. Jika Anda sudah terdaftar,
          sertifikat akan dikirim ke email yang Anda daftarkan.
        </p>
      </div>
    </div>
  )
}
```

---

## Catatan Mobile-First

- Input `type="file"` dengan `accept="image/*"` dan `capture="user"` memungkinkan akses langsung ke kamera di mobile.
- Kompresi gambar dilakukan di browser (client-side) untuk mengurangi ukuran sebelum upload.
- Semua elemen full-width di mobile untuk kemudahan tap.

---

## Kriteria Selesai

- [ ] Image compressor berfungsi (kompresi ke ~300KB)
- [ ] Participant service: register, upload selfie, generate kode berfungsi
- [ ] Form registrasi mobile-first berfungsi
- [ ] Validasi inline (nama, email, selfie) berfungsi real-time
- [ ] Peringatan nama ditampilkan sebelum submit
- [ ] Loading/spinner tampil saat kompresi dan saat submit
- [ ] Halaman sukses menampilkan ringkasan data + kode sertifikat
- [ ] Redirect ke `/event/:id/closed` jika event tidak aktif
- [ ] Data tersimpan di tabel `participants` dan `certificate_codes`
- [ ] Selfie terupload di bucket `selfies`
