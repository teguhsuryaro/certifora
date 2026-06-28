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
