import { useEffect, useState, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Input, FileUploadBox } from '../../components/ui'
import { compressSelfie } from '../../lib/image-compressor'
import * as participantService from '../../services/participantService'
import { ACCEPTED_IMAGE_TYPES, MAX_SELFIE_SIZE_MB } from '../../constants'
import { CheckCircle2, AlertTriangle, User, Mail, Calendar, MapPin, Loader2 } from 'lucide-react'

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
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrors(prev => ({ ...prev, selfie: 'Format file harus JPG, JPEG, atau PNG' }))
      return
    }

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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50 to-neutral-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-100/50 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="w-full max-w-md text-center relative z-10 animate-in fade-in zoom-in duration-500">
          <div className="glass-card rounded-3xl p-10 text-center flex flex-col items-center border border-white/60 shadow-xl shadow-primary-900/5 relative overflow-hidden">
            {/* Decorative background shape in card */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-success-100 rounded-full blur-2xl opacity-50" />
            
            <div className="w-24 h-24 bg-success-50 rounded-full flex items-center justify-center mb-6 animate-[bounce_2s_infinite]">
              <CheckCircle2 size={56} className="text-success-500" />
            </div>
            
            <h2 className="text-3xl font-extrabold text-neutral-900 mb-3 tracking-tight">Pendaftaran Berhasil!</h2>
            <p className="text-neutral-500 mb-8 leading-relaxed">
              Selamat, Anda telah terdaftar. Sertifikat digital akan dikirimkan ke email Anda setelah event selesai.
            </p>

            <div className="text-left w-full bg-white/80 border border-white rounded-2xl p-5 space-y-4 shadow-sm relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 shrink-0"><User size={16} /></div>
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-neutral-400">Nama Lengkap</p>
                  <p className="text-sm font-bold text-neutral-900 truncate">{submittedData?.full_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 shrink-0"><Mail size={16} /></div>
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-neutral-400">Alamat Email</p>
                  <p className="text-sm font-bold text-neutral-900 truncate">{submittedData?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-neutral-100">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                  <span className="font-serif font-bold text-sm">#</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-400">Kode Sertifikat</p>
                  <p className="text-sm font-mono font-bold tracking-widest text-primary-600">{submittedData?.certificate_code}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Registration form
  return (
    <div className="min-h-screen bg-neutral-50 relative flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-br from-primary-600 to-teal-400 z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto">
        {/* Event Header */}
        <div className="text-center mb-8 px-4">
          <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-md rounded-2xl mb-4 shadow-lg shadow-black/5 ring-1 ring-white/30">
            <Calendar className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 drop-shadow-sm">{event?.name}</h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-primary-50 text-sm font-medium">
            <span className="flex items-center gap-1.5 bg-black/10 px-3 py-1 rounded-full"><User size={14} /> {event?.organizer}</span>
            <span className="flex items-center gap-1.5 bg-black/10 px-3 py-1 rounded-full"><MapPin size={14} /> {event?.location || 'Online'}</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl border border-white/60 bg-white/80">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-neutral-900">Formulir Pendaftaran</h2>
            <p className="text-sm text-neutral-500 mt-1">Lengkapi data diri Anda untuk mendapatkan sertifikat.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="p-4 bg-danger-50 border border-danger-100 rounded-xl flex items-start gap-3">
                <AlertTriangle size={20} className="text-danger-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-danger-700">{errors.submit}</p>
              </div>
            )}

            <Input
              id="fullName"
              label="Nama Lengkap Sesuai Identitas *"
              icon={<User size={18} />}
              placeholder="Contoh: Budi Santoso, S.Kom"
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
              label="Alamat Email Aktif *"
              icon={<Mail size={18} />}
              type="email"
              placeholder="contoh@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
              }}
              error={errors.email}
              hint="Sertifikat akan dikirimkan ke email ini."
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Foto Selfie Kehadiran *
              </label>
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:border-primary-300 transition-colors">
                <FileUploadBox
                  accept="image/jpeg,image/jpg,image/png"
                  maxSizeMB={MAX_SELFIE_SIZE_MB}
                  onFileSelect={handleSelfieSelect}
                  label="Ambil / Upload Selfie"
                  hint="JPG atau PNG. Maks 5 MB."
                  preview={selfiePreview}
                  icon="camera"
                  disabled={isCompressing}
                />
              </div>
              {isCompressing && (
                <p className="mt-2 text-sm text-primary-600 flex items-center gap-2 font-medium">
                  <Loader2 size={16} className="animate-spin" /> Sedang memproses gambar...
                </p>
              )}
              {errors.selfie && (
                <p className="mt-2 text-sm font-medium text-danger-600">{errors.selfie}</p>
              )}
            </div>

            {/* Peringatan */}
            <div className="p-4 bg-amber-50/80 border border-amber-200/50 rounded-xl flex items-start gap-3">
              <AlertTriangle size={20} className="shrink-0 mt-0.5 text-amber-500" />
              <p className="text-sm text-amber-800 leading-relaxed">
                <strong>Penting:</strong> Pastikan ejaan nama dan gelar sudah benar. Nama akan dicetak persis seperti yang Anda masukkan pada sertifikat digital.
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30"
              size="lg"
              isLoading={isSubmitting}
              disabled={isCompressing}
              icon={!isSubmitting ? <CheckCircle2 size={20} /> : undefined}
            >
              Daftar & Kirim
            </Button>
          </form>
        </div>
        
        {/* Footer */}
        <p className="text-center text-xs text-neutral-500 mt-8 font-medium">
          Ditenagai oleh <span className="font-bold text-primary-600">Certifora</span>
        </p>
      </div>
    </div>
  )
}
