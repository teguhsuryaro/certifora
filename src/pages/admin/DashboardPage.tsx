import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useEventStore } from '../../stores/eventStore'
import { getEmailQuota, type EmailQuota } from '../../services/emailQuotaService'
import { Button, StatusBadge, EmptyState, PageLoading } from '../../components/ui'
import { Calendar, Users, AlertTriangle, Building2 } from 'lucide-react'
import type { EventStatus } from '../../types/database'

// Helper: mapping status ke badge
function getStatusBadge(status: EventStatus) {
  const map: Record<EventStatus, { variant: 'success' | 'warning' | 'danger' | 'neutral'; label: string }> = {
    draft: { variant: 'warning', label: 'Draft' },
    active: { variant: 'success', label: 'Aktif' },
    temporarily_closed: { variant: 'neutral', label: 'Ditutup Sementara' },
    permanently_closed: { variant: 'danger', label: 'Ditutup Permanen' },
  }
  return map[status]
}

// Filter options
const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Aktif' },
  { value: 'temporarily_closed', label: 'Ditutup Sementara' },
  { value: 'permanently_closed', label: 'Ditutup Permanen' },
]

export default function DashboardPage() {
  const { events, isLoading, fetchEvents } = useEventStore()
  const [statusFilter, setStatusFilter] = useState('all')
  const [quota, setQuota] = useState<EmailQuota | null>(null)

  useEffect(() => {
    fetchEvents()
    getEmailQuota().then(setQuota).catch(console.error)
  }, [fetchEvents])

  const filteredEvents = statusFilter === 'all'
    ? events
    : events.filter((e) => e.status === statusFilter)

  if (isLoading && events.length === 0) {
    return <PageLoading />
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-500 mt-1">Kelola semua event sertifikat Anda</p>
        </div>
        <Link to="/admin/events/new">
          <Button variant="primary" icon={<span>＋</span>}>
            Buat Event Baru
          </Button>
        </Link>
      </div>

      {/* Quota Card */}
      {quota && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          <div className="glass-card p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">Kuota Harian</p>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-bold text-neutral-900">{quota.dailySent}</span>
                <span className="text-sm text-neutral-500">/ {quota.dailyLimit}</span>
              </div>
            </div>
            <div className="w-full">
              <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${quota.dailySent / quota.dailyLimit > 0.9 ? 'bg-danger-500' : quota.dailySent / quota.dailyLimit > 0.7 ? 'bg-warning-500' : 'bg-primary-500'}`}
                  style={{ width: `${Math.min(100, (quota.dailySent / quota.dailyLimit) * 100)}%` }}
                />
              </div>
            </div>
          </div>
          <div className="glass-card p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">Kuota Bulanan</p>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-bold text-neutral-900">{quota.monthlySent}</span>
                <span className="text-sm text-neutral-500">/ {quota.monthlyLimit}</span>
              </div>
            </div>
            <div className="w-full">
              <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${quota.monthlySent / quota.monthlyLimit > 0.9 ? 'bg-danger-500' : quota.monthlySent / quota.monthlyLimit > 0.7 ? 'bg-warning-500' : 'bg-primary-500'}`}
                  style={{ width: `${Math.min(100, (quota.monthlySent / quota.monthlyLimit) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
              ${statusFilter === filter.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
              }
            `}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Event Grid */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Belum ada event"
          description={statusFilter === 'all'
            ? 'Mulai dengan membuat event pertama Anda'
            : `Tidak ada event dengan status "${STATUS_FILTERS.find(f => f.value === statusFilter)?.label}"`
          }
          action={
            statusFilter === 'all' ? (
              <Link to="/admin/events/new">
                <Button>Buat Event Pertama</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEvents.map((event) => {
            const badge = getStatusBadge(event.status)
            const participantCount = event.participants?.[0]?.count || 0

            return (
              <Link
                key={event.id}
                to={`/admin/events/${event.id}`}
                className="block glass-card p-4 sm:p-5 hover:shadow-card hover:border-primary-300 transition-all group"
              >
                {/* Event Name + Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {event.name}
                  </h3>
                  <StatusBadge variant={badge.variant}>
                    {badge.label}
                  </StatusBadge>
                </div>

                {/* Event Info */}
                <div className="space-y-1.5 text-sm text-neutral-500">
                  <p className="flex items-center gap-1.5"><Calendar size={14} className="shrink-0" /> {new Date(event.event_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</p>
                  <p className="flex items-center gap-1.5"><Building2 size={14} className="shrink-0" /> {event.organizer}</p>
                  <p className="flex items-center gap-1.5"><Users size={14} className="shrink-0" /> {participantCount} peserta</p>
                </div>

                {/* Aksi Cepat */}
                <div className="mt-4 flex flex-col gap-3">
                  {(!event.certificate_templates?.[0]?.template_file_path) && (
                    <div 
                      className="bg-amber-50 border-l-4 border-amber-400 p-2 text-xs text-amber-800 rounded-r-md"
                      onClick={(e) => { e.preventDefault(); window.location.href = `/admin/events/${event.id}/template`; }}
                    >
                      <div className="flex items-start gap-1.5">
                      <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <span>
                          Template belum diatur. <span className="font-semibold underline cursor-pointer">Atur sekarang →</span>
                        </span>
                      </div>
                    </div>
                  )}
                  <span className="text-xs text-primary-600 font-medium">
                    Kelola →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Mobile FAB (Floating Action Button) */}
      <Link
        to="/admin/events/new"
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-primary-700 transition-colors sm:hidden z-20"
      >
        ＋
      </Link>
    </div>
  )
}
