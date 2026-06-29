import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useEventStore } from '../../stores/eventStore'
import { useAuthStore } from '../../stores/authStore'
import { getEmailQuota, type EmailQuota } from '../../services/emailQuotaService'
import { supabase } from '../../lib/supabase'
import { Button, StatusBadge, EmptyState, PageLoading } from '../../components/ui'
import { Calendar, Users, AlertTriangle, Building2, Zap, Mail, Plus } from 'lucide-react'
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
  const { admin } = useAuthStore()
  const { events, isLoading, fetchEvents } = useEventStore()
  const [statusFilter, setStatusFilter] = useState('all')
  const [quota, setQuota] = useState<EmailQuota | null>(null)
  const [totalEmailsSent, setTotalEmailsSent] = useState(0)

  useEffect(() => {
    fetchEvents()
    getEmailQuota().then(setQuota).catch(console.error)
    
    // Fetch total emails sent
    supabase
      .from('delivery_logs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'success')
      .then(({ count }) => {
        if (count !== null) setTotalEmailsSent(count)
      })
  }, [fetchEvents])

  const filteredEvents = statusFilter === 'all'
    ? events
    : events.filter((e) => e.status === statusFilter)

  if (isLoading && events.length === 0) {
    return <PageLoading />
  }

  // Calculated Stats
  const totalEvents = events.length
  const activeEvents = events.filter((e) => e.status === 'active').length
  const totalParticipants = events.reduce((sum, e) => sum + (e.participants?.[0]?.count || 0), 0)

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-neutral-500 mb-1">
            Selamat datang, {admin?.full_name?.split(' ')[0] || 'Admin'} 👋
          </p>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">Dashboard</h1>
        </div>
        <Link to="/admin/events/new" className="hidden sm:block">
          <Button variant="primary" icon={<Plus size={18} />}>
            Buat Event Baru
          </Button>
        </Link>
      </div>

      {/* Stats Grid (Baris Atas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <Calendar className="text-primary-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-neutral-500 font-medium">Total Event</p>
            <p className="text-2xl font-bold text-neutral-900">{totalEvents}</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-success-100 flex items-center justify-center shrink-0">
            <Zap className="text-success-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-neutral-500 font-medium">Event Aktif</p>
            <p className="text-2xl font-bold text-neutral-900">{activeEvents}</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <Users className="text-amber-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-neutral-500 font-medium">Total Peserta</p>
            <p className="text-2xl font-bold text-neutral-900">{totalParticipants}</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Mail className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-neutral-500 font-medium">Email Terkirim</p>
            <p className="text-2xl font-bold text-neutral-900">{totalEmailsSent}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area (Daftar Event) - 2 Kolom di Desktop */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900">Daftar Event</h2>
          </div>
          
          {/* Status Filter Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin">
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
            <div className="glass-card p-8">
              <EmptyState
                icon={<Calendar size={48} className="text-neutral-300" />}
                title="Belum ada event"
                description={statusFilter === 'all'
                  ? 'Mulai dengan membuat event pertama Anda'
                  : `Tidak ada event dengan status "${STATUS_FILTERS.find(f => f.value === statusFilter)?.label}"`
                }
                action={
                  statusFilter === 'all' ? (
                    <Link to="/admin/events/new">
                      <Button icon={<Plus size={16} />}>Buat Event Pertama</Button>
                    </Link>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredEvents.map((event) => {
                const badge = getStatusBadge(event.status)
                const participantCount = event.participants?.[0]?.count || 0

                return (
                  <div key={event.id} className="glass-card flex flex-col hover:shadow-card hover:border-primary-300 transition-all group overflow-hidden">
                    <div className="p-5 flex-1">
                      {/* Event Name + Status */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-semibold text-lg text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight">
                          {event.name}
                        </h3>
                        <StatusBadge variant={badge.variant}>
                          {badge.label}
                        </StatusBadge>
                      </div>

                      {/* Event Info */}
                      <div className="space-y-2 text-sm text-neutral-500 mb-4">
                        <p className="flex items-center gap-2"><Building2 size={16} className="shrink-0 text-neutral-400" /> {event.organizer}</p>
                        <p className="flex items-center gap-2">
                          <Calendar size={16} className="shrink-0 text-neutral-400" /> 
                          {new Date(event.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="flex items-center gap-2"><Users size={16} className="shrink-0 text-neutral-400" /> {participantCount} peserta terdaftar</p>
                      </div>
                      
                      {/* Soft Alert */}
                      {(!event.certificate_templates?.[0]?.template_file_path) && (
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-2 text-xs text-amber-800 rounded-r-md">
                          <div className="flex items-start gap-1.5">
                            <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                            <span>Template belum diatur.</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Aksi Cepat */}
                    <Link
                      to={`/admin/events/${event.id}`}
                      className="bg-neutral-50/50 border-t border-neutral-100 p-3 text-sm text-primary-600 font-medium text-center hover:bg-primary-50 transition-colors block w-full"
                    >
                      Lihat Detail &rarr;
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar Kanan (Info Cards) - 1 Kolom di Desktop */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-neutral-900">Informasi</h2>
          
          {/* Quota Card Widget */}
          {quota && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-neutral-900 mb-4">Kuota Email</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-neutral-500">Harian</span>
                    <span className="font-bold text-neutral-900">{quota.dailySent} <span className="text-neutral-400 font-normal">/ {quota.dailyLimit}</span></span>
                  </div>
                  <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${quota.dailySent / quota.dailyLimit > 0.9 ? 'bg-danger-500' : quota.dailySent / quota.dailyLimit > 0.7 ? 'bg-warning-500' : 'bg-primary-500'}`}
                      style={{ width: `${Math.min(100, (quota.dailySent / quota.dailyLimit) * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-neutral-500">Bulanan</span>
                    <span className="font-bold text-neutral-900">{quota.monthlySent} <span className="text-neutral-400 font-normal">/ {quota.monthlyLimit}</span></span>
                  </div>
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
        </div>
      </div>

      {/* Mobile FAB (Floating Action Button) */}
      <Link
        to="/admin/events/new"
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-all hover:scale-110 sm:hidden z-20"
      >
        <Plus size={24} />
      </Link>
    </div>
  )
}
