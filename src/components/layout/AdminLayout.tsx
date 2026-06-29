import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { LayoutDashboard, Menu, LogOut } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
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

  const getPageTitle = (pathname: string) => {
    if (pathname === '/admin/dashboard') return 'Dashboard'
    if (pathname.includes('/template-editor')) return 'Template Editor'
    if (pathname.includes('/participants')) return 'Data Peserta'
    if (pathname.includes('/export')) return 'Export Data'
    if (pathname.includes('/events/')) return 'Detail Event'
    return 'Certifora'
  }

  const pageTitle = getPageTitle(location.pathname)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white/80 backdrop-blur-md border-r border-neutral-100
          transform transition-transform duration-300 ease-in-out flex flex-col
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-neutral-100 shrink-0">
          <Link to="/admin/dashboard" className="text-2xl font-bold text-primary-600 tracking-tight">
            Certifora
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200
                  ${isActive
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-neutral-500 hover:bg-primary-50 hover:text-primary-700'
                  }
                `}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'text-neutral-400'} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User info + Logout (di bawah sidebar) */}
        <div className="p-4 border-t border-neutral-100 shrink-0 bg-white/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-primary-600">
                {admin?.full_name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {admin?.full_name || 'Admin'}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {admin?.email || ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-danger-600 hover:bg-danger-50 rounded-xl transition-colors text-left"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-neutral-100 flex items-center justify-between px-4 lg:px-8">
          {/* Mobile left: Hamburger & Logo */}
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <Menu size={24} />
            </button>
            <span className="text-xl font-bold text-primary-600 tracking-tight">Certifora</span>
          </div>

          {/* Desktop left: Page Title & Greeting */}
          <div className="hidden lg:block">
            <p className="text-sm text-neutral-500 mb-0.5">
              Selamat datang, {admin?.full_name?.split(' ')[0] || 'Admin'} 👋
            </p>
            <h1 className="text-2xl font-bold text-neutral-900 leading-none">{pageTitle}</h1>
          </div>

          {/* Right: Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary-500 hover:ring-offset-2 transition-all">
              <span className="text-sm font-semibold text-primary-600">
                {admin?.full_name?.charAt(0) || 'A'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
