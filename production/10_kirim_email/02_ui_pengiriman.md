# 02 — Modal Progress Pengiriman & Integrasi UI

> **Prasyarat:** Email service sudah dibuat (file `01_email_service.md` sudah selesai).
> **File target:** `src/components/shared/SendProgressModal.tsx`, update `ParticipantsPage.tsx` dan `ParticipantDetailPage.tsx`

---

## Tujuan

Membuat komponen modal progress pengiriman dan mengintegrasikan fungsionalitas kirim sertifikat ke halaman peserta.

---

## 1. SendProgressModal (`src/components/shared/SendProgressModal.tsx`)

```typescript
import { Modal, ProgressBar, Button } from '../ui'

interface SendProgress {
  total: number
  sent: number
  failed: number
  skipped: number
  currentName: string
  isComplete: boolean
  dailyLimitReached: boolean
}

interface SendProgressModalProps {
  isOpen: boolean
  onClose: () => void
  progress: SendProgress
}

export function SendProgressModal({ isOpen, onClose, progress }: SendProgressModalProps) {
  const canClose = progress.isComplete

  return (
    <Modal
      isOpen={isOpen}
      onClose={canClose ? onClose : () => {}}
      title={progress.isComplete ? 'Pengiriman Selesai' : 'Mengirim Sertifikat...'}
      size="md"
      footer={
        canClose ? (
          <Button onClick={onClose}>Tutup</Button>
        ) : undefined
      }
    >
      <div className="space-y-6 py-2">
        {/* Progress Bar */}
        <ProgressBar
          current={progress.sent + progress.failed}
          total={progress.total}
          label={
            progress.isComplete
              ? 'Pengiriman selesai'
              : `Mengirim: ${progress.currentName}`
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-success-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-success-600">{progress.sent}</p>
            <p className="text-xs text-success-700">Berhasil</p>
          </div>
          <div className="bg-danger-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-danger-600">{progress.failed}</p>
            <p className="text-xs text-danger-700">Gagal</p>
          </div>
          <div className="bg-neutral-100 rounded-lg p-3">
            <p className="text-2xl font-bold text-neutral-600">{progress.skipped}</p>
            <p className="text-xs text-neutral-700">Tertunda</p>
          </div>
        </div>

        {/* Daily Limit Warning */}
        {progress.dailyLimitReached && (
          <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
            <p className="text-sm text-warning-700">
              ⚠️ <strong>Batas harian tercapai.</strong> Hari ini terkirim {progress.sent} dari{' '}
              {progress.total} peserta. Sisanya ({progress.skipped} peserta) akan otomatis
              tersedia untuk dikirim besok karena keterbatasan kuota email harian gratis.
            </p>
          </div>
        )}

        {/* Completion Messages */}
        {progress.isComplete && !progress.dailyLimitReached && (
          <div className="p-4 bg-success-50 border border-success-200 rounded-lg text-center">
            <p className="text-sm text-success-700">
              ✅ Semua sertifikat telah diproses!
            </p>
          </div>
        )}

        {/* Loading Animation (saat masih berjalan) */}
        {!progress.isComplete && (
          <p className="text-center text-sm text-neutral-500 animate-pulse">
            Jangan tutup halaman ini selama proses berjalan...
          </p>
        )}
      </div>
    </Modal>
  )
}
```

---

## 2. Update ParticipantsPage — Integrasi "Kirim Semua"

Tambahkan state dan handler berikut di `ParticipantsPage.tsx`:

```typescript
// Import tambahan
import { SendProgressModal } from '../../components/shared/SendProgressModal'
import * as emailService from '../../services/emailService'
import * as templateService from '../../services/templateService'
import { ConfirmModal } from '../../components/ui'

// State tambahan
const [confirmSendAll, setConfirmSendAll] = useState(false)
const [isSending, setIsSending] = useState(false)
const [sendProgress, setSendProgress] = useState({
  total: 0, sent: 0, failed: 0, skipped: 0,
  currentName: '', isComplete: false, dailyLimitReached: false,
})

// Handler kirim semua
const handleSendAll = async () => {
  setConfirmSendAll(false)
  setIsSending(true)
  setSendProgress({
    total: pendingCount, sent: 0, failed: 0, skipped: 0,
    currentName: '', isComplete: false, dailyLimitReached: false,
  })

  try {
    // Fetch template dan email settings
    const [template, eventData] = await Promise.all([
      templateService.fetchTemplateByEventId(eventId!),
      // fetchEventById yang sudah ada
    ])

    const emailSettings = eventData.event_email_settings
    const pendingParticipants = participants.filter(p => p.delivery_status !== 'success')

    await emailService.sendAllCertificates(
      pendingParticipants,
      template,
      emailSettings,
      eventData.name,
      eventData.organizer,
      (progress) => setSendProgress(progress)
    )

    // Refresh data
    await loadParticipants()
  } catch (error) {
    console.error('Batch send error:', error)
  }
}

// Tambahkan modal di JSX:
<ConfirmModal
  isOpen={confirmSendAll}
  onClose={() => setConfirmSendAll(false)}
  onConfirm={handleSendAll}
  title="Kirim Semua Sertifikat"
  message={`Akan mengirim sertifikat ke ${pendingCount} peserta yang belum terkirim. Estimasi waktu: ~${Math.ceil(pendingCount * 2 / 60)} menit.`}
  confirmText="Mulai Kirim"
/>

<SendProgressModal
  isOpen={isSending}
  onClose={() => {
    setIsSending(false)
    loadParticipants()
  }}
  progress={sendProgress}
/>
```

Update tombol "Kirim Semua" agar membuka modal konfirmasi:
```typescript
<Button
  variant="primary"
  disabled={pendingCount === 0}
  onClick={() => setConfirmSendAll(true)}
>
  Kirim Semua ({pendingCount})
</Button>
```

---

## 3. Update ParticipantDetailPage — Kirim Individual

Implementasi tombol "Kirim Sertifikat" di halaman detail peserta:

```typescript
// Import
import * as emailService from '../../services/emailService'

// State
const [isSendingEmail, setIsSendingEmail] = useState(false)
const [sendMessage, setSendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

// Handler
const handleSendCertificate = async () => {
  if (!participant || !template || !eventId) return
  setIsSendingEmail(true)
  setSendMessage(null)

  try {
    // Fetch email settings
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
      await loadData()
    } else {
      setSendMessage({ type: 'error', text: result.error || 'Gagal mengirim sertifikat' })
    }
  } catch (error: any) {
    setSendMessage({ type: 'error', text: error.message })
  } finally {
    setIsSendingEmail(false)
  }
}
```

---

## Kriteria Selesai

- [ ] Modal progress menampilkan progress bar, counter, dan stats real-time
- [ ] Pesan limit harian tampil dengan penjelasan yang jelas
- [ ] Tombol "Kirim Semua" membuka modal konfirmasi sebelum eksekusi
- [ ] Proses batch berjalan dengan update progress
- [ ] Data di-refresh setelah proses selesai
- [ ] Kirim individual di halaman detail peserta berfungsi
- [ ] Loading state dan pesan sukses/gagal tampil
- [ ] Modal tidak bisa ditutup selama proses berjalan
