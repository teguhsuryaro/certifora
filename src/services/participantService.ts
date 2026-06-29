import { supabase } from '../lib/supabase'
import type { ParticipantInsert, Participant } from '../types/database'

// Generate kode sertifikat unik
function generateCertificateCode(prefix: string): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000) // 4 digit acak
  return `${prefix}-${randomNum}`
}

// Cek apakah kode sudah ada
async function isCodeUnique(code: string): Promise<boolean> {
  const { data } = await supabase
    .from('certificate_codes')
    .select('id')
    .eq('code', code)
    .single()
  return !data
}

// Generate kode unik (retry jika duplikat)
export async function generateUniqueCode(prefix: string): Promise<string> {
  let attempts = 0
  while (attempts < 10) {
    const code = generateCertificateCode(prefix)
    const unique = await isCodeUnique(code)
    if (unique) return code
    attempts++
  }
  throw new Error('Gagal membuat kode sertifikat unik setelah 10 percobaan')
}

// Upload selfie ke Supabase Storage
export async function uploadSelfie(eventId: string, file: File): Promise<string> {
  const fileName = `${eventId}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`

  const { error } = await supabase.storage
    .from('selfies')
    .upload(fileName, file, {
      contentType: 'image/jpeg',
    })

  if (error) throw error
  return fileName
}

// Register peserta baru
export async function registerParticipant(
  eventId: string,
  fullName: string,
  email: string,
  selfieFile: File,
  eventPrefix: string
): Promise<Participant> {
  // 1. Upload selfie
  const selfiePath = await uploadSelfie(eventId, selfieFile)

  // 2. Generate kode unik & ID
  const certificateCode = await generateUniqueCode(eventPrefix)
  const participantId = crypto.randomUUID()

  // 3. Insert participant (tanpa .select() untuk menghindari RLS read policy error)
  const { error: participantError } = await supabase
    .from('participants')
    .insert({
      id: participantId,
      event_id: eventId,
      full_name: fullName,
      email: email,
      selfie_path: selfiePath,
      certificate_code: certificateCode,
    })

  if (participantError) throw participantError

  // 4. Insert certificate code
  const { error: codeError } = await supabase
    .from('certificate_codes')
    .insert({
      code: certificateCode,
      participant_id: participantId,
      event_id: eventId,
    })

  if (codeError) throw codeError

  // 5. Fetch full participant data
  const { data: participant, error: fetchError } = await supabase
    .from('participants')
    .select('*')
    .eq('id', participantId)
    .single()

  if (fetchError) throw fetchError

  return participant
}

// Fetch data event untuk halaman registrasi (publik)
export async function fetchEventForRegistration(eventId: string) {
  const { data, error } = await supabase
    .from('events')
    .select('id, name, description, organizer, location, event_date, event_time, status, prefix')
    .eq('id', eventId)
    .single()

  if (error) throw error
  return data
}

// ============================================
// ADMIN: Fetch participants
// ============================================

export async function fetchParticipants(eventId: string) {
  const { data, error } = await supabase
    .from('participants')
    .select(`
      *,
      template_overrides(*)
    `)
    .eq('event_id', eventId)
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return data
}

export async function fetchParticipantById(participantId: string) {
  const { data, error } = await supabase
    .from('participants')
    .select(`
      *,
      template_overrides(*),
      delivery_logs(*)
    `)
    .eq('id', participantId)
    .single()

  if (error) throw error
  return data
}
export async function deleteParticipant(id: string) { const { error } = await supabase.from('participants').delete().eq('id', id); if (error) throw error; } 
