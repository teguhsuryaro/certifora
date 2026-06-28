import QRCode from 'qrcode'

export async function generateQrPng(
  text: string,
  size: number = 150
): Promise<Uint8Array> {
  // Generate QR sebagai Data URL (PNG)
  const dataUrl = await QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel: 'M',
  })

  // Convert data URL ke Uint8Array
  const base64 = dataUrl.split(',')[1]
  const binaryStr = atob(base64)
  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i)
  }
  return bytes
}
