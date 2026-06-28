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
