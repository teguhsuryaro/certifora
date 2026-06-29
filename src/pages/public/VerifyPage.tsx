import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, XCircle, ShieldCheck, ShieldAlert, User, Calendar, MapPin, Hash, Building2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface VerificationData {
  isValid: boolean
  participantName?: string
  eventName?: string
  organizer?: string
  eventDate?: string
  certificateCode?: string
}

export default function VerifyPage() {
  const { kodeSertifikat } = useParams<{ kodeSertifikat: string }>()
  const [data, setData] = useState<VerificationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (kodeSertifikat) {
      verifyCertificate(kodeSertifikat)
    }
  }, [kodeSertifikat])

  const verifyCertificate = async (code: string) => {
    setIsLoading(true)
    try {
      // Query certificate_codes → participants → events
      const { data: certData, error } = await supabase
        .from('certificate_codes')
        .select(`
          code,
          participant:participants(full_name, certificate_code),
          event:events(name, organizer, event_date)
        `)
        .eq('code', code.toUpperCase())
        .single()

      if (error || !certData) {
        setData({ isValid: false })
        return
      }

      const participant = certData.participant as any
      const event = certData.event as any

      setData({
        isValid: true,
        participantName: participant?.full_name,
        eventName: event?.name,
        organizer: event?.organizer,
        eventDate: event?.event_date,
        certificateCode: certData.code,
      })
    } catch {
      setData({ isValid: false })
    } finally {
      setIsLoading(false)
    }
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center animate-in fade-in duration-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-neutral-500 font-medium tracking-wide">Memverifikasi sertifikat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-[40vh] bg-gradient-to-br from-primary-600 to-teal-400 z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="w-full max-w-2xl z-10 relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-md rounded-2xl mb-4 shadow-lg shadow-black/5 ring-1 ring-white/30">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">Verifikasi Sertifikat</h1>
          <p className="text-primary-50 mt-2 font-medium">Sistem Validasi Dokumen Digital Certifora</p>
        </div>

        {/* Verification Card */}
        <div className="glass-card rounded-3xl shadow-2xl border border-white/60 bg-white/90 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Status Header */}
          {data?.isValid ? (
            <div className="bg-gradient-to-b from-success-50 to-white p-8 text-center flex flex-col items-center border-b border-neutral-100">
              <div className="relative">
                <div className="absolute inset-0 bg-success-200 rounded-full blur-xl opacity-50" />
                <ShieldCheck size={72} className="text-success-500 relative z-10 mb-4" />
              </div>
              <h2 className="text-3xl font-extrabold text-success-700 tracking-tight">Sertifikat Valid</h2>
              <p className="text-success-600 mt-2 font-medium">
                Dokumen ini resmi dan terdaftar dalam sistem.
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-b from-danger-50 to-white p-8 text-center flex flex-col items-center border-b border-neutral-100">
              <div className="relative">
                <div className="absolute inset-0 bg-danger-200 rounded-full blur-xl opacity-50" />
                <ShieldAlert size={72} className="text-danger-500 relative z-10 mb-4" />
              </div>
              <h2 className="text-3xl font-extrabold text-danger-700 tracking-tight">Tidak Ditemukan</h2>
              <p className="text-danger-600 mt-2 font-medium">
                Kode sertifikat "{kodeSertifikat}" tidak terdaftar dalam sistem kami.
              </p>
            </div>
          )}

          {/* Details (hanya tampil jika valid) */}
          {data?.isValid && (
            <div className="p-8">
              <dl className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2 p-4 bg-primary-50/50 rounded-2xl border border-primary-100">
                  <dt className="text-xs font-bold text-primary-600 uppercase tracking-wider flex items-center gap-2 mb-1">
                    <User size={14} /> Nama Peserta
                  </dt>
                  <dd className="text-2xl font-bold text-neutral-900">
                    {data.participantName}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                    <Building2 size={14} /> Nama Event
                  </dt>
                  <dd className="font-semibold text-neutral-900">
                    {data.eventName}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                    <MapPin size={14} /> Penyelenggara
                  </dt>
                  <dd className="font-semibold text-neutral-900">
                    {data.organizer}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                    <Calendar size={14} /> Tanggal Event
                  </dt>
                  <dd className="font-semibold text-neutral-900">
                    {data.eventDate && new Date(data.eventDate).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                    <Hash size={14} /> Kode Sertifikat
                  </dt>
                  <dd className="font-mono text-lg font-bold text-primary-600 tracking-wide">
                    {data.certificateCode}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {/* Footer Branding */}
        <p className="text-center text-sm text-neutral-500 mt-8 font-medium">
          Diverifikasi dengan aman oleh <span className="font-bold text-primary-600">Certifora</span>
        </p>
      </div>
    </div>
  )
}
