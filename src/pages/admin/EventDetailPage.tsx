import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEventStore } from '../../stores/eventStore'
import { useAuthStore } from '../../stores/authStore'
import { getEmailQuota, type EmailQuota } from '../../services/emailQuotaService'
import { getEventRegistrationUrl } from '../../services/eventService'
import { Button, StatusBadge, ConfirmModal, PageLoading } from '../../components/ui'
import type { EventStatus } from '../../types/database'
import QRCode from 'qrcode'
import { 
  AlertTriangle, Palette, Users, FileDown, 
  ChevronRight, Building2, Calendar, Clock, 
  MapPin, Tag, Info, Send, Copy, ShieldAlert,
  MoreVertical
} from 'lucide-react'

// Helper: status badge mapping
function getStatusInfo(status: EventStatus) {
  const map: Record<EventStatus, { variant: 'success' | 'warning' | 'danger' | 'neutral'; label: string }> = {
    draft: { variant: 'warning', label: 'Draft' },
    active: { variant: 'success', label: 'Aktif' },
    temporarily_closed: { variant: 'neutral', label: 'Ditutup Sementara' },
    permanently_closed: { variant: 'danger', label: 'Ditutup Permanen' },
  }
  return map[status]
}

// Status transitions
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
      return []
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
  
  const [activeTab, setActiveTab] = useState<'info' | 'send'>('info')
  const [quota, setQuota] = useState<EmailQuota | null>(null)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)

  useEffect(() => {
    if (eventId) fetchEventById(eventId)
    getEmailQuota().then(setQuota).catch(console.error)
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
      setShowStatusDropdown(false)
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
  const isTemplateReady = !!event.certificate_templates?.[0]?.template_file_path

  const TABS = [
    { id: 'info', label: 'Info Event', icon: <Info size={18} /> },
    { id: 'participants', label: 'Data Peserta', icon: <Users size={18} />, href: `/admin/events/${eventId}/participants` },
    { id: 'template', label: 'Template Editor', icon: <Palette size={18} />, href: `/admin/events/${eventId}/template` },
    { id: 'export', label: 'Export Data', icon: <FileDown size={18} />, href: `/admin/events/${eventId}/export` },
    { id: 'send', label: 'Kirim Sertifikat', icon: <Send size={18} /> },
  ]

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-neutral-500 mb-6">
        <Link to="/admin/dashboard" className="hover:text-primary-600 transition-colors">Dashboard</Link>
        <ChevronRight size={16} className="mx-2 shrink-0" />
        <span className="text-neutral-900 font-medium truncate">{event.name}</span>
      </nav>

      {/* Header Event */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">{event.name}</h1>
          <StatusBadge variant={statusInfo.variant}>{statusInfo.label}</StatusBadge>
        </div>

        {/* Kontrol Status */}
        {transitions.length > 0 && (
          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              icon={<ShieldAlert size={18} />}
            >
              Ubah Status
            </Button>
            
            {showStatusDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-modal z-20 py-1 overflow-hidden">
                {transitions.map((t) => (
                  <button
                    key={t.status}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      t.variant === 'danger' ? 'text-danger-600 hover:bg-danger-50' : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                    onClick={() => setStatusModal({ isOpen: true, newStatus: t.status, label: t.label })}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Soft Alert Template */}
      {!isTemplateReady && (
        <div className="mb-8 glass-card border-l-4 border-l-amber-500 p-4 shadow-sm flex items-start gap-3">
          <AlertTriangle size={24} className="text-amber-500 shrink-0" />
          <div>
            <h3 className="font-semibold text-neutral-900 text-sm">Template sertifikat belum diatur</h3>
            <p className="text-sm text-neutral-600 mt-1">
              Sertifikat tidak dapat dikirim sebelum Anda mengunggah template PDF. 
              <Link to={`/admin/events/${eventId}/template`} className="font-bold text-amber-600 hover:text-amber-700 underline ml-1 transition-colors">
                Atur sekarang &rarr;
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Info Cards (Metadata Event) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <div className="glass-card p-3 flex flex-col items-center justify-center text-center">
          <Building2 size={20} className="text-neutral-400 mb-2" />
          <span className="text-xs text-neutral-500 font-medium mb-1">Penyelenggara</span>
          <span className="text-sm font-semibold text-neutral-900 line-clamp-1">{event.organizer}</span>
        </div>
        <div className="glass-card p-3 flex flex-col items-center justify-center text-center">
          <Calendar size={20} className="text-neutral-400 mb-2" />
          <span className="text-xs text-neutral-500 font-medium mb-1">Tanggal</span>
          <span className="text-sm font-semibold text-neutral-900 line-clamp-1">
            {new Date(event.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        <div className="glass-card p-3 flex flex-col items-center justify-center text-center">
          <Clock size={20} className="text-neutral-400 mb-2" />
          <span className="text-xs text-neutral-500 font-medium mb-1">Waktu</span>
          <span className="text-sm font-semibold text-neutral-900 line-clamp-1">{event.event_time ? event.event_time.slice(0, 5) : '-'}</span>
        </div>
        <div className="glass-card p-3 flex flex-col items-center justify-center text-center">
          <MapPin size={20} className="text-neutral-400 mb-2" />
          <span className="text-xs text-neutral-500 font-medium mb-1">Lokasi</span>
          <span className="text-sm font-semibold text-neutral-900 line-clamp-1">{event.location || '-'}</span>
        </div>
        <div className="glass-card p-3 flex flex-col items-center justify-center text-center">
          <Users size={20} className="text-primary-400 mb-2" />
          <span className="text-xs text-neutral-500 font-medium mb-1">Peserta</span>
          <span className="text-sm font-semibold text-primary-600 line-clamp-1">{participantCount}</span>
        </div>
        <div className="glass-card p-3 flex flex-col items-center justify-center text-center">
          <Tag size={20} className="text-neutral-400 mb-2" />
          <span className="text-xs text-neutral-500 font-medium mb-1">Prefix</span>
          <span className="text-sm font-mono font-semibold text-neutral-900 line-clamp-1">{event.prefix}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-neutral-200 mb-8 overflow-x-auto scrollbar-thin">
        <div className="flex w-max min-w-full">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            const baseClass = "flex items-center gap-2 py-4 px-6 text-sm font-medium transition-colors border-b-2 whitespace-nowrap"
            
            if (tab.href) {
              return (
                <Link key={tab.id} to={tab.href} className={`${baseClass} border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300`}>
                  {tab.icon} {tab.label}
                </Link>
              )
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'info' | 'send')}
                className={`${baseClass} ${
                  isActive 
                    ? 'border-primary-600 text-primary-600' 
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'info' && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column — Info Detail */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-neutral-900">Deskripsi Event</h2>
                </div>
                {event.description ? (
                  <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">{event.description}</p>
                ) : (
                  <p className="text-neutral-400 italic">Tidak ada deskripsi.</p>
                )}
              </div>
            </div>

            {/* Right Column — QR Code */}
            <div className="space-y-6">
              <div className="glass-card p-6 text-center">
                <h2 className="text-lg font-bold text-neutral-900 mb-6">QR Code Registrasi</h2>

                {event.status === 'active' ? (
                  <>
                    <div className="bg-white p-4 rounded-xl shadow-sm inline-block mb-6 border border-neutral-100">
                      {qrDataUrl ? (
                        <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
                      ) : (
                        <div className="w-48 h-48 bg-neutral-100 animate-pulse rounded-lg" />
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => navigator.clipboard.writeText(registrationUrl)}
                        icon={<Copy size={16} />}
                        className="w-full"
                      >
                        Copy Link
                      </Button>
                      
                      {qrDataUrl && (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            const a = document.createElement('a')
                            a.href = qrDataUrl
                            a.download = `qr-${event.prefix}.png`
                            a.click()
                          }}
                          className="w-full text-sm underline"
                        >
                          Unduh Gambar QR
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="py-12 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                    <span className="text-4xl mb-4 block">🔒</span>
                    <p className="text-neutral-500 text-sm px-4">
                      QR Code hanya aktif saat event berstatus <strong className="text-neutral-900">Aktif</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'send' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-6">
                <h2 className="text-lg font-bold text-neutral-900 mb-6">Kontrol Pengiriman</h2>
                
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 mb-6">
                  <p className="text-sm text-neutral-600 mb-4">
                    Kirim sertifikat PDF secara otomatis ke semua peserta terdaftar melalui email. 
                    Pastikan template dan daftar peserta sudah final.
                  </p>
                  <Button 
                    variant="primary" 
                    icon={<Send size={18} />} 
                    disabled={!isTemplateReady || participantCount === 0}
                    className="w-full sm:w-auto"
                  >
                    Kirim Semua Sertifikat
                  </Button>
                  
                  {(!isTemplateReady || participantCount === 0) && (
                    <p className="text-xs text-danger-600 mt-2">
                      {!isTemplateReady ? '* Template belum diatur. ' : ''}
                      {participantCount === 0 ? '* Belum ada peserta terdaftar.' : ''}
                    </p>
                  )}
                </div>
                
                <h3 className="font-semibold text-neutral-900 mb-3">Status Pengiriman</h3>
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <div className="bg-neutral-50 p-8 text-center">
                    <p className="text-neutral-500 text-sm">Belum ada proses pengiriman berjalan.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {quota && (
                <div className="glass-card p-6">
                  <h2 className="text-lg font-bold text-neutral-900 mb-6">Informasi Kuota</h2>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-neutral-500">Kuota Harian</span>
                        <span className="font-bold text-neutral-900">{quota.dailySent} <span className="text-neutral-400 font-normal">/ {quota.dailyLimit}</span></span>
                      </div>
                      <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${quota.dailySent / quota.dailyLimit > 0.9 ? 'bg-danger-500' : quota.dailySent / quota.dailyLimit > 0.7 ? 'bg-warning-500' : 'bg-primary-500'}`}
                          style={{ width: `${Math.min(100, (quota.dailySent / quota.dailyLimit) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-neutral-500">Kuota Bulanan</span>
                        <span className="font-bold text-neutral-900">{quota.monthlySent} <span className="text-neutral-400 font-normal">/ {quota.monthlyLimit}</span></span>
                      </div>
                      <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${quota.monthlySent / quota.monthlyLimit > 0.9 ? 'bg-danger-500' : quota.monthlySent / quota.monthlyLimit > 0.7 ? 'bg-warning-500' : 'bg-primary-500'}`}
                          style={{ width: `${Math.min(100, (quota.monthlySent / quota.monthlyLimit) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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
            : `Apakah Anda yakin ingin mengubah status menjadi ${statusModal.label?.toLowerCase()}?`
        }
        confirmText={statusModal.label || 'Konfirmasi'}
        variant={statusModal.newStatus === 'permanently_closed' ? 'danger' : 'primary'}
        isLoading={isUpdating}
      />
    </div>
  )
}
