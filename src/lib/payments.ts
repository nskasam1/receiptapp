import type { PaymentProvider } from './supabase/paymentHandles'

export const PAYMENT_PROVIDERS: { id: PaymentProvider; label: string; placeholder: string }[] = [
  { id: 'venmo', label: 'Venmo', placeholder: 'username' },
  { id: 'cashapp', label: 'Cash App', placeholder: 'cashtag (no $)' },
  { id: 'paypal', label: 'PayPal', placeholder: 'paypal.me username' },
  { id: 'zelle', label: 'Zelle', placeholder: 'email or phone' },
]

/**
 * Zelle has no public "pay this specific handle" URL scheme — transfers only
 * happen inside the sender's own banking app (or the standalone Zelle app),
 * so there's no link that can pre-fill a recipient or amount the way Venmo,
 * Cash App, and PayPal do. `ZELLE_WEBSITE_URL` is the best real link
 * available; callers should show it alongside the handle (which still has to
 * be entered manually inside Zelle) rather than in place of it.
 */
export const ZELLE_WEBSITE_URL = 'https://www.zellepay.com/'

/**
 * `amountCents` is optional: pass it to pre-fill a specific amount (Venmo,
 * Cash App, and PayPal all support this in their URL), or omit it for a
 * generic profile/pay-me link the recipient fills in themselves. Returns
 * null for Zelle — see `ZELLE_WEBSITE_URL` above.
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
