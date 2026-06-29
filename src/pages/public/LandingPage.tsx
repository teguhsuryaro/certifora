import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui'
import { Sparkles, ClipboardList, Palette, Smartphone, FileText, Mail, ShieldCheck, Menu, X, Code2, ArrowRight } from 'lucide-react'

const ScrollReveal = ({ children, className = '', delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            if (ref.current) {
              ref.current.classList.remove('opacity-0', 'translate-y-8', 'scale-95')
              ref.current.classList.add('opacity-100', 'translate-y-0', 'scale-100')
            }
          }, delay)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={`opacity-0 translate-y-8 scale-95 transition-all duration-700 ease-out ${className}`}>
      {children}
    </div>
  )
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 overflow-x-hidden selection:bg-primary-200 selection:text-primary-900">
      {/* Navbar */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20 text-white font-bold text-xl">
                C
              </div>
              <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-700">
                Certifora
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors">
                Beranda
              </button>
              <button onClick={() => scrollToSection('fitur')} className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors">
                Fitur Utama
              </button>
              <button onClick={() => scrollToSection('cara-kerja')} className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors">
                Cara Kerja
              </button>
              <Link to="/login">
                <Button variant="primary" className="shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 transition-all">
                  Masuk Admin
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        <div className={`md:hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-neutral-200 transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-64 opacity-100 shadow-xl' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 py-6 flex flex-col gap-4">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-left font-medium text-neutral-700 p-2 hover:bg-primary-50 hover:text-primary-700 rounded-lg">Beranda</button>
            <button onClick={() => scrollToSection('fitur')} className="text-left font-medium text-neutral-700 p-2 hover:bg-primary-50 hover:text-primary-700 rounded-lg">Fitur Utama</button>
            <button onClick={() => scrollToSection('cara-kerja')} className="text-left font-medium text-neutral-700 p-2 hover:bg-primary-50 hover:text-primary-700 rounded-lg">Cara Kerja</button>
            <Link to="/login" className="mt-2 block" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="primary" className="w-full justify-center">Masuk Admin</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background decorative blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-300/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 mix-blend-multiply" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-300/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 mix-blend-multiply" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Animated Badge */}
            <div className="animate-[fade-in-up_1s_ease-out] inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md border border-white/40 shadow-sm rounded-full text-sm font-semibold text-primary-700 mb-8 ring-1 ring-primary-500/10">
              <Sparkles size={16} className="text-amber-500" />
              Platform Sertifikat Gratis Terlengkap
            </div>

            <h1 className="animate-[fade-in-up_1s_ease-out_100ms_both] text-5xl sm:text-6xl lg:text-7xl font-extrabold text-neutral-900 leading-[1.1] tracking-tight mb-6">
              Kelola Sertifikat Event Anda dengan{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-teal-400">
                Mudah & Otomatis
              </span>
            </h1>

            <p className="animate-[fade-in-up_1s_ease-out_200ms_both] mt-6 text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Solusi cerdas untuk generate, distribusikan via email, dan validasi sertifikat digital peserta event — tanpa batas dan 100% gratis.
            </p>

            <div className="animate-[fade-in-up_1s_ease-out_300ms_both] mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 hover:-translate-y-1 transition-all">
                  Mulai Sekarang Gratis
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
              <button onClick={() => scrollToSection('fitur')} className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-white/80 backdrop-blur-sm border-white/50 hover:bg-white transition-all">
                  Pelajari Fitur
                </Button>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-3">Fitur Utama</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-neutral-900">Segala Kebutuhan Sertifikat Anda</h3>
              <p className="mt-4 text-xl text-neutral-500 max-w-2xl mx-auto">
                Sistem end-to-end yang dirancang untuk menghemat ratusan jam waktu Anda.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Smartphone size={28} className="text-primary-600" />,
                title: 'Pendaftaran QR Code',
                desc: 'Peserta dapat dengan mudah mendaftar event dan mengirimkan selfie cukup dengan scan QR Code.',
                delay: 100
              },
              {
                icon: <FileText size={28} className="text-primary-600" />,
                title: 'Generate Sertifikat PDF',
                desc: 'Otomatisasikan pembuatan sertifikat berformat PDF untuk setiap peserta yang terdaftar.',
                delay: 200
              },
              {
                icon: <Mail size={28} className="text-primary-600" />,
                title: 'Kirim via Email',
                desc: 'Kirimkan ribuan sertifikat digital secara massal langsung ke email masing-masing peserta.',
                delay: 300
              },
              {
                icon: <ShieldCheck size={28} className="text-primary-600" />,
                title: 'Validasi Online',
                desc: 'Keaslian setiap sertifikat dapat diverifikasi secara online menggunakan sistem kode unik dan QR.',
                delay: 400
              },
              {
                icon: <Palette size={28} className="text-primary-600" />,
                title: 'Desain Kustom',
                desc: 'Unggah file PDF dasar Anda dan sesuaikan posisi teks nama serta tata letak QR code secara visual.',
                delay: 500
              },
              {
                icon: <ClipboardList size={28} className="text-primary-600" />,
                title: 'Manajemen Peserta',
                desc: 'Pantau status pengiriman sertifikat, kelola data, dan lihat log histori email tiap peserta.',
                delay: 600
              },
            ].map((feature, i) => (
              <ScrollReveal key={i} delay={feature.delay}>
                <div className="glass-card p-8 h-full hover:shadow-card hover:-translate-y-1 transition-all duration-300 bg-white/60 group">
                  <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-100 transition-transform duration-300 border border-primary-100">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-bold text-neutral-900 mb-3">{feature.title}</h4>
                  <p className="text-neutral-600 leading-relaxed">{feature.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="cara-kerja" className="py-24 bg-neutral-900 relative overflow-hidden text-white">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary-500/20 rounded-[100%] blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-20">
              <h2 className="text-sm font-bold text-primary-400 uppercase tracking-widest mb-3">Alur Penggunaan</h2>
              <h3 className="text-4xl md:text-5xl font-bold mb-4">4 Langkah Mudah</h3>
              <p className="text-xl text-neutral-400">Tidak perlu keahlian desain, cukup upload dan atur posisi.</p>
            </div>
          </ScrollReveal>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-8 left-12 right-12 h-[2px] bg-gradient-to-r from-primary-500/10 via-primary-500/50 to-primary-500/10" />

            {[
              { step: '1', title: 'Buat & Atur Event', desc: 'Buat event, upload PDF kosong, dan tentukan posisi teks.' },
              { step: '2', title: 'Bagikan Tautan', desc: 'Sediakan QR registrasi di lokasi event agar peserta mendaftar.' },
              { step: '3', title: 'Data Terkumpul', desc: 'Peserta akan muncul otomatis pada dashboard admin Anda.' },
              { step: '4', title: 'Kirim Masal', desc: 'Klik satu tombol, dan seluruh sertifikat akan dikirim via email.' },
            ].map((step, i) => (
              <ScrollReveal key={i} delay={i * 200}>
                <div className="relative pt-6 md:pt-0">
                  <div className="w-16 h-16 bg-neutral-800 border-4 border-neutral-900 text-primary-400 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold relative z-10 shadow-[0_0_20px_rgba(13,148,136,0.3)]">
                    {step.step}
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-bold mb-3">{step.title}</h4>
                    <p className="text-neutral-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-teal-500" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <ScrollReveal>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Siap Mengotomatisasi Sertifikat?
            </h3>
            <p className="text-primary-100 mb-10 text-xl max-w-2xl mx-auto">
              Tinggalkan cara lama yang memakan waktu. Gunakan Certifora hari ini juga, gratis 100%.
            </p>
            <Link to="/login">
              <Button size="lg" className="h-14 px-10 text-lg font-bold bg-white text-primary-700 hover:bg-neutral-50 shadow-xl shadow-black/20 hover:scale-105 transition-transform">
                Buat Akun Sekarang
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 text-neutral-400 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-white font-bold">
                C
              </div>
              <span className="text-xl font-bold text-white">Certifora</span>
            </div>
            
            <div className="text-sm text-neutral-500 text-center md:text-left">
              Platform sertifikat digital gratis. Dioptimalkan untuk mempermudah hidup Anda.
            </div>

            <div className="flex items-center gap-4">
              <a href="https://github.com/teguhsuryaro/certifora" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-neutral-800 hover:text-white transition-colors">
                <Code2 size={20} />
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neutral-800 text-sm text-center text-neutral-600">
            © {new Date().getFullYear()} Certifora. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
