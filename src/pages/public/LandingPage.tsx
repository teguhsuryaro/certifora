import { Link } from 'react-router-dom'
import { Button } from '../../components/ui'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-600">Certifora</h1>
          <Link to="/login">
            <Button variant="primary" size="sm">Masuk Admin</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 border border-primary-200 rounded-full text-sm text-primary-700 font-medium mb-6">
              <span>✨</span>
              100% Gratis Selamanya
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 leading-tight">
              Buat & Kirim
              <span className="text-primary-600"> Sertifikat Digital</span>
              <br />dengan Mudah
            </h2>

            <p className="mt-6 text-lg sm:text-xl text-neutral-500 max-w-2xl mx-auto">
              Platform gratis untuk membuat, mengelola, memvalidasi, dan mengirim
              sertifikat digital berbentuk PDF melalui email.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Mulai Sekarang →
                </Button>
              </Link>
              <a href="#features">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Lihat Fitur
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-primary-100/40 to-transparent rounded-full blur-3xl -z-10" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-neutral-900">Fitur Lengkap</h3>
            <p className="mt-3 text-neutral-500 max-w-xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola sertifikat event dalam satu platform
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: '📋',
                title: 'Kelola Event',
                desc: 'Buat event dengan QR code otomatis untuk registrasi peserta.',
              },
              {
                icon: '🎨',
                title: 'Template Sertifikat',
                desc: 'Upload template PDF dan atur posisi nama & QR code dengan drag-and-drop.',
              },
              {
                icon: '📱',
                title: 'Registrasi QR Code',
                desc: 'Peserta scan QR dan isi form registrasi langsung dari HP.',
              },
              {
                icon: '📄',
                title: 'Generate PDF',
                desc: 'PDF sertifikat dibuat otomatis dengan nama peserta dan QR validasi.',
              },
              {
                icon: '📧',
                title: 'Kirim via Email',
                desc: 'Kirim sertifikat langsung ke email peserta, satu per satu atau massal.',
              },
              {
                icon: '✅',
                title: 'Validasi Online',
                desc: 'Setiap sertifikat punya QR untuk verifikasi keaslian — aktif selamanya.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-neutral-50 rounded-2xl p-6 hover:shadow-card transition-shadow border border-neutral-100"
              >
                <span className="text-3xl block mb-3">{feature.icon}</span>
                <h4 className="text-lg font-semibold text-neutral-900 mb-2">{feature.title}</h4>
                <p className="text-neutral-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-neutral-900">Cara Kerja</h3>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: '01', title: 'Buat Event', desc: 'Isi informasi event dan upload template sertifikat PDF.' },
              { step: '02', title: 'Bagikan QR', desc: 'Aktifkan event dan bagikan QR code ke peserta.' },
              { step: '03', title: 'Peserta Daftar', desc: 'Peserta scan QR, isi nama, email, dan selfie.' },
              { step: '04', title: 'Kirim Sertifikat', desc: 'Review data, generate PDF, dan kirim via email.' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  {step.step}
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">{step.title}</h4>
                <p className="text-sm text-neutral-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Siap Membuat Sertifikat?
          </h3>
          <p className="text-primary-200 mb-8 text-lg">
            Gratis selamanya. Tanpa kartu kredit. Tanpa batasan trial.
          </p>
          <Link to="/login">
            <button className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors">
              Mulai Sekarang
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-lg font-bold text-white mb-2">Certifora</p>
          <p className="text-sm">Platform sertifikat digital gratis selamanya.</p>
          <p className="text-xs mt-4">© {new Date().getFullYear()} Certifora. Dibuat dengan ❤️</p>
        </div>
      </footer>
    </div>
  )
}
