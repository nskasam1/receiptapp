import type { VercelRequest, VercelResponse } from '@vercel/node'
import { parseReceiptCore } from '../server/parseReceiptCore.ts'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  const { imageBase64, mediaType } = req.body ?? {}
  const result = await parseReceiptCore(imageBase64, mediaType)

  switch (result.kind) {
    case 'not_configured':
      res.status(501).json({ error: 'ocr_not_configured' })
      return
    case 'missing_image':
      res.status(400).json({ error: 'missing_image' })
      return
    case 'unsupported_media_type':
      res.status(400).json({ error: 'unsupported_media_type' })
      return
    case 'refused':
      res.status(422).json({ error: 'refused' })
      return
    case 'truncated':
      res.status(422).json({ error: 'truncated' })
      return
    case 'no_output':
      res.status(502).json({ error: 'no_output' })
      return
    case 'rate_limited':
      res.status(429).json({ error: 'rate_limited' })
      return
    case 'invalid_api_key':
      res.status(401).json({ error: 'invalid_api_key' })
      return
    case 'insufficient_credits':
      res.status(402).json({ error: 'insufficient_credits' })
      return
    case 'upstream_error':
      res.status(502).json({ error: 'upstream_error' })
      return
    case 'ok':
      res.status(200).json(result.data)
      return
  }
}
