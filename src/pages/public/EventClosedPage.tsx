import { useParams } from 'react-router-dom'

export default function EventClosedPage() {
  const { eventId } = useParams()

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="text-5xl block mb-4">🔒</span>
        <h1 className="text-xl font-bold text-neutral-900 mb-2">Registrasi Ditutup</h1>
        <p className="text-neutral-500">
          Registrasi untuk event ini sudah tidak tersedia. Jika Anda sudah terdaftar,
          sertifikat akan dikirim ke email yang Anda daftarkan.
        </p>
      </div>
    </div>
  )
}
