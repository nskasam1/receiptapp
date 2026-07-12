export const RECEIPT_JSON_SCHEMA = {
  type: 'object',
  properties: {
    merchantName: { type: ['string', 'null'] },
    subtotal: { type: ['number', 'null'] },
    tax: { type: ['number', 'null'] },
    tip: { type: ['number', 'null'] },
    grandTotal: { type: ['number', 'null'] },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    notes: { type: ['string', 'null'] },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          quantity: { type: ['number', 'null'] },
          totalPrice: { type: 'number' },
        },
        required: ['name', 'quantity', 'totalPrice'],
        additionalProperties: false,
      },
    },
  },
  required: ['merchantName', 'subtotal', 'tax', 'tip', 'grandTotal', 'confidence', 'notes', 'items'],
  additionalProperties: false,
} as const

export const EXTRACTION_PROMPT = `You are reading a photo of a physical receipt (restaurant, grocery store, etc.) to extract structured data. Read every line item exactly as printed, including quantity and price.

Rules:
- "totalPrice" is the line's total for that item (not the unit price), in dollars as a plain number (e.g. 12.99, not "$12.99").
- "quantity" is the count printed on that line if shown (e.g. "2x Burger" -> 2). Use null if not shown or unclear.
- Do not include tax, tip, subtotal, or grand total as line items — report those separately in their own fields.
- "subtotal", "tax", "tip", and "grandTotal" are null if not printed on the receipt or not clearly legible.
- Set "confidence" to "low" if the image is blurry, cropped, at an angle, faded (thermal paper), or you are guessing at any amount. Set it to "medium" if mostly readable with a couple of uncertain items. Set it to "high" only if every amount is clearly legible.
- Use "notes" to briefly explain anything you're unsure about (e.g. "tip line is handwritten and hard to read"), or null if nothing to flag.
- Every number must be the actual numeric value on the receipt — never estimate or round to a "plausible" number.`
