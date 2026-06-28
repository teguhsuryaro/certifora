# 03 — Halaman Login & Layout Admin

> **Prasyarat:** Routing sudah disetup (file `02_routing.md` sudah selesai).
> **File target:** `src/pages/public/LoginPage.tsx`, `src/components/layout/AdminLayout.tsx`

---

## Tujuan

1. Membuat halaman login fungsional untuk superadmin.
2. Membuat layout wrapper untuk halaman-halaman admin (sidebar + header).

---

## 1. Halaman Login (`src/pages/public/LoginPage.tsx`)

Ganti isi placeholder dengan implementasi lengkap:

```typescript
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Certifora</h1>
          <p className="mt-2 text-gray-500">Masuk ke dashboard admin</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
                placeholder="admin@certifora.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Memproses...
                </span>
              ) : (
                'Masuk'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          © 2026 Certifora. Sertifikat Generator.
        </p>
      </div>
    </div>
  )
}
```

---

## 2. Admin Layout (`src/components/layout/AdminLayout.tsx`)

Layout wrapper untuk semua halaman admin — berisi sidebar (desktop) dan header:

```typescript
import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
]

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { admin, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link to="/admin/dashboard" className="text-xl font-bold text-indigo-600">
            Certifora
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${location.pathname === item.path
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User info + Logout (di bawah sidebar) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-indigo-600">
                {admin?.full_name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {admin?.full_name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {admin?.email || ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Top header (mobile) */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8">
          {/* Hamburger menu (mobile only) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

---

## 3. Update Router untuk Menggunakan AdminLayout

Di `src/App.tsx`, wrap route admin dengan `AdminLayout`:

Tambahkan import:
```typescript
import { AdminLayout } from './components/layout/AdminLayout'
```

Ubah bagian admin routes:
```typescript
{/* ====== Admin Routes (protected) ====== */}
<Route element={<ProtectedRoute />}>
  <Route element={<AdminLayout />}>
    <Route path="/admin/dashboard" element={<DashboardPage />} />
    <Route path="/admin/events/new" element={<CreateEventPage />} />
    <Route path="/admin/events/:eventId" element={<EventDetailPage />} />
    <Route path="/admin/events/:eventId/template" element={<TemplateEditorPage />} />
    <Route path="/admin/events/:eventId/participants" element={<ParticipantsPage />} />
    <Route path="/admin/events/:eventId/participants/:participantId" element={<ParticipantDetailPage />} />
    <Route path="/admin/events/:eventId/export" element={<ExportPage />} />
  </Route>
</Route>
```

---

## Verifikasi

1. Buka `/login` → form login tampil
2. Masukkan email/password admin yang sudah dibuat di Supabase → berhasil login
3. Setelah login → redirect ke `/admin/dashboard` dengan sidebar
4. Klik "Keluar" → redirect ke `/login`
5. Coba akses `/admin/dashboard` tanpa login → redirect ke `/login`

---

## Kriteria Selesai

- [ ] Halaman login fungsional (bisa login/logout)
- [ ] Error message tampil jika login gagal
- [ ] Loading state tampil saat proses login
- [ ] AdminLayout dengan sidebar dan header sudah dibuat
- [ ] Sidebar responsive (collapse di mobile, tetap di desktop)
- [ ] Admin routes di-wrap dengan AdminLayout
- [ ] Navigasi sidebar berfungsi
- [ ] Info admin tampil di sidebar (nama + email)
