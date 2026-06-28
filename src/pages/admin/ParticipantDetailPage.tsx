import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as participantService from '../../services/participantService'
import * as templateService from '../../services/templateService'
import * as emailService from '../../services/emailService'
import { supabase } from '../../lib/supabase'
import { Button, StatusBadge, Modal, Input, PageLoading } from '../../components/ui'
import type { DeliveryStatus } from '../../types/database'

export default function ParticipantDetailPage() {
  const { eventId, participantId } = useParams<{ eventId: string; participantId: string }>()

  const [participant, setParticipant] = useState<any>(null)
  const [template, setTemplate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selfieModalOpen, setSelfieModalOpen] = useState(false)

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
      const [pData, tData] = await Promise.all([
        participantService.fetchParticipantById(participantId!),
        templateService.fetchTemplateByEventId(eventId!),
      ])
      setParticipant(pData)
      setTemplate(tData)

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

  const getSelfieUrl = (path: string) => {
    const { data } = supabase.storage.from('selfies').getPublicUrl(path)
    return data?.publicUrl || ''
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
      await loadData()
    } catch (error) {
      console.error('Failed to save override:', error)
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

  if (isLoading || !participant) return <PageLoading />

  const deliveryBadge = {
    pending: { variant: 'warning' as const, label: 'Belum Dikirim' },
    success: { variant: 'success' as const, label: 'Berhasil' },
    failed: { variant: 'danger' as const, label: 'Gagal' },
  }[participant.delivery_status as DeliveryStatus]

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-neutral-500 mb-4">
        <Link to={`/admin/events/${eventId}/participants`} className="hover:text-primary-600">
          ← Kembali ke Daftar Peserta
        </Link>
      </nav>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-neutral-200 overflow-hidden shrink-0 cursor-pointer"
          onClick={() => setSelfieModalOpen(true)}
        >
          {participant.selfie_path && (
            <img src={getSelfieUrl(participant.selfie_path)} alt="Selfie" className="w-full h-full object-cover" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{participant.full_name}</h1>
          <p className="text-neutral-500">{participant.email}</p>
          <div className="flex items-center gap-3 mt-2">
            {deliveryBadge && <StatusBadge variant={deliveryBadge.variant}>{deliveryBadge.label}</StatusBadge>}
            <span className="font-mono text-sm text-neutral-600">{participant.certificate_code}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Info Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="font-semibold text-neutral-900 mb-4">Informasi Peserta</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Tanggal Daftar</dt>
              <dd className="text-neutral-900">{new Date(participant.submitted_at).toLocaleString('id-ID')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Kode Sertifikat</dt>
              <dd className="font-mono text-neutral-900">{participant.certificate_code}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Status Pengiriman</dt>
              <dd>{deliveryBadge && <StatusBadge variant={deliveryBadge.variant}>{deliveryBadge.label}</StatusBadge>}</dd>
            </div>
          </dl>

          {/* Kirim / Kirim Ulang */}
          <div className="mt-6 pt-4 border-t border-neutral-100">
            {sendMessage && (
              <div className={`p-3 rounded-lg mb-3 text-sm ${sendMessage.type === 'success' ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'}`}>
                {sendMessage.text}
              </div>
            )}
            <Button
              variant={participant.delivery_status === 'failed' ? 'danger' : 'primary'}
              className="w-full"
              disabled={participant.delivery_status === 'success'}
              isLoading={isSendingEmail}
              onClick={handleSendCertificate}
            >
              {participant.delivery_status === 'success'
                ? 'Sudah Terkirim'
                : participant.delivery_status === 'failed'
                ? 'Kirim Ulang'
                : 'Kirim Sertifikat'}
            </Button>
          </div>
        </div>

        {/* Override Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="font-semibold text-neutral-900 mb-2">Override Khusus Peserta</h2>
          <p className="text-sm text-neutral-500 mb-4">
            Atur posisi dan ukuran nama yang berbeda dari template utama, khusus untuk peserta ini.
            Kosongkan untuk menggunakan pengaturan template utama.
          </p>
          <div className="space-y-4">
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
              hint={`Template utama: ${template?.name_position_x}%`}
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
              hint={`Template utama: ${template?.name_position_y}%`}
            />
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
              hint={`Template utama: ${template?.name_font_size}pt`}
            />
            <Button
              variant="secondary"
              className="w-full"
              onClick={saveOverride}
              isLoading={isSavingOverride}
            >
              Simpan Override
            </Button>
          </div>
        </div>
      </div>

      {/* Delivery Logs */}
      {participant.delivery_logs && participant.delivery_logs.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="font-semibold text-neutral-900 mb-4">Riwayat Pengiriman</h2>
          <div className="space-y-3">
            {participant.delivery_logs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                <div className="flex items-center gap-3">
                  <StatusBadge variant={log.status === 'success' ? 'success' : 'danger'}>
                    {log.status === 'success' ? 'Berhasil' : 'Gagal'}
                  </StatusBadge>
                  {log.error_message && (
                    <span className="text-sm text-danger-600">{log.error_message}</span>
                  )}
                </div>
                <span className="text-sm text-neutral-500">
                  {new Date(log.sent_at).toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selfie Modal */}
      <Modal
        isOpen={selfieModalOpen}
        onClose={() => setSelfieModalOpen(false)}
        title="Selfie Peserta"
        size="lg"
      >
        {participant.selfie_path && (
          <img
            src={getSelfieUrl(participant.selfie_path)}
            alt={`Selfie ${participant.full_name}`}
            className="w-full rounded-lg"
          />
        )}
      </Modal>
    </div>
  )
}
