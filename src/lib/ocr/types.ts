export interface ParsedReceiptItem {
  name: string
  quantity: number | null
  totalPrice: number
  lowConfidence: boolean
}

export interface ParsedReceipt {
  merchantName: string | null
  subtotal: number | null
  tax: number | null
  tip: number | null
  grandTotal: number | null
  confidence: 'high' | 'medium' | 'low'
  notes: string | null
  items: ParsedReceiptItem[]
}

export type ParseReceiptOutcome =
  | { status: 'success'; receipt: ParsedReceipt }
  | { status: 'not_configured' }
  | { status: 'low_confidence'; receipt: ParsedReceipt }
  | { status: 'error'; message: string }
