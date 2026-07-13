import Anthropic from '@anthropic-ai/sdk'
import { EXTRACTION_PROMPT, RECEIPT_JSON_SCHEMA } from './receiptSchema.js'

const MODEL = 'claude-sonnet-5'
const ALLOWED_MEDIA_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export type ParseReceiptResult =
  | { kind: 'not_configured' }
  | { kind: 'missing_image' }
  | { kind: 'unsupported_media_type' }
  | { kind: 'refused' }
  | { kind: 'not_a_receipt'; notes: string | null }
  | { kind: 'truncated' }
  | { kind: 'no_output' }
  | { kind: 'rate_limited' }
  | { kind: 'invalid_api_key' }
  | { kind: 'insufficient_credits' }
  | { kind: 'upstream_error' }
  | { kind: 'ok'; data: unknown }

export async function parseReceiptCore(imageBase64: unknown, mediaType: unknown): Promise<ParseReceiptResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { kind: 'not_configured' }

  if (typeof imageBase64 !== 'string' || !imageBase64) return { kind: 'missing_image' }
  if (typeof mediaType !== 'string' || !ALLOWED_MEDIA_TYPES.has(mediaType)) {
    return { kind: 'unsupported_media_type' }
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

    if (response.stop_reason === 'refusal') return { kind: 'refused' }
    if (response.stop_reason === 'max_tokens') return { kind: 'truncated' }

    const textBlock = response.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') return { kind: 'no_output' }

    const data = JSON.parse(textBlock.text)
    if (data.isReceipt === false) return { kind: 'not_a_receipt', notes: data.notes ?? null }

    return { kind: 'ok', data }
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return { kind: 'rate_limited' }
    if (err instanceof Anthropic.AuthenticationError) return { kind: 'invalid_api_key' }
    if (err instanceof Anthropic.BadRequestError && /credit balance/i.test(err.message)) {
      return { kind: 'insufficient_credits' }
    }
    console.error('parse-receipt failed:', err)
    return { kind: 'upstream_error' }
  }
}
