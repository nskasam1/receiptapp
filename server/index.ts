import 'dotenv/config'
import express from 'express'
import { parseReceiptCore } from './parseReceiptCore.js'

const PORT = Number(process.env.PORT) || 8787

const app = express()
app.use(express.json({ limit: '15mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ocrConfigured: Boolean(process.env.ANTHROPIC_API_KEY) })
})

app.post('/api/parse-receipt', async (req, res) => {
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
    case 'not_a_receipt':
      res.status(422).json({ error: 'not_a_receipt', notes: result.notes })
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
      res.json(result.data)
      return
  }
})

app.listen(PORT, () => {
  console.log(`SplitScan OCR server listening on http://localhost:${PORT}`)
})
