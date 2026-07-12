const MAX_LONG_EDGE = 1600
const JPEG_QUALITY = 0.85

export interface PreparedImage {
  base64: string
  mediaType: 'image/jpeg'
}

export async function prepareReceiptImage(file: File): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_LONG_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to encode image'))),
      'image/jpeg',
      JPEG_QUALITY,
    )
  })

  const base64 = await blobToBase64(blob)
  return { base64, mediaType: 'image/jpeg' }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}
