/**
 * Merender halaman pertama PDF menjadi image Data URL
 * Menggunakan pdfjs-dist untuk rendering (install: npm install pdfjs-dist)
 * 
 * CATATAN: Jika tidak ingin install pdfjs-dist, alternatifnya:
 * - Gunakan <iframe> atau <embed> untuk menampilkan PDF langsung
 * - Gunakan library react-pdf
 * 
 * Untuk kesederhanaan, kita gunakan pendekatan canvas:
 */

export async function renderPdfToImage(
  pdfUrl: string,
  scale: number = 2
): Promise<{ dataUrl: string; width: number; height: number }> {
  // Dynamic import pdfjs-dist
  const pdfjsLib = await import('pdfjs-dist')
  
  // Use local worker bundled by Vite
  const workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

  const pdf = await pdfjsLib.getDocument({ url: pdfUrl }).promise
  const page = await pdf.getPage(1)
  
  const viewport = page.getViewport({ scale })
  
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  
  const context = canvas.getContext('2d')!
  await page.render({ canvasContext: context, viewport }).promise

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: viewport.width,
    height: viewport.height,
  }
}
