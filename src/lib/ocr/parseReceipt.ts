import { prepareReceiptImage } from './preprocess'
import type { ParseReceiptOutcome } from './types'

export async function parseReceiptImage(file: File): Promise<ParseReceiptOutcome> {
  let prepared
  try {
    prepared = await prepareReceiptImage(file)
  } catch {
    return { status: 'error', message: "Couldn't read that image" }
  }

  let response: Response
  try {
    response = await fetch('/api/parse-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: prepared.base64, mediaType: prepared.mediaType }),
    })
  } catch {
    return { status: 'error', message: 'No connection — check your signal and try again' }
  }

  if (response.status === 501) return { status: 'not_configured' }
  if (response.status === 429) return { status: 'error', message: 'Too many scans right now — try again in a moment' }
  if (response.status === 422) {
    const body = await response.json().catch(() => null)
    return {
      status: 'error',
      message:
        body?.error === 'refused'
          ? "Couldn't read this receipt — try a clearer photo or enter it manually"
          : 'Got cut off partway through — try again',
    }
  }
  if (!response.ok) {
    return { status: 'error', message: "Couldn't reach the scanner — try again or enter it manually" }
  }

  const receipt = await response.json()
  if (receipt.confidence === 'low') return { status: 'low_confidence', receipt }
  return { status: 'success', receipt }
}
