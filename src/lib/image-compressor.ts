import imageCompression from 'browser-image-compression'

export async function compressSelfie(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.3,           // Target: 300 KB per selfie (hemat storage)
    maxWidthOrHeight: 800,     // Max dimensi 800px
    useWebWorker: true,
    fileType: 'image/jpeg' as const,
  }

  const compressedFile = await imageCompression(file, options)
  return compressedFile
}
