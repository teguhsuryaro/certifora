import { useEffect, useState, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Input, FileUploadBox } from '../../components/ui'
import { compressSelfie } from '../../lib/image-compressor'
import * as participantService from '../../services/participantService'
import { ACCEPTED_IMAGE_TYPES, MAX_SELFIE_SIZE_MB } from '../../constants'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

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
          <div className="bg-success-50 border border-success-100 rounded-2xl p-8 text-center flex flex-col items-center">
            <CheckCircle2 size={48} className="text-success-600 mb-4" />
            <h2 className="text-2xl font-bold text-success-800 mb-2">Pendaftaran Berhasil!</h2>
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
            <div className="p-3 bg-amber-50 text-amber-800 rounded-lg flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
              <p className="text-sm">
                <strong>Pastikan nama sesuai identitas asli.</strong> Nama pada sertifikat
                akan dicetak persis seperti yang Anda masukkan.
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
