export const RECEIPT_JSON_SCHEMA = {
  type: 'object',
  properties: {
    isReceipt: { type: 'boolean' },
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
          lowConfidence: { type: 'boolean' },
        },
        required: ['name', 'quantity', 'totalPrice', 'lowConfidence'],
        additionalProperties: false,
      },
    },
  },
  required: ['isReceipt', 'merchantName', 'subtotal', 'tax', 'tip', 'grandTotal', 'confidence', 'notes', 'items'],
  additionalProperties: false,
} as const

export const EXTRACTION_PROMPT = `You are reading a photo to extract structured data from a physical receipt (restaurant, grocery store, etc.).

First, decide whether the image is actually a photo of a receipt or itemized bill.
- If it is NOT a receipt (e.g. a random object, a person, a blank surface, an unrelated document), set "isReceipt" to false, set "merchantName", "subtotal", "tax", "tip", and "grandTotal" to null, "items" to an empty array, "confidence" to "low", and use "notes" to briefly say what the image actually shows instead. Do not guess at receipt data for a non-receipt image.
- If it IS a receipt, set "isReceipt" to true and extract it fully per the rules below.

Read every line item exactly as printed, including quantity and price.

Rules:
- "totalPrice" is the line's total for that item (not the unit price), in dollars as a plain number (e.g. 12.99, not "$12.99").
- "quantity" is the count printed on that line if shown (e.g. "2x Burger" -> 2). Use null if not shown or unclear.
- Do not include tax, tip, subtotal, or grand total as line items — report those separately in their own fields.
- "subtotal", "tax", "tip", and "grandTotal" are null if not printed on the receipt or not clearly legible.
- Set "lowConfidence" to true on a per-item basis for any line where you had to guess at the name, price, or quantity (smudged print, ambiguous character, partially cropped) — false for lines you read with certainty.
- Set the overall "confidence" to "low" if the image is blurry, cropped, at an angle, faded (thermal paper), or you are guessing at most amounts. Set it to "medium" if mostly readable with a couple of uncertain items. Set it to "high" only if every amount is clearly legible.
- Use "notes" to briefly explain anything you're unsure about (e.g. "tip line is handwritten and hard to read"), or null if nothing to flag.
- Every number must be the actual numeric value on the receipt — never estimate or round to a "plausible" number.`
