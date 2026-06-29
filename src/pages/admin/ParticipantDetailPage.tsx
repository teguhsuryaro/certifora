import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import * as participantService from '../../services/participantService'
import * as templateService from '../../services/templateService'
import * as emailService from '../../services/emailService'
import { supabase } from '../../lib/supabase'
import { Button, StatusBadge, Modal, Input, PageLoading, ConfirmModal } from '../../components/ui'
import { ArrowLeft, Mail, Calendar, Hash, Settings, Activity, Trash2, User as UserIcon } from 'lucide-react'
import type { DeliveryStatus } from '../../types/database'

export default function ParticipantDetailPage() {
  const { eventId, participantId } = useParams<{ eventId: string; participantId: string }>()
  const navigate = useNavigate()

  const [participant, setParticipant] = useState<any>(null)
  const [template, setTemplate] = useState<any>(null)
  const [isTemplateReady, setIsTemplateReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selfieModalOpen, setSelfieModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Override state
  const [overrides, setOverrides] = useState({
    name_position_x: null as number | null,
    name_position_y: null as number | null,
    name_font_size: null as number | null,
  })
  const [isSavingOverride, setIsSavingOverride] = useState(false)

  // Send state
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [sendMessage, setSendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (participantId && eventId) {
      loadData()
    }
  }, [participantId, eventId])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [pData, tData, templateReady] = await Promise.all([
        participantService.fetchParticipantById(participantId!),
        templateService.fetchTemplateByEventId(eventId!),
        templateService.isTemplateReady(eventId!),
      ])
      
      // Get signed URL for selfie
      let selfieSignedUrl = ''
      if (pData.selfie_path) {
        const { data: urlData } = await supabase.storage.from('selfies').createSignedUrl(pData.selfie_path, 3600)
        selfieSignedUrl = urlData?.signedUrl || ''
      }
      
      setParticipant({ ...pData, selfieSignedUrl })
      setTemplate(tData)
      setIsTemplateReady(templateReady)

      // Load existing overrides
      if (pData.template_overrides?.[0]) {
        const o = pData.template_overrides[0]
        setOverrides({
          name_position_x: o.name_position_x,
          name_position_y: o.name_position_y,
          name_font_size: o.name_font_size,
        })
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Save override
  const saveOverride = async () => {
    if (!participantId) return
    setIsSavingOverride(true)
    try {
      const existing = participant.template_overrides?.[0]
      if (existing) {
        await supabase
          .from('template_overrides')
          .update(overrides)
          .eq('participant_id', participantId)
      } else {
        await supabase
          .from('template_overrides')
          .insert({ participant_id: participantId, ...overrides })
      }
      setSendMessage({ type: 'success', text: 'Pengaturan override berhasil disimpan!' })
      setTimeout(() => setSendMessage(null), 3000)
      await loadData()
    } catch (error) {
      console.error('Failed to save override:', error)
      setSendMessage({ type: 'error', text: 'Gagal menyimpan override' })
    } finally {
      setIsSavingOverride(false)
    }
  }

  // Send certificate
  const handleSendCertificate = async () => {
    if (!participant || !template || !eventId) return
    setIsSendingEmail(true)
    setSendMessage(null)

    try {
      const { data: emailSettings } = await supabase
        .from('event_email_settings')
        .select('*')
        .eq('event_id', eventId)
        .single()

      const { data: eventData } = await supabase
        .from('events')
        .select('name, organizer')
        .eq('id', eventId)
        .single()

      if (!emailSettings || !eventData) {
        throw new Error('Data event atau pengaturan email tidak ditemukan')
      }

      const result = await emailService.sendCertificateToParticipant(
        participant,
        template,
        emailSettings,
        eventData.name,
        eventData.organizer,
        participant.template_overrides?.[0]
      )

      if (result.success) {
        setSendMessage({ type: 'success', text: 'Sertifikat berhasil dikirim!' })
        await loadData() // Refresh status logs
      } else {
        setSendMessage({ type: 'error', text: result.error || 'Gagal mengirim sertifikat' })
      }
    } catch (error: any) {
      setSendMessage({ type: 'error', text: error.message })
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleDelete = async () => {
    if (!participantId || !eventId) return
    setIsDeleting(true)
    try {
      await participantService.deleteParticipant(participantId)
      navigate(`/admin/events/${eventId}/participants`)
    } catch (error: any) {
      alert("Gagal menghapus peserta: " + error.message)
      setIsDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (isLoading || !participant) return <PageLoading />

  const deliveryBadge = {
    pending: { variant: 'warning' as const, label: 'Belum Dikirim' },
    success: { variant: 'success' as const, label: 'Terkirim' },
    failed: { variant: 'danger' as const, label: 'Gagal' },
  }[participant.delivery_status as DeliveryStatus]

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link 
          to={`/admin/events/${eventId}/participants`} 
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Daftar Peserta
        </Link>
      </nav>

      {/* Header Profile */}
      <div className="glass-card p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div 
          className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-neutral-200 overflow-hidden shrink-0 cursor-pointer border-4 border-white shadow-lg ring-1 ring-neutral-200/50 relative group"
          onClick={() => setSelfieModalOpen(true)}
        >
          {participant.selfie_path ? (
            <img src={participant.selfieSignedUrl} alt="Selfie" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400">
              <UserIcon size={40} />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-xs text-white font-medium">Perbesar</span>
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">{participant.full_name}</h1>
          <div className="flex flex-col md:flex-row items-center gap-3 text-neutral-600 mb-4">
            <span className="flex items-center gap-1.5"><Mail size={16} className="text-neutral-400" /> {participant.email}</span>
            <span className="hidden md:inline text-neutral-300">•</span>
            <span className="flex items-center gap-1.5 font-mono text-sm"><Hash size={16} className="text-neutral-400" /> {participant.certificate_code}</span>
          </div>
          
          <div className="flex items-center justify-center md:justify-start gap-3">
            {deliveryBadge && <StatusBadge variant={deliveryBadge.variant}>{deliveryBadge.label}</StatusBadge>}
          </div>
        </div>

        <div className="absolute top-6 right-6">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            icon={<Trash2 size={16} />}
          >
            <span className="hidden sm:inline">Hapus</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Info & Action Column */}
        <div className="space-y-8">
          {/* Info Card */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-5 flex items-center gap-2">
              <UserIcon size={20} className="text-primary-600" />
              Detail Informasi
            </h2>
            <dl className="space-y-4 text-sm">
              <div className="flex items-start justify-between pb-4 border-b border-neutral-100">
                <dt className="text-neutral-500 flex items-center gap-2">
                  <Calendar size={16} /> Tanggal Daftar
                </dt>
                <dd className="font-medium text-neutral-900 text-right">{new Date(participant.submitted_at).toLocaleString('id-ID')}</dd>
              </div>
              <div className="flex items-start justify-between pb-4 border-b border-neutral-100">
                <dt className="text-neutral-500 flex items-center gap-2">
                  <Hash size={16} /> Kode Sertifikat
                </dt>
                <dd className="font-mono font-medium text-neutral-900 text-right">{participant.certificate_code}</dd>
              </div>
              <div className="flex items-start justify-between">
                <dt className="text-neutral-500 flex items-center gap-2">
                  <Activity size={16} /> Status Pengiriman
                </dt>
                <dd className="text-right">
                  {deliveryBadge && <StatusBadge variant={deliveryBadge.variant}>{deliveryBadge.label}</StatusBadge>}
                </dd>
              </div>
            </dl>

            {/* Kirim / Kirim Ulang Action */}
            <div className="mt-8">
              {sendMessage && (
                <div className={`p-3 rounded-xl mb-4 text-sm font-medium animate-in fade-in ${sendMessage.type === 'success' ? 'bg-success-50 text-success-700 border border-success-200' : 'bg-danger-50 text-danger-700 border border-danger-200'}`}>
                  {sendMessage.text}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button
                  variant={participant.delivery_status === 'failed' ? 'danger' : 'primary'}
                  className="w-full h-12 text-base font-semibold shadow-md"
                  disabled={participant.delivery_status === 'success' || !isTemplateReady}
                  isLoading={isSendingEmail}
                  onClick={handleSendCertificate}
                  title={!isTemplateReady ? "Harap upload dan atur template sertifikat terlebih dahulu" : ""}
                >
                  {participant.delivery_status === 'success'
                    ? 'Sertifikat Sudah Terkirim'
                    : participant.delivery_status === 'failed'
                    ? 'Kirim Ulang Sertifikat'
                    : 'Kirim Sertifikat Sekarang'}
                </Button>
                {!isTemplateReady && (
                  <span className="text-xs text-danger-500 font-medium text-center">Template PDF belum dikonfigurasi</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Override Column */}
        <div className="space-y-8">
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <Settings size={20} className="text-primary-600" />
              Override Khusus Peserta
            </h2>
            <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
              Atur posisi dan ukuran nama yang berbeda dari template utama secara spesifik untuk peserta ini.
              Kosongkan field jika ingin menggunakan pengaturan template bawaan.
            </p>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="overridePosX"
                  label="Posisi X (%)"
                  type="number"
                  min={0} max={100} step={0.5}
                  value={overrides.name_position_x ?? ''}
                  onChange={(e) => setOverrides(prev => ({
                    ...prev,
                    name_position_x: e.target.value ? Number(e.target.value) : null,
                  }))}
                  hint={`Template utama: ${template?.name_position_x ?? '-'}%`}
                />
                <Input
                  id="overridePosY"
                  label="Posisi Y (%)"
                  type="number"
                  min={0} max={100} step={0.5}
                  value={overrides.name_position_y ?? ''}
                  onChange={(e) => setOverrides(prev => ({
                    ...prev,
                    name_position_y: e.target.value ? Number(e.target.value) : null,
                  }))}
                  hint={`Template utama: ${template?.name_position_y ?? '-'}%`}
                />
              </div>
              <Input
                id="overrideFontSize"
                label="Ukuran Font (pt)"
                type="number"
                min={8} max={72}
                value={overrides.name_font_size ?? ''}
                onChange={(e) => setOverrides(prev => ({
                  ...prev,
                  name_font_size: e.target.value ? Number(e.target.value) : null,
                }))}
                hint={`Template utama: ${template?.name_font_size ?? '-'}pt`}
              />
              <Button
                variant="secondary"
                className="w-full mt-2"
                onClick={saveOverride}
                isLoading={isSavingOverride}
              >
                Simpan Konfigurasi Override
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Logs Timeline */}
      {participant.delivery_logs && participant.delivery_logs.length > 0 && (
        <div className="mt-8 glass-card p-6 md:p-8">
          <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Activity size={20} className="text-primary-600" />
            Riwayat Pengiriman
          </h2>
          <div className="relative border-l border-neutral-200 ml-3 md:ml-4 space-y-6">
            {participant.delivery_logs.map((log: any, idx: number) => {
              const isSuccess = log.status === 'success';
              return (
                <div key={log.id} className="relative pl-6 md:pl-8">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[5px] top-1.5 w-[10px] h-[10px] rounded-full border-2 border-white shadow-sm
                    ${isSuccess ? 'bg-success-500' : 'bg-danger-500'}
                  `} />
                  
                  <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <StatusBadge variant={isSuccess ? 'success' : 'danger'}>
                          {isSuccess ? 'Pengiriman Berhasil' : 'Pengiriman Gagal'}
                        </StatusBadge>
                      </div>
                      <span className="text-xs font-medium text-neutral-400 bg-white px-2.5 py-1 rounded-md border border-neutral-100">
                        {new Date(log.sent_at).toLocaleString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {log.error_message && (
                      <div className="mt-3 p-3 bg-danger-50/50 rounded-lg border border-danger-100">
                        <p className="text-sm text-danger-700 font-medium">Pesan Error:</p>
                        <p className="text-sm text-danger-600 mt-0.5">{log.error_message}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Selfie Modal */}
      <Modal
        isOpen={selfieModalOpen}
        onClose={() => setSelfieModalOpen(false)}
        title="Foto Selfie Peserta"
        size="md"
      >
        <div className="p-2 bg-neutral-100 rounded-xl">
          {participant.selfie_path ? (
            <img
              src={participant.selfieSignedUrl}
              alt={`Selfie ${participant.full_name}`}
              className="w-full rounded-lg object-contain max-h-[60vh] mx-auto"
            />
          ) : (
            <div className="w-full h-64 flex flex-col items-center justify-center text-neutral-400">
              <UserIcon size={48} className="mb-2" />
              <p>Tidak ada foto selfie</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Data Peserta"
        message={
          <div className="space-y-2">
            <p>Apakah Anda yakin ingin menghapus <strong>{participant.full_name}</strong> secara permanen?</p>
            <p className="text-sm text-danger-600 font-medium">Tindakan ini tidak dapat dibatalkan. Riwayat pengiriman juga akan ikut terhapus.</p>
          </div>
        }
        confirmText={isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
      />
    </div>
  )
}
