import { supabase } from '../lib/supabase'
import { generateCertificatePdf, mergeWithOverrides } from '../lib/pdf-generator'
import * as templateService from './templateService'
import type { Participant, CertificateTemplate, EventEmailSettings } from '../types/database'
import { DAILY_EMAIL_LIMIT } from '../constants'

export interface SendResult {
  participantId: string
  success: boolean
  error?: string
}

export interface BatchProgress {
  total: number
  sent: number
  failed: number
  skipped: number
  currentName: string
  isComplete: boolean
  dailyLimitReached: boolean
}

export type ProgressCallback = (progress: BatchProgress) => void

// ============================================
// Kirim sertifikat ke 1 peserta
// ============================================
export async function sendCertificateToParticipant(
  participant: Participant,
  template: CertificateTemplate,
  emailSettings: EventEmailSettings,
  eventName: string,
  organizer: string,
  overrides?: any
): Promise<SendResult> {
  try {
    // 1. Fetch template PDF bytes
    if (!template.template_file_path) {
      throw new Error('Template PDF belum diupload')
    }

    const templateUrl = await templateService.getTemplateUrl(template.template_file_path)
    const templateResponse = await fetch(templateUrl)
    const templateBytes = await templateResponse.arrayBuffer()

    // 2. Merge settings dengan overrides
    const settings = mergeWithOverrides(template, overrides)
    const verifyBaseUrl = import.meta.env.VITE_APP_URL || window.location.origin

    // 3. Generate PDF
    const { pdfBase64 } = await generateCertificatePdf({
      templatePdfBytes: templateBytes,
      participantName: participant.full_name,
      certificateCode: participant.certificate_code,
      verifyBaseUrl,
      ...settings,
    })

    // 4. Kirim via Edge Function
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Sesi admin tidak ditemukan')

    const response = await supabase.functions.invoke('send-certificate-email', {
      body: {
        participantId: participant.id,
        recipientEmail: participant.email,
        recipientName: participant.full_name,
        pdfBase64: pdfBase64,
        fileName: `Sertifikat_${participant.certificate_code}.pdf`,
        subject: emailSettings.subject,
        title: emailSettings.title,
        body: emailSettings.body,
        eventName: eventName,
        organizer: organizer,
      },
    })

    if (response.error) {
      throw new Error(response.error.message || 'Gagal mengirim email')
    }

    return { participantId: participant.id, success: true }
  } catch (error: any) {
    return {
      participantId: participant.id,
      success: false,
      error: error.message || 'Gagal mengirim sertifikat',
    }
  }
}

// ============================================
// Kirim semua (batch) dengan batching harian
// ============================================
export async function sendAllCertificates(
  participants: Participant[],
  template: CertificateTemplate,
  emailSettings: EventEmailSettings,
  eventName: string,
  organizer: string,
  onProgress: ProgressCallback,
  signal?: AbortSignal
): Promise<SendResult[]> {
  const pendingParticipants = participants.filter(p => p.delivery_status !== 'success')
  const results: SendResult[] = []

  const progress: BatchProgress = {
    total: pendingParticipants.length,
    sent: 0,
    failed: 0,
    skipped: 0,
    currentName: '',
    isComplete: false,
    dailyLimitReached: false,
  }

  // Cek berapa email sudah terkirim hari ini
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count: todaySentCount } = await supabase
    .from('delivery_logs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'success')
    .gte('sent_at', todayStart.toISOString())

  let remainingQuota = DAILY_EMAIL_LIMIT - (todaySentCount || 0)

  if (remainingQuota <= 0) {
    progress.dailyLimitReached = true
    progress.isComplete = true
    onProgress({ ...progress })
    return results
  }

  // Fetch template PDF sekali saja
  if (!template.template_file_path) {
    throw new Error('Template PDF belum diupload')
  }

  const templateUrl = await templateService.getTemplateUrl(template.template_file_path)
  const templateResponse = await fetch(templateUrl)
  const templateBytes = await templateResponse.arrayBuffer()

  // Kirim satu per satu
  for (const participant of pendingParticipants) {
    if (signal?.aborted) {
      progress.skipped += pendingParticipants.length - progress.sent - progress.failed
      break
    }

    if (remainingQuota <= 0) {
      progress.dailyLimitReached = true
      progress.skipped += pendingParticipants.length - progress.sent - progress.failed
      break
    }

    progress.currentName = participant.full_name
    onProgress({ ...progress })

    try {
      // Fetch override per peserta (safely, might be null)
      const { data: overrideData, error: overrideError } = await supabase
        .from('template_overrides')
        .select('*')
        .eq('participant_id', participant.id)
        .maybeSingle()

      if (overrideError) {
        console.warn(`Gagal memuat override untuk ${participant.id}:`, overrideError.message)
      }

      const settings = mergeWithOverrides(template, overrideData)
      const verifyBaseUrl = import.meta.env.VITE_APP_URL || window.location.origin

      // Generate PDF
      const { pdfBase64 } = await generateCertificatePdf({
        templatePdfBytes: templateBytes,
        participantName: participant.full_name,
        certificateCode: participant.certificate_code,
        verifyBaseUrl,
        ...settings,
      })

      // Kirim email
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sesi admin tidak ditemukan')

      const response = await supabase.functions.invoke('send-certificate-email', {
        body: {
          participantId: participant.id,
          recipientEmail: participant.email,
          recipientName: participant.full_name,
          pdfBase64,
          fileName: `Sertifikat_${participant.certificate_code}.pdf`,
          subject: emailSettings.subject,
          title: emailSettings.title,
          body: emailSettings.body,
          eventName,
          organizer,
        },
      })

      if (response.error) throw new Error(response.error.message)

      results.push({ participantId: participant.id, success: true })
      progress.sent++
      remainingQuota--
    } catch (error: any) {
      results.push({ participantId: participant.id, success: false, error: error.message })
      progress.failed++
    }

    onProgress({ ...progress })

    // Delay kecil antar pengiriman (hindari rate limit)
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  progress.isComplete = true
  onProgress({ ...progress })

  return results
}
