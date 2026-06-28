# 01 — Auth Store & Login Logic

> **Prasyarat:** Supabase sudah terkonfigurasi, akun admin sudah dibuat (folder `02_supabase_setup` selesai).
> **File target:** `src/stores/authStore.ts`, `src/hooks/useAuth.ts`

---

## Tujuan

Membuat state management untuk autentikasi menggunakan Zustand, serta hook untuk login/logout.

---

## 1. Auth Store (`src/stores/authStore.ts`)

```typescript
import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Admin } from '../types/database'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  admin: Admin | null
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  admin: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      // Cek session yang ada
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Ambil data admin
        const { data: adminData } = await supabase
          .from('admins')
          .select('*')
          .eq('auth_id', session.user.id)
          .single()

        set({
          user: session.user,
          admin: adminData,
          isAuthenticated: !!adminData,
          isLoading: false,
        })
      } else {
        set({ isLoading: false })
      }

      // Listen ke perubahan auth state
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: adminData } = await supabase
            .from('admins')
            .select('*')
            .eq('auth_id', session.user.id)
            .single()

          set({
            user: session.user,
            admin: adminData,
            isAuthenticated: !!adminData,
          })
        } else if (event === 'SIGNED_OUT') {
          set({
            user: null,
            admin: null,
            isAuthenticated: false,
          })
        }
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ isLoading: false })
    }
  },

  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        // Cek apakah user adalah admin
        const { data: adminData } = await supabase
          .from('admins')
          .select('*')
          .eq('auth_id', data.user.id)
          .single()

        if (!adminData) {
          // User ada di auth tapi bukan admin — logout
          await supabase.auth.signOut()
          return { error: 'Anda tidak memiliki akses sebagai admin.' }
        }

        set({
          user: data.user,
          admin: adminData,
          isAuthenticated: true,
        })
      }

      return { error: null }
    } catch (error) {
      return { error: 'Terjadi kesalahan saat login. Coba lagi.' }
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({
      user: null,
      admin: null,
      isAuthenticated: false,
    })
  },
}))
```

---

## 2. Auth Hook (`src/hooks/useAuth.ts`)

```typescript
import { useAuthStore } from '../stores/authStore'

// Re-export store hook untuk kemudahan penggunaan
export const useAuth = useAuthStore
```

---

## 3. Initialize Auth di `src/main.tsx`

Update `src/main.tsx` untuk memuat auth state saat aplikasi dimulai:

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Dan di `src/App.tsx`, tambahkan inisialisasi:

```typescript
import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'

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

  // Router akan ditambahkan di file 02_routing.md
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <h1 className="text-3xl font-bold text-indigo-600">
        Certifora
      </h1>
    </div>
  )
}

export default App
```

---

## Kriteria Selesai

- [ ] File `src/stores/authStore.ts` sudah dibuat dengan login/logout/initialize
- [ ] File `src/hooks/useAuth.ts` sudah dibuat
- [ ] Auth diinisialisasi saat aplikasi dimulai di `App.tsx`
- [ ] Loading state tampil saat auth sedang diinisialisasi
- [ ] `npm run dev` berjalan tanpa error
