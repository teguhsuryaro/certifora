import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-neutral-500">Memverifikasi sertifikat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Verification Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          {/* Status Header */}
          {data?.isValid ? (
            <div className="bg-success-50 border-b border-success-100 p-6 text-center">
              <span className="text-5xl block mb-3">✅</span>
              <h1 className="text-xl font-bold text-success-700">Sertifikat Valid</h1>
              <p className="text-sm text-success-600 mt-1">
                Sertifikat ini terdaftar dan terverifikasi
              </p>
            </div>
          ) : (
            <div className="bg-danger-50 border-b border-danger-100 p-6 text-center">
              <span className="text-5xl block mb-3">❌</span>
              <h1 className="text-xl font-bold text-danger-700">Sertifikat Tidak Ditemukan</h1>
              <p className="text-sm text-danger-600 mt-1">
                Kode sertifikat "{kodeSertifikat}" tidak ditemukan dalam sistem
              </p>
            </div>
          )}

          {/* Details (hanya tampil jika valid) */}
          {data?.isValid && (
            <div className="p-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Nama Peserta
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-neutral-900">
                    {data.participantName}
                  </dd>
                </div>

                <div className="border-t border-neutral-100 pt-4">
                  <dt className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Nama Event
                  </dt>
                  <dd className="mt-1 text-neutral-900">
                    {data.eventName}
                  </dd>
                </div>

                <div className="border-t border-neutral-100 pt-4">
                  <dt className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Penyelenggara
                  </dt>
                  <dd className="mt-1 text-neutral-900">
                    {data.organizer}
                  </dd>
                </div>

                <div className="border-t border-neutral-100 pt-4">
                  <dt className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Tanggal Event
                  </dt>
                  <dd className="mt-1 text-neutral-900">
                    {data.eventDate && new Date(data.eventDate).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </dd>
                </div>

                <div className="border-t border-neutral-100 pt-4">
                  <dt className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Kode Sertifikat
                  </dt>
                  <dd className="mt-1 font-mono text-lg font-semibold text-neutral-900 tracking-wide">
                    {data.certificateCode}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {/* Footer Branding */}
        <p className="text-center text-xs text-neutral-400 mt-6">
          Diverifikasi oleh <span className="font-medium text-primary-500">Certifora</span>
        </p>
      </div>
    </div>
  )
}
