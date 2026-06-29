import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEventStore } from '../../stores/eventStore'
import { useAuthStore } from '../../stores/authStore'
import { Button, StatusBadge, ConfirmModal, PageLoading } from '../../components/ui'
import { getEventRegistrationUrl } from '../../services/eventService'
import type { EventStatus } from '../../types/database'
import QRCode from 'qrcode'
import { AlertTriangle, Palette, Users, FileDown } from 'lucide-react'

// Helper: status badge mapping (reuable dari dashboard)
function getStatusInfo(status: EventStatus) {
  const map: Record<EventStatus, { variant: 'success' | 'warning' | 'danger' | 'neutral'; label: string }> = {
    draft: { variant: 'warning', label: 'Draft' },
    active: { variant: 'success', label: 'Aktif' },
    temporarily_closed: { variant: 'neutral', label: 'Ditutup Sementara' },
    permanently_closed: { variant: 'danger', label: 'Ditutup Permanen' },
  }
  return map[status]
}

// Status transitions yang diperbolehkan
function getAllowedTransitions(currentStatus: EventStatus): { status: EventStatus; label: string; variant: 'primary' | 'danger' | 'secondary' }[] {
  switch (currentStatus) {
    case 'draft':
      return [{ status: 'active', label: 'Aktifkan Event', variant: 'primary' }]
    case 'active':
      return [
        { status: 'temporarily_closed', label: 'Tutup Sementara', variant: 'secondary' },
        { status: 'permanently_closed', label: 'Tutup Permanen', variant: 'danger' },
      ]
    case 'temporarily_closed':
      return [
        { status: 'active', label: 'Buka Kembali', variant: 'primary' },
        { status: 'permanently_closed', label: 'Tutup Permanen', variant: 'danger' },
      ]
    case 'permanently_closed':
      return [] // Tidak bisa diubah lagi
  }
}

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { currentEvent, isLoading, fetchEventById, updateEventStatus } = useEventStore()
  const { admin } = useAuthStore()

  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean
    newStatus: EventStatus | null
    label: string
  }>({ isOpen: false, newStatus: null, label: '' })
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (eventId) fetchEventById(eventId)
  }, [eventId, fetchEventById])

  // Generate QR code
  useEffect(() => {
    if (currentEvent?.id) {
      const url = getEventRegistrationUrl(currentEvent.id)
      QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: { dark: '#111827', light: '#ffffff' },
      }).then(setQrDataUrl)
    }
  }, [currentEvent?.id])

  const handleStatusChange = async () => {
    if (!eventId || !statusModal.newStatus || !currentEvent) return
    setIsUpdating(true)
    try {
      await updateEventStatus(eventId, currentEvent.status, statusModal.newStatus, admin?.id)
      setStatusModal({ isOpen: false, newStatus: null, label: '' })
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading || !currentEvent) return <PageLoading />

  const event = currentEvent
  const statusInfo = getStatusInfo(event.status)
  const transitions = getAllowedTransitions(event.status)
  const registrationUrl = getEventRegistrationUrl(event.id)
  const participantCount = event.participants?.[0]?.count || 0

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-neutral-900">{event.name}</h1>
            <StatusBadge variant={statusInfo.variant}>{statusInfo.label}</StatusBadge>
          </div>
          <p className="text-neutral-500">{event.organizer} • {new Date(event.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Status Actions */}
        <div className="flex gap-2 flex-wrap">
          {transitions.map((t) => (
            <Button
              key={t.status}
              variant={t.variant === 'primary' ? 'primary' : t.variant === 'danger' ? 'secondary' : 'secondary'}
              size="sm"
              onClick={() => setStatusModal({ isOpen: true, newStatus: t.status, label: t.label })}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {(!event.certificate_templates?.[0]?.template_file_path) && (
        <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-4 text-amber-800 rounded-r-lg shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-amber-500 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Template sertifikat belum diatur</p>
              <p className="text-xs mt-1 opacity-90">
                Anda tidak dapat mengirim sertifikat kepada peserta sebelum template PDF diunggah. 
                <Link to={`/admin/events/${event.id}/template`} className="font-bold underline ml-1 hover:text-amber-900 transition-colors">
                  Atur sekarang →
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column — Info & Navigation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Navigation Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              to={`/admin/events/${eventId}/template`}
              className="glass-card p-4 sm:p-5 hover:shadow-card hover:border-primary-300 transition-all text-center sm:text-left flex flex-col items-center sm:items-start"
            >
              <Palette size={24} className="mb-2 text-primary-600" />
              <h3 className="font-semibold text-neutral-900">Template Sertifikat</h3>
              <p className="text-sm text-neutral-500 mt-1">Atur template & posisi teks</p>
            </Link>

            <Link
              to={`/admin/events/${eventId}/participants`}
              className="glass-card p-4 sm:p-5 hover:shadow-card hover:border-primary-300 transition-all text-center sm:text-left flex flex-col items-center sm:items-start"
            >
              <Users size={24} className="mb-2 text-primary-600" />
              <h3 className="font-semibold text-neutral-900">Peserta</h3>
              <p className="text-sm text-neutral-500 mt-1">{participantCount} peserta terdaftar</p>
            </Link>

            <Link
              to={`/admin/events/${eventId}/export`}
              className="glass-card p-4 sm:p-5 hover:shadow-card hover:border-primary-300 transition-all text-center sm:text-left flex flex-col items-center sm:items-start"
            >
              <span className="text-2xl mb-2 block">📥</span>
              <h3 className="font-semibold text-neutral-900">Export Data</h3>
              <p className="text-sm text-neutral-500 mt-1">Excel & PDF</p>
            </Link>
          </div>

          {/* Event Details Card */}
          <div className="glass-card p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Detail Event</h2>
            <dl className="space-y-3">
              {event.description && (
                <div>
                  <dt className="text-sm text-neutral-500">Deskripsi</dt>
                  <dd className="text-neutral-900 mt-0.5">{event.description}</dd>
                </div>
              )}
              {event.location && (
                <div>
                  <dt className="text-sm text-neutral-500">Lokasi</dt>
                  <dd className="text-neutral-900 mt-0.5">{event.location}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-neutral-500">Prefix Sertifikat</dt>
                <dd className="font-mono text-neutral-900 mt-0.5">{event.prefix}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right Column — QR Code */}
        <div className="space-y-6">
          <div className="glass-card p-4 sm:p-6 text-center">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">QR Code Registrasi</h2>

            {event.status === 'active' ? (
              <>
                {qrDataUrl && (
                  <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 mx-auto mb-4" />
                )}
                <p className="text-xs text-neutral-500 break-all mb-4">{registrationUrl}</p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(registrationUrl)}
                  >
                    Salin Link
                  </Button>
                  {qrDataUrl && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const a = document.createElement('a')
                        a.href = qrDataUrl
                        a.download = `qr-${event.prefix}.png`
                        a.click()
                      }}
                    >
                      Unduh QR
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="py-8">
                <span className="text-4xl mb-3 block">🔒</span>
                <p className="text-neutral-500 text-sm">
                  QR Code hanya aktif saat event berstatus <strong>Aktif</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Change Confirmation Modal */}
      <ConfirmModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, newStatus: null, label: '' })}
        onConfirm={handleStatusChange}
        title="Ubah Status Event"
        message={
          statusModal.newStatus === 'permanently_closed'
            ? `Apakah Anda yakin ingin menutup permanen event ini? Event tidak bisa dibuka kembali setelah ditutup permanen.`
            : `Apakah Anda yakin ingin ${statusModal.label?.toLowerCase()}?`
        }
        confirmText={statusModal.label || 'Konfirmasi'}
        variant={statusModal.newStatus === 'permanently_closed' ? 'danger' : 'primary'}
        isLoading={isUpdating}
      />
    </div>
  )
}
