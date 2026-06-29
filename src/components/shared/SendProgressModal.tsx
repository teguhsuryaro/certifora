import { Modal, ProgressBar, Button } from '../ui'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
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
  onCancel?: () => void
  progress: SendProgress
}

export function SendProgressModal({ isOpen, onClose, onCancel, progress }: SendProgressModalProps) {
  const canClose = progress.isComplete || progress.dailyLimitReached

  return (
    <Modal
      isOpen={isOpen}
      onClose={canClose ? onClose : (onCancel || (() => {}))}
      title={canClose ? 'Pengiriman Selesai' : 'Mengirim Sertifikat...'}
      size="md"
      footer={
        canClose ? (
          <Button onClick={onClose}>Tutup</Button>
        ) : onCancel ? (
          <Button variant="danger" onClick={onCancel}>Batalkan</Button>
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
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>Batas harian tercapai.</strong> Hari ini terkirim {progress.sent} dari{' '}
              {progress.total} peserta. Sisanya ({progress.skipped} peserta) akan otomatis
              tersedia untuk dikirim besok karena keterbatasan kuota email harian gratis.
            </p>
          </div>
        )}

        {/* Completion Messages */}
        {progress.isComplete && !progress.dailyLimitReached && (
          <div className="p-4 bg-success-50 border border-success-200 rounded-lg flex items-center justify-center gap-2">
            <CheckCircle2 size={16} className="text-success-600 shrink-0" />
            <p className="text-sm text-success-700">
              Semua sertifikat telah diproses!
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
