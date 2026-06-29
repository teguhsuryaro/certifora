import { supabase } from '../lib/supabase'
import type { CertificateTemplateUpdate } from '../types/database'

export async function uploadTemplatePdf(eventId: string, file: File): Promise<string> {
  const filePath = `${eventId}/${Date.now()}_${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('certificate-templates')
    .upload(filePath, file, {
      upsert: true,
      contentType: 'application/pdf',
    })

  if (uploadError) throw uploadError

  // Update tabel certificate_templates
  const { error: updateError } = await supabase
    .from('certificate_templates')
    .update({
      template_file_path: filePath,
      template_file_name: file.name,
      // Reset posisi saat template diganti
      name_position_x: 50.0,
      name_position_y: 50.0,
    })
    .eq('event_id', eventId)

  if (updateError) throw updateError

  return filePath
}

export async function getTemplateUrl(filePath: string): Promise<string> {
  const { data } = await supabase.storage
    .from('certificate-templates')
    .createSignedUrl(filePath, 3600) // 1 jam expiry

  if (!data?.signedUrl) throw new Error('Failed to get template URL')
  return data.signedUrl
}

export async function updateTemplateSettings(
  eventId: string,
  updates: CertificateTemplateUpdate
) {
  const { data, error } = await supabase
    .from('certificate_templates')
    .update(updates)
    .eq('event_id', eventId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function fetchTemplateByEventId(eventId: string) {
  const { data, error } = await supabase
    .from('certificate_templates')
    .select('*')
    .eq('event_id', eventId)
    .single()

  if (error) throw error
  return data
}

export async function isTemplateReady(eventId: string): Promise<boolean> {
  try {
    const template = await fetchTemplateByEventId(eventId)
    return !!(template && template.template_file_path)
  } catch (error) {
    console.error('Error checking template status:', error)
    return false
  }
}
