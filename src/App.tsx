import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { PublicOnlyRoute } from './components/layout/PublicOnlyRoute'

// Public Pages
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import EventClosedPage from './pages/public/EventClosedPage'
import VerifyPage from './pages/public/VerifyPage'
import NotFoundPage from './pages/public/NotFoundPage'

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage'
import CreateEventPage from './pages/admin/CreateEventPage'
import EventDetailPage from './pages/admin/EventDetailPage'
import TemplateEditorPage from './pages/admin/TemplateEditorPage'
import ParticipantsPage from './pages/admin/ParticipantsPage'
import ParticipantDetailPage from './pages/admin/ParticipantDetailPage'
import ExportPage from './pages/admin/ExportPage'

function App() {
  const { initialize, isLoading } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ====== Public Routes ====== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/event/:eventId/register" element={<RegisterPage />} />
        <Route path="/event/:eventId/closed" element={<EventClosedPage />} />
        <Route path="/verify/:kodeSertifikat" element={<VerifyPage />} />

        {/* ====== Login (redirect ke dashboard jika sudah login) ====== */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* ====== Admin Routes (protected) ====== */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/events/new" element={<CreateEventPage />} />
          <Route path="/admin/events/:eventId" element={<EventDetailPage />} />
          <Route path="/admin/events/:eventId/template" element={<TemplateEditorPage />} />
          <Route path="/admin/events/:eventId/participants" element={<ParticipantsPage />} />
          <Route path="/admin/events/:eventId/participants/:participantId" element={<ParticipantDetailPage />} />
          <Route path="/admin/events/:eventId/export" element={<ExportPage />} />
        </Route>

        {/* ====== 404 ====== */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
