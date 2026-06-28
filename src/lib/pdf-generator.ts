import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { generateQrPng } from './qr-generator'
import type { CertificateTemplate, TextFormat, QrPosition } from '../types/database'

interface GeneratePdfOptions {
  templatePdfBytes: ArrayBuffer       // Template PDF sebagai bytes
  participantName: string             // Nama peserta
  certificateCode: string             // Kode sertifikat (untuk QR + URL)
  verifyBaseUrl: string               // Base URL untuk verifikasi

  // Pengaturan dari template (atau override per peserta)
  namePositionX: number               // Posisi X dalam persen (0-100)
  namePositionY: number               // Posisi Y dalam persen (0-100)
  fontSize: number                    // Ukuran font dalam pt
  fontColor: string                   // Warna hex (misal '#000000')
  fontFamily: string                  // Nama font
  textFormat: TextFormat              // Format teks
  qrPosition: QrPosition             // Posisi QR
  qrSize: number                     // Ukuran QR dalam px
}

// Format nama sesuai pengaturan
function formatName(name: string, format: TextFormat): string {
  switch (format) {
    case 'uppercase':
      return name.toUpperCase()
    case 'lowercase':
      return name.toLowerCase()
    case 'title_case':
      return name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    default:
      return name
  }
}

// Parse hex color ke rgb values (0-1)
function parseHexColor(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { r: 0, g: 0, b: 0 }
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  }
}

// Hitung posisi QR di halaman PDF
function calculateQrPosition(
  position: QrPosition,
  pageWidth: number,
  pageHeight: number,
  qrSize: number,
  margin: number = 30
): { x: number; y: number } {
  switch (position) {
    case 'top_left':
      return { x: margin, y: pageHeight - margin - qrSize }
    case 'top_right':
      return { x: pageWidth - margin - qrSize, y: pageHeight - margin - qrSize }
    case 'bottom_left':
      return { x: margin, y: margin }
    case 'bottom_right':
      return { x: pageWidth - margin - qrSize, y: margin }
  }
}

export async function generateCertificatePdf(
  options: GeneratePdfOptions
): Promise<{ pdfBytes: Uint8Array; pdfBase64: string }> {
  // 1. Load template PDF
  const pdfDoc = await PDFDocument.load(options.templatePdfBytes)
  
  // Register fontkit untuk custom fonts
  pdfDoc.registerFontkit(fontkit)

  // 2. Ambil halaman pertama
  const pages = pdfDoc.getPages()
  const page = pages[0]
  const { width: pageWidth, height: pageHeight } = page.getSize()

  // 3. Embed font
  // Coba load custom font dari /public/fonts/, fallback ke standard font
  let font
  try {
    // Note: in browser environment, fetch works. In Edge Function we might need a different approach,
    // but this code is meant to run in the browser prior to sending to Edge Function, 
    // OR we will send it to Edge Function. Wait, the guide says "di browser menggunakan pdf-lib".
    const fontUrl = `/fonts/${options.fontFamily}/${options.fontFamily}-Regular.ttf`
    const fontResponse = await fetch(fontUrl)
    if (fontResponse.ok) {
      const fontBytes = await fontResponse.arrayBuffer()
      font = await pdfDoc.embedFont(fontBytes)
    } else {
      font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    }
  } catch {
    font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  }

  // 4. Format dan gambar nama peserta
  const formattedName = formatName(options.participantName, options.textFormat)
  const color = parseHexColor(options.fontColor)

  // Hitung posisi berdasarkan persen
  const nameX = (options.namePositionX / 100) * pageWidth
  const nameY = pageHeight - (options.namePositionY / 100) * pageHeight // PDF Y dari bawah

  // Center text secara horizontal di posisi X
  const textWidth = font.widthOfTextAtSize(formattedName, options.fontSize)
  const centeredX = nameX - textWidth / 2

  page.drawText(formattedName, {
    x: centeredX,
    y: nameY,
    size: options.fontSize,
    font: font,
    color: rgb(color.r, color.g, color.b),
  })

  // 5. Generate dan gambar QR Code
  const verifyUrl = `${options.verifyBaseUrl}/verify/${options.certificateCode}`
  const qrPngBytes = await generateQrPng(verifyUrl, options.qrSize)
  const qrImage = await pdfDoc.embedPng(qrPngBytes)

  const qrPos = calculateQrPosition(options.qrPosition, pageWidth, pageHeight, options.qrSize)
  page.drawImage(qrImage, {
    x: qrPos.x,
    y: qrPos.y,
    width: options.qrSize,
    height: options.qrSize,
  })

  // 6. Export PDF
  const pdfBytes = await pdfDoc.save()
  
  // Convert ke base64 untuk pengiriman via Edge Function
  const base64 = btoa(
    Array.from(pdfBytes)
      .map(byte => String.fromCharCode(byte))
      .join('')
  )

  return { pdfBytes, pdfBase64: base64 }
}

// Helper: Merge template settings dengan override per peserta
export function mergeWithOverrides(
  template: CertificateTemplate,
  overrides?: {
    name_position_x: number | null
    name_position_y: number | null
    name_font_size: number | null
  } | null
) {
  return {
    namePositionX: overrides?.name_position_x ?? template.name_position_x,
    namePositionY: overrides?.name_position_y ?? template.name_position_y,
    fontSize: overrides?.name_font_size ?? template.name_font_size,
    fontColor: template.name_font_color,
    fontFamily: template.name_font_family,
    textFormat: template.name_text_format,
    qrPosition: template.qr_position,
    qrSize: template.qr_size,
  }
}
