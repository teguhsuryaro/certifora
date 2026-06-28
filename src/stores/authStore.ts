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

export const useAuthStore = create<AuthState>((set) => ({
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
      console.error('Login error:', error)
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
