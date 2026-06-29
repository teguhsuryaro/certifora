import { Link } from 'react-router-dom'
import { MapPinOff, ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-100/50 rounded-full blur-[100px] pointer-events-none" />

      <div className="text-center max-w-md w-full relative z-10">
        <div className="glass-card rounded-3xl p-10 shadow-xl border border-white/60 bg-white/80 animate-in fade-in zoom-in duration-500 flex flex-col items-center">
          <div className="relative mb-6">
            <h1 className="text-8xl font-black text-neutral-100 drop-shadow-sm select-none">404</h1>
            <div className="absolute inset-0 flex items-center justify-center text-primary-500">
              <MapPinOff size={48} className="drop-shadow-md" />
            </div>
          </div>
          
          <h2 className="text-2xl font-extrabold text-neutral-900 mb-3 tracking-tight">Halaman Tidak Ditemukan</h2>
          <p className="text-neutral-500 leading-relaxed mb-8">
            Maaf, halaman yang Anda cari mungkin telah dihapus, namanya diubah, atau tidak pernah ada.
          </p>
          
          <Link to="/">
            <Button className="w-full h-12 justify-center shadow-lg shadow-primary-500/20" icon={<ArrowLeft size={18} />}>
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
