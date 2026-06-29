import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as participantService from '../../services/participantService'
import * as emailService from '../../services/emailService'
import * as templateService from '../../services/templateService'
import { getEmailQuota, type EmailQuota } from '../../services/emailQuotaService'
import { supabase } from '../../lib/supabase'
import { Button, StatusBadge, EmptyState, PageLoading, Input, ConfirmModal } from '../../components/ui'
import { SendProgressModal } from '../../components/shared/SendProgressModal'
import { Users, AlertTriangle, Search, ChevronRight, User, Mail, Tag, Send, Trash2, CheckSquare } from 'lucide-react'
import type { DeliveryStatus } from '../../types/database'

function getDeliveryBadge(status: DeliveryStatus) {
  const map: Record<DeliveryStatus, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
    pending: { variant: 'warning', label: 'Belum Dikirim' },
    success: { variant: 'success', label: 'Terkirim' },
    failed: { variant: 'danger', label: 'Gagal' },
  }
  return map[status]
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'pending', label: 'Belum Dikirim' },
  { value: 'success', label: 'Terkirim' },
  { value: 'failed', label: 'Gagal' },
]

export default function ParticipantsPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const [participants, setParticipants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isTemplateReady, setIsTemplateReady] = useState(false)
  const [quota, setQuota] = useState<EmailQuota | null>(null)
  
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [confirmSendAll, setConfirmSendAll] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendProgress, setSendProgress] = useState({
    total: 0, sent: 0, failed: 0, skipped: 0,
    currentName: '', isComplete: false, dailyLimitReached: false,
  })

  useEffect(() => {
    if (eventId) loadParticipants()
  }, [eventId])

  const loadParticipants = async () => {
    setIsLoading(true)
    try {
      const [data, templateReady, q] = await Promise.all([
        participantService.fetchParticipants(eventId!),
        templateService.isTemplateReady(eventId!),
        getEmailQuota()
      ])
      
      const pData = data || []
      
      // Fetch signed urls for selfies in bulk
      const selfiePaths = pData.map(p => p.selfie_path).filter(Boolean) as string[]
      let signedUrlMap: Record<string, string> = {}
      
      if (selfiePaths.length > 0) {
        const { data: signedUrls } = await supabase.storage.from('selfies').createSignedUrls(selfiePaths, 3600)
        if (signedUrls) {
          signedUrls.forEach((su, index) => {
            if (su.signedUrl) signedUrlMap[selfiePaths[index]] = su.signedUrl
          })
        }
      }
      
      const participantsWithSelfies = pData.map(p => ({
        ...p,
        selfieSignedUrl: p.selfie_path ? signedUrlMap[p.selfie_path] : null
      }))

      setParticipants(participantsWithSelfies)
      setIsTemplateReady(templateReady)
      setQuota(q)
      // reset selection
      setSelectedIds(new Set())
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter & search
  const filteredParticipants = participants.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.delivery_status === statusFilter
    const matchesSearch = searchQuery === '' ||
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.certificate_code.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const pendingCount = participants.filter(p => p.delivery_status === 'pending').length
  const successCount = participants.filter(p => p.delivery_status === 'success').length
  const failedCount = participants.filter(p => p.delivery_status === 'failed').length

  // Bulk actions handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredParticipants.map(p => p.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const handleSendSelected = async () => {
    setConfirmSendAll(false)
    setIsSending(true)
    
    // Only send to pending or failed from selected
    const selectedParticipants = participants.filter(
      p => selectedIds.has(p.id) && p.delivery_status !== 'success'
    )
    
    setSendProgress({
      total: selectedParticipants.length, sent: 0, failed: 0, skipped: 0,
      currentName: '', isComplete: false, dailyLimitReached: false,
    })

    if (selectedParticipants.length === 0) {
      setIsSending(false)
      alert("Tidak ada peserta terpilih yang bisa dikirim (hanya status 'Belum Dikirim' atau 'Gagal' yang dikirim).")
      return
    }

    try {
      const [template, { data: eventData }] = await Promise.all([
        templateService.fetchTemplateByEventId(eventId!),
        supabase.from('events').select('name, organizer, event_email_settings(*)').eq('id', eventId).single()
      ])

      const emailSettings = eventData?.event_email_settings?.[0]

      if (!emailSettings) throw new Error('Email settings not found')

      await emailService.sendAllCertificates(
        selectedParticipants,
        template,
        emailSettings,
        eventData.name,
        eventData.organizer,
        (progress) => setSendProgress(progress)
      )

      await loadParticipants()
    } catch (error) {
      console.error('Batch send error:', error)
    }
  }



  if (isLoading) return <PageLoading />

  const isAllSelected = filteredParticipants.length > 0 && selectedIds.size === filteredParticipants.length
  const pendingSelectedCount = participants.filter(p => selectedIds.has(p.id) && p.delivery_status !== 'success').length

  return (
    <div className="max-w-7xl mx-auto pb-24 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 mt-4">
        <div>
          <p className="text-neutral-500">
            Total {participants.length} peserta terdaftar. <span className="font-medium text-success-600">{successCount} terkirim</span>, <span className="font-medium text-warning-600">{pendingCount} belum</span>, <span className="font-medium text-danger-600">{failedCount} gagal</span>.
          </p>
        </div>
        <div>
          <div className="flex flex-col items-end gap-1.5">
            {quota && (
              <div className="bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200 text-sm flex items-center gap-2">
                <Mail size={16} className="text-neutral-400" />
                <span className="text-neutral-600">Sisa Kuota:</span>
                <span className={`font-bold ${quota.dailyLimit - quota.dailySent < pendingCount ? 'text-danger-600' : 'text-primary-600'}`}>
                  {Math.max(0, quota.dailyLimit - quota.dailySent)}/{quota.dailyLimit}
                </span>
              </div>
            )}
            {!isTemplateReady && (
              <div className="text-xs bg-danger-50 text-danger-600 px-3 py-1.5 rounded-lg border border-danger-100 flex items-center gap-1.5 font-medium">
                <AlertTriangle size={14} /> Template PDF belum siap
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar Data */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-neutral-400" />
              </div>
              <input
                type="text"
                placeholder="Cari nama, email, kode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-neutral-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-shadow"
              />
            </div>
            
            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none snap-x pb-1 sm:pb-0">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`
                    px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all snap-start
                    ${statusFilter === f.value
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                      : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
                    }
                  `}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-sm font-medium text-neutral-500 whitespace-nowrap">
            Menampilkan {filteredParticipants.length} dari {participants.length} peserta
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredParticipants.length === 0 ? (
        <EmptyState
          icon={<Users size={48} className="text-neutral-300" />}
          title="Belum ada peserta"
          description={
            participants.length === 0
              ? 'Peserta akan muncul di sini setelah mendaftar via QR code pendaftaran.'
              : 'Tidak ada peserta yang sesuai dengan pencarian atau filter yang dipilih.'
          }
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-primary-50 border-b border-primary-100 text-primary-800">
                  <tr>
                    <th className="px-4 py-3.5 text-left w-12">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="font-semibold px-4 py-3.5 text-left">Peserta</th>
                    <th className="font-semibold px-4 py-3.5 text-left">Kontak</th>
                    <th className="font-semibold px-4 py-3.5 text-left">Status</th>
                    <th className="font-semibold px-4 py-3.5 text-left">Kode Sertifikat</th>
                    <th className="font-semibold px-4 py-3.5 text-left">Tanggal</th>
                    <th className="font-semibold px-4 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredParticipants.map((p, index) => {
                    const badge = getDeliveryBadge(p.delivery_status)
                    const isSelected = selectedIds.has(p.id)
                    return (
                      <tr 
                        key={p.id} 
                        className={`transition-colors hover:bg-primary-50/50 ${
                          isSelected ? 'bg-primary-50/30' : index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                            checked={isSelected}
                            onChange={() => handleSelectOne(p.id)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-neutral-200 overflow-hidden shrink-0 border border-neutral-100 shadow-sm">
                                {p.selfie_path ? (
                                  <img
                                    src={p.selfieSignedUrl || ''}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                  <User size={16} />
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-neutral-900">{p.full_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-neutral-600">{p.email}</td>
                        <td className="px-4 py-3">
                          <StatusBadge variant={badge.variant}>{badge.label}</StatusBadge>
                        </td>
                        <td className="px-4 py-3 font-mono text-neutral-500">{p.certificate_code}</td>
                        <td className="px-4 py-3 text-neutral-500">
                          {new Date(p.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to={`/admin/events/${eventId}/participants/${p.id}`}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-primary-600 hover:bg-primary-100 transition-colors"
                            title="Lihat Detail"
                          >
                            <ChevronRight size={18} />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List */}
          <div className="sm:hidden space-y-4">
            {/* Mobile Select All */}
            <div className="flex items-center gap-3 px-1 mb-2">
              <input 
                type="checkbox" 
                id="mobileSelectAll"
                className="w-4 h-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                checked={isAllSelected}
                onChange={handleSelectAll}
              />
              <label htmlFor="mobileSelectAll" className="text-sm font-medium text-neutral-700">
                Pilih Semua
              </label>
            </div>
            
            {filteredParticipants.map((p) => {
              const badge = getDeliveryBadge(p.delivery_status)
              const isSelected = selectedIds.has(p.id)
              return (
                <div key={p.id} className={`block glass-card p-4 transition-all relative ${isSelected ? 'ring-2 ring-primary-500 bg-primary-50/20' : 'hover:shadow-card'}`}>
                  <div className="absolute top-4 right-4">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      checked={isSelected}
                      onChange={() => handleSelectOne(p.id)}
                    />
                  </div>
                  
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-neutral-200 overflow-hidden shrink-0 border border-neutral-100 shadow-sm mt-1">
                      {p.selfie_path ? (
                        <img
                          src={p.selfieSignedUrl || ''}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <User size={20} />
                        </div>
                      )}
                    </div>
                    <div className="pr-8">
                      <h3 className="font-bold text-neutral-900 text-base mb-1">{p.full_name}</h3>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Mail size={14} className="shrink-0 text-neutral-400" />
                          <span className="truncate">{p.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Tag size={14} className="shrink-0 text-neutral-400" />
                          <span className="font-mono">{p.certificate_code}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-neutral-500">Status Pengiriman:</span>
                      <StatusBadge variant={badge.variant}>{badge.label}</StatusBadge>
                    </div>
                    <Link
                      to={`/admin/events/${eventId}/participants/${p.id}`}
                      className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Floating Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-xl animate-in slide-in-from-bottom-8 fade-in">
          <div className="bg-neutral-900 text-white p-3 sm:px-5 sm:py-3.5 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center font-bold">
                {selectedIds.size}
              </div>
              <span className="text-sm font-medium">Peserta dipilih</span>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="primary"
                className="flex-1 sm:flex-none border-none shadow-none"
                disabled={!isTemplateReady || pendingSelectedCount === 0}
                onClick={() => setConfirmSendAll(true)}
                icon={<Send size={16} />}
              >
                Kirim ({pendingSelectedCount})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        isOpen={confirmSendAll}
        onClose={() => setConfirmSendAll(false)}
        onConfirm={handleSendSelected}
        title="Kirim Sertifikat Massal"
        message={
          <div className="space-y-3">
            <p className="text-neutral-600">Akan memproses pengiriman sertifikat ke <strong>{pendingSelectedCount}</strong> peserta terpilih yang statusnya belum terkirim.</p>
            {quota && (quota.dailyLimit - quota.dailySent < pendingSelectedCount) && (
              <p className="text-danger-700 font-medium text-sm p-4 bg-danger-50 rounded-xl flex items-start gap-3 border border-danger-100">
                <AlertTriangle size={20} className="shrink-0 text-danger-500" />
                <span>
                  Sisa kuota email harian Anda ({Math.max(0, quota.dailyLimit - quota.dailySent)}) lebih kecil dari jumlah yang akan dikirim ({pendingSelectedCount}). Pengiriman selebihnya akan gagal dan dapat dilanjutkan besok.
                </span>
              </p>
            )}
          </div>
        }
        confirmText="Mulai Proses Pengiriman"
      />

      <SendProgressModal
        isOpen={isSending}
        onClose={() => {
          setIsSending(false)
          loadParticipants()
        }}
        progress={sendProgress}
      />
    </div>
  )
}
