import { useParams, Link } from 'react-router-dom'
import { Lock, ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui'

export default function EventClosedPage() {
  const { eventId } = useParams()

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-100/50 rounded-full blur-[100px] pointer-events-none" />

      <div className="text-center max-w-md w-full relative z-10">
        <div className="glass-card rounded-3xl p-10 shadow-xl border border-white/60 bg-white/80 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={48} className="text-neutral-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 mb-3 tracking-tight">Pendaftaran Ditutup</h1>
          <p className="text-neutral-500 leading-relaxed mb-8">
            Mohon maaf, registrasi untuk event ini sudah tidak tersedia. Jika Anda sudah terdaftar,
            sertifikat akan dikirimkan ke email yang Anda daftarkan.
          </p>
          
          <Link to="/">
            <Button variant="secondary" className="w-full h-12 justify-center" icon={<ArrowLeft size={18} />}>
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
