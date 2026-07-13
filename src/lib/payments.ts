import type { PaymentProvider } from './supabase/paymentHandles'

export const PAYMENT_PROVIDERS: { id: PaymentProvider; label: string; placeholder: string }[] = [
  { id: 'venmo', label: 'Venmo', placeholder: 'username' },
  { id: 'cashapp', label: 'Cash App', placeholder: 'cashtag (no $)' },
  { id: 'paypal', label: 'PayPal', placeholder: 'paypal.me username' },
  { id: 'zelle', label: 'Zelle', placeholder: 'email or phone' },
]

/**
 * Zelle has no public "pay this handle" URL scheme — transfers only happen
 * inside the sender's own banking app, so there's nothing to link to. Every
 * other provider returns a clickable pay link; Zelle returns null and callers
 * should show the handle as plain text to copy instead.
 *
 * `amountCents` is optional: pass it to pre-fill a specific amount (Venmo,
 * Cash App, and PayPal all support this in their URL), or omit it for a
 * generic profile/pay-me link the recipient fills in themselves.
 */
export function buildPaymentLink(provider: PaymentProvider, handle: string, amountCents?: number): string | null {
  const amount = amountCents === undefined ? null : (amountCents / 100).toFixed(2)
  const encodedHandle = encodeURIComponent(handle)
  switch (provider) {
    case 'venmo': {
      const params = new URLSearchParams({ txn: 'pay', note: 'Bill split via SplitScan' })
      if (amount) params.set('amount', amount)
      return `https://venmo.com/${encodedHandle}?${params.toString()}`
    }
    case 'cashapp':
      return amount ? `https://cash.app/$${encodedHandle}/${amount}` : `https://cash.app/$${encodedHandle}`
    case 'paypal':
      return amount ? `https://paypal.me/${encodedHandle}/${amount}` : `https://paypal.me/${encodedHandle}`
    case 'zelle':
      return null
  }
}
