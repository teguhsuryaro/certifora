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
      participants(count),
      certificate_templates(template_file_path)
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
