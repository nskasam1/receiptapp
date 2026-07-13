import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  fetchPaymentHandles,
  removePaymentHandle,
  savePaymentHandle,
  type PaymentHandle,
  type PaymentProvider,
} from '../../lib/supabase/paymentHandles'
import { PAYMENT_PROVIDERS } from '../../lib/payments'
import { BrandIcon } from './BrandIcon'

const EMPTY_DRAFTS: Record<PaymentProvider, string> = { venmo: '', cashapp: '', paypal: '', zelle: '' }

export function PaymentMethodsPanel({ user }: { user: User }) {
  const [handles, setHandles] = useState<PaymentHandle[]>([])
  const [drafts, setDrafts] = useState<Record<PaymentProvider, string>>(EMPTY_DRAFTS)
  const [savingProvider, setSavingProvider] = useState<PaymentProvider | null>(null)

  useEffect(() => {
    fetchPaymentHandles(user.id).then((rows) => {
      setHandles(rows)
      const next = { ...EMPTY_DRAFTS }
      for (const row of rows) next[row.provider] = row.handle
      setDrafts(next)
    })
  }, [user.id])

  async function handleSave(provider: PaymentProvider) {
    const value = drafts[provider].trim()
    setSavingProvider(provider)
    if (value) {
      await savePaymentHandle(user.id, provider, value)
    } else {
      await removePaymentHandle(user.id, provider)
    }
    setHandles(await fetchPaymentHandles(user.id))
    setSavingProvider(null)
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <div>
        <p className="text-[13px] font-medium text-ink">Payment links</p>
        <p className="mt-0.5 text-[12px] text-muted">
          Add your handles so people can pay you straight from the Share step.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {PAYMENT_PROVIDERS.map((p) => {
          const current = handles.find((h) => h.provider === p.id)
          const draft = drafts[p.id]
          const dirty = draft.trim() !== (current?.handle ?? '')
          return (
            <div key={p.id} className="flex items-center gap-2">
              <BrandIcon provider={p.id} size={18} className="shrink-0 text-ink" />
              <input
                value={draft}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [p.id]: e.target.value }))}
                placeholder={`${p.label} ${p.placeholder}`}
                className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-[14px] text-ink placeholder:text-muted focus:border-primary"
              />
              {dirty && (
                <button
                  type="button"
                  onClick={() => handleSave(p.id)}
                  disabled={savingProvider === p.id}
                  className="shrink-0 text-[13px] font-medium text-primary disabled:opacity-50"
                >
                  Save
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
