# 01 — Service Layer & Store Event

> **Prasyarat:** Design system sudah selesai (folder `04_design_system` selesai).
> **File target:** `src/services/eventService.ts`, `src/stores/eventStore.ts`

---

## Tujuan

Membuat service layer (API calls ke Supabase) dan Zustand store untuk mengelola data event.

---

## 1. Event Service (`src/services/eventService.ts`)

```typescript
import { supabase } from '../lib/supabase'
import type {
  Event, EventInsert, EventUpdate, EventStatus,
  EventEmailSettings, EventEmailSettingsInsert, EventEmailSettingsUpdate,
  CertificateTemplate, CertificateTemplateInsert,
  EventStatusHistory, EventStatusHistoryInsert,
} from '../types/database'

// ============================================
// EVENTS
// ============================================

export async function fetchEvents() {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      participants(count)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function fetchEventById(eventId: string) {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      event_email_settings(*),
      certificate_templates(*),
      participants(count)
    `)
    .eq('id', eventId)
    .single()

  if (error) throw error
  return data
}

export async function createEvent(eventData: EventInsert) {
  // 1. Insert event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert(eventData)
    .select()
    .single()

  if (eventError) throw eventError

  // 2. Buat email settings default
  const { error: emailError } = await supabase
    .from('event_email_settings')
    .insert({ event_id: event.id })

  if (emailError) throw emailError

  // 3. Buat certificate template default (kosong)
  const { error: templateError } = await supabase
    .from('certificate_templates')
    .insert({ event_id: event.id })

  if (templateError) throw templateError

  // 4. Catat status history
  const { error: historyError } = await supabase
    .from('event_status_history')
    .insert({
      event_id: event.id,
      new_status: 'draft',
    })

  if (historyError) throw historyError

  return event
}

export async function updateEvent(eventId: string, updates: EventUpdate) {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateEventStatus(
  eventId: string,
  oldStatus: EventStatus,
  newStatus: EventStatus,
  adminId?: string
) {
  // Update status event
  const { error: updateError } = await supabase
    .from('events')
    .update({ status: newStatus })
    .eq('id', eventId)

  if (updateError) throw updateError

  // Catat history perubahan status
  const { error: historyError } = await supabase
    .from('event_status_history')
    .insert({
      event_id: eventId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: adminId,
    })

  if (historyError) throw historyError
}

// ============================================
// EMAIL SETTINGS
// ============================================

export async function updateEmailSettings(eventId: string, updates: EventEmailSettingsUpdate) {
  const { data, error } = await supabase
    .from('event_email_settings')
    .update(updates)
    .eq('event_id', eventId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// EVENT QR CODE URL
// ============================================

export function getEventRegistrationUrl(eventId: string): string {
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin
  return `${baseUrl}/event/${eventId}/register`
}
```

---

## 2. Event Store (`src/stores/eventStore.ts`)

```typescript
import { create } from 'zustand'
import type { Event, EventInsert, EventUpdate, EventStatus } from '../types/database'
import * as eventService from '../services/eventService'

interface EventWithCounts extends Event {
  participants: { count: number }[]
}

interface EventState {
  events: EventWithCounts[]
  currentEvent: any | null  // Event with relations
  isLoading: boolean
  error: string | null

  // Actions
  fetchEvents: () => Promise<void>
  fetchEventById: (eventId: string) => Promise<void>
  createEvent: (data: EventInsert) => Promise<Event>
  updateEvent: (eventId: string, updates: EventUpdate) => Promise<void>
  updateEventStatus: (eventId: string, oldStatus: EventStatus, newStatus: EventStatus, adminId?: string) => Promise<void>
  clearError: () => void
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  currentEvent: null,
  isLoading: false,
  error: null,

  fetchEvents: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await eventService.fetchEvents()
      set({ events: data as EventWithCounts[], isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchEventById: async (eventId: string) => {
    set({ isLoading: true, error: null })
    try {
      const data = await eventService.fetchEventById(eventId)
      set({ currentEvent: data, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  createEvent: async (data: EventInsert) => {
    set({ isLoading: true, error: null })
    try {
      const event = await eventService.createEvent(data)
      // Refresh list
      await get().fetchEvents()
      set({ isLoading: false })
      return event
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updateEvent: async (eventId: string, updates: EventUpdate) => {
    set({ isLoading: true, error: null })
    try {
      await eventService.updateEvent(eventId, updates)
      // Refresh current event & list
      await get().fetchEventById(eventId)
      await get().fetchEvents()
      set({ isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updateEventStatus: async (eventId, oldStatus, newStatus, adminId) => {
    set({ isLoading: true, error: null })
    try {
      await eventService.updateEventStatus(eventId, oldStatus, newStatus, adminId)
      await get().fetchEventById(eventId)
      await get().fetchEvents()
      set({ isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  clearError: () => set({ error: null }),
}))
```

---

## Kriteria Selesai

- [ ] `src/services/eventService.ts` sudah dibuat dengan semua CRUD operations
- [ ] `src/stores/eventStore.ts` sudah dibuat dengan state management
- [ ] Import berfungsi tanpa TypeScript error
- [ ] `npm run dev` berjalan tanpa error
