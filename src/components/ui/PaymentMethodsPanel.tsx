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
import { Toast } from './Toast'

const EMPTY_DRAFTS: Record<PaymentProvider, string> = { venmo: '', cashapp: '', paypal: '', zelle: '' }

export function PaymentMethodsPanel({ user }: { user: User }) {
  const [handles, setHandles] = useState<PaymentHandle[]>([])
  const [drafts, setDrafts] = useState<Record<PaymentProvider, string>>(EMPTY_DRAFTS)
  const [selected, setSelected] = useState<Set<PaymentProvider>>(new Set())
  const [savingProvider, setSavingProvider] = useState<PaymentProvider | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetchPaymentHandles(user.id).then((rows) => {
      setHandles(rows)
      const next = { ...EMPTY_DRAFTS }
      for (const row of rows) next[row.provider] = row.handle
      setDrafts(next)
      setSelected(new Set(rows.map((r) => r.provider)))
    })
  }, [user.id])

  function toggleSelected(provider: PaymentProvider) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(provider)) {
        next.delete(provider)
      } else {
        next.add(provider)
      }
      return next
    })
  }

  async function handleSave(provider: PaymentProvider) {
    const label = PAYMENT_PROVIDERS.find((p) => p.id === provider)?.label ?? provider
    const value = drafts[provider].trim()
    setSavingProvider(provider)
    if (value) {
      await savePaymentHandle(user.id, provider, value)
      setToast(`${label} saved`)
    } else {
      await removePaymentHandle(user.id, provider)
      setToast(`${label} removed`)
    }
    setHandles(await fetchPaymentHandles(user.id))
    setSavingProvider(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-center gap-4">
        {PAYMENT_PROVIDERS.map((p) => {
          const isSelected = selected.has(p.id)
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggleSelected(p.id)}
              aria-pressed={isSelected}
              aria-label={p.label}
              className={`flex flex-col items-center gap-1.5 transition-transform duration-200 ${isSelected ? 'scale-105' : ''}`}
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full border shadow-sm transition-colors duration-200 ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-ink shadow-md'
                    : 'border-border bg-surface text-muted hover:border-primary/50 hover:text-ink'
                }`}
              >
                <BrandIcon provider={p.id} size={22} />
              </span>
              <span className={`text-[11px] font-medium ${isSelected ? 'text-ink' : 'text-muted'}`}>{p.label}</span>
            </button>
          )
        })}
      </div>

      {selected.size > 0 && (
        <div className="flex flex-col gap-2.5">
          {PAYMENT_PROVIDERS.filter((p) => selected.has(p.id)).map((p) => {
            const current = handles.find((h) => h.provider === p.id)
            const draft = drafts[p.id]
            const dirty = draft.trim() !== (current?.handle ?? '')
            return (
              <div key={p.id} className="animate-rise flex items-center gap-2">
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
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
