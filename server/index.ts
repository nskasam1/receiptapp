import 'dotenv/config'
import express from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { EXTRACTION_PROMPT, RECEIPT_JSON_SCHEMA } from './receiptSchema.ts'

const PORT = Number(process.env.PORT) || 8787
const MODEL = 'claude-opus-4-8'

const ALLOWED_MEDIA_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

const app = express()
app.use(express.json({ limit: '15mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ocrConfigured: Boolean(process.env.ANTHROPIC_API_KEY) })
})

app.post('/api/parse-receipt', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(501).json({ error: 'ocr_not_configured' })
    return
  }

  const { imageBase64, mediaType } = req.body ?? {}
  if (typeof imageBase64 !== 'string' || !imageBase64) {
    res.status(400).json({ error: 'missing_image' })
    return
  }
  if (typeof mediaType !== 'string' || !ALLOWED_MEDIA_TYPES.has(mediaType)) {
    res.status(400).json({ error: 'unsupported_media_type' })
    return
  }

  const client = new Anthropic({ apiKey })

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/webp', data: imageBase64 },
            },
            { type: 'text', text: EXTRACTION_PROMPT },
          ],
        },
      ],
      output_config: {
        format: { type: 'json_schema', schema: RECEIPT_JSON_SCHEMA },
      },
    })

    if (response.stop_reason === 'refusal') {
      res.status(422).json({ error: 'refused' })
      return
    }
    if (response.stop_reason === 'max_tokens') {
      res.status(422).json({ error: 'truncated' })
      return
    }

    const textBlock = response.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      res.status(502).json({ error: 'no_output' })
      return
    }

    const parsed = JSON.parse(textBlock.text)
    res.json(parsed)
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      res.status(429).json({ error: 'rate_limited' })
      return
    }
    if (err instanceof Anthropic.AuthenticationError) {
      res.status(401).json({ error: 'invalid_api_key' })
      return
    }
    if (err instanceof Anthropic.BadRequestError && /credit balance/i.test(err.message)) {
      res.status(402).json({ error: 'insufficient_credits' })
      return
    }
    console.error('parse-receipt failed:', err)
    res.status(502).json({ error: 'upstream_error' })
  }
})

app.listen(PORT, () => {
  console.log(`SplitScan OCR server listening on http://localhost:${PORT}`)
})
