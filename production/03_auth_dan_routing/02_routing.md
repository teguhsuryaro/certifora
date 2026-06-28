# 02 — Routing & Protected Routes

> **Prasyarat:** Auth store sudah dibuat (file `01_auth_store.md` sudah selesai).
> **File target:** `src/App.tsx`, `src/components/layout/ProtectedRoute.tsx`

---

## Tujuan

Mengatur client-side routing dengan React Router dan membuat komponen ProtectedRoute untuk halaman admin.

---

## 1. Protected Route Component (`src/components/layout/ProtectedRoute.tsx`)

```typescript
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
```

---

## 2. Public Route Guard (`src/components/layout/PublicOnlyRoute.tsx`)

Untuk halaman seperti `/login` — jika sudah login, redirect ke dashboard:

```typescript
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <Outlet />
}
```

---

## 3. Halaman Placeholder

Buat file-file placeholder berikut agar routing bisa berfungsi. Isi detail akan dikerjakan di folder-folder selanjutnya.

### `src/pages/public/LandingPage.tsx`

```typescript
export default function LandingPage() {
  return <div>Landing Page — akan dibuat di folder 13</div>
}
```

### `src/pages/public/LoginPage.tsx`

```typescript
export default function LoginPage() {
  return <div>Login Page — akan dibuat di langkah selanjutnya (file 03)</div>
}
```

### `src/pages/public/RegisterPage.tsx`

```typescript
export default function RegisterPage() {
  return <div>Register Page — akan dibuat di folder 07</div>
}
```

### `src/pages/public/EventClosedPage.tsx`

```typescript
export default function EventClosedPage() {
  return <div>Event Closed — akan dibuat di folder 07</div>
}
```

### `src/pages/public/VerifyPage.tsx`

```typescript
export default function VerifyPage() {
  return <div>Verify Certificate — akan dibuat di folder 11</div>
}
```

### `src/pages/admin/DashboardPage.tsx`

```typescript
export default function DashboardPage() {
  return <div>Admin Dashboard — akan dibuat di folder 05</div>
}
```

### `src/pages/admin/CreateEventPage.tsx`

```typescript
export default function CreateEventPage() {
  return <div>Create Event — akan dibuat di folder 05</div>
}
```

### `src/pages/admin/EventDetailPage.tsx`

```typescript
export default function EventDetailPage() {
  return <div>Event Detail — akan dibuat di folder 05</div>
}
```

### `src/pages/admin/TemplateEditorPage.tsx`

```typescript
export default function TemplateEditorPage() {
  return <div>Template Editor — akan dibuat di folder 06</div>
}
```

### `src/pages/admin/ParticipantsPage.tsx`

```typescript
export default function ParticipantsPage() {
  return <div>Participants — akan dibuat di folder 08</div>
}
```

### `src/pages/admin/ParticipantDetailPage.tsx`

```typescript
export default function ParticipantDetailPage() {
  return <div>Participant Detail — akan dibuat di folder 08</div>
}
```

### `src/pages/admin/ExportPage.tsx`

```typescript
export default function ExportPage() {
  return <div>Export — akan dibuat di folder 12</div>
}
```

### `src/pages/public/NotFoundPage.tsx`

```typescript
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="mt-4 text-lg text-gray-600">Halaman tidak ditemukan</p>
        <Link 
          to="/" 
          className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
```

---

## 4. Setup Router di `src/App.tsx`

Ganti seluruh isi `src/App.tsx`:

```typescript
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
```

---

## Verifikasi

```bash
npm run dev
```

Test di browser:
- `/` → menampilkan "Landing Page"
- `/login` → menampilkan "Login Page"
- `/admin/dashboard` → redirect ke `/login` (belum login)
- `/verify/TEST-1234` → menampilkan "Verify Certificate"
- `/random-url` → menampilkan halaman 404

---

## Kriteria Selesai

- [ ] `ProtectedRoute` component sudah dibuat
- [ ] `PublicOnlyRoute` component sudah dibuat
- [ ] Semua halaman placeholder sudah dibuat (13 file)
- [ ] Router sudah dikonfigurasi di `App.tsx`
- [ ] Routing publik berfungsi (landing, register, verify, 404)
- [ ] Routing admin redirect ke login jika belum authenticated
- [ ] `/login` redirect ke dashboard jika sudah authenticated
