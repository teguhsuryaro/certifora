import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Input, Button } from '../../components/ui'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const result = await login(email, password)
    
    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      navigate('/admin/dashboard')
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-neutral-50 lg:bg-white">
      {/* Kolom Kiri: Form Login */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 xl:px-32 relative">
        <div className="w-full max-w-md mx-auto">
          {/* Logo / Branding */}
          <div className="mb-10 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
            <h1 className="text-4xl font-bold text-primary-600 tracking-tight">Certifora</h1>
            <p className="mt-3 text-neutral-500">Masuk ke dashboard admin</p>
          </div>

          {/* Login Form */}
          <form 
            onSubmit={handleSubmit} 
            className="space-y-5 opacity-0 animate-[fadeIn_0.5s_ease-out_0.1s_forwards]"
          >
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-danger-50 border border-danger-200 rounded-xl flex items-start gap-3">
                <AlertCircle size={20} className="text-danger-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-danger-700">{error}</p>
              </div>
            )}

            <Input
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
              placeholder="admin@certifora.com"
              icon={<Mail size={20} />}
            />

            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              icon={<Lock size={20} />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3"
                isLoading={isSubmitting}
              >
                Masuk
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div 
            className="mt-12 text-center opacity-0 animate-[fadeIn_0.5s_ease-out_0.2s_forwards]"
          >
            <p className="text-sm text-neutral-400">
              © {new Date().getFullYear()} Certifora. Sertifikat Generator.
            </p>
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Visual Area (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600">
        {/* Decorative Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-white/10 blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary-700/20 blur-[100px]" />
        <div className="absolute top-[40%] right-[-5%] w-[300px] h-[300px] rounded-full bg-white/5 blur-[50px]" />
        
        {/* Visual Content */}
        <div className="relative z-10 text-center px-12 max-w-lg opacity-0 animate-[fadeIn_0.8s_ease-out_0.3s_forwards]">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 border border-white/20 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4 leading-snug">Otomatisasi Sertifikat Lebih Mudah</h2>
            <p className="text-primary-50 text-lg leading-relaxed">
              Kirim ratusan sertifikat ke peserta acara Anda hanya dengan beberapa klik. Profesional, cepat, dan efisien.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
