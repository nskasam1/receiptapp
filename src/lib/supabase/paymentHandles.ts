import { supabase } from './client'

export type PaymentProvider = 'venmo' | 'cashapp' | 'paypal' | 'zelle'

export interface PaymentHandle {
  provider: PaymentProvider
  handle: string
}

export async function fetchPaymentHandles(userId: string): Promise<PaymentHandle[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('payment_handles').select('provider, handle').eq('user_id', userId)
  if (error) {
    console.error('fetchPaymentHandles failed:', error.message)
    return []
  }
  return data
}

export async function savePaymentHandle(userId: string, provider: PaymentProvider, handle: string): Promise<void> {
  if (!supabase) return
  const trimmed = handle.trim()
  if (!trimmed) return
  const { error } = await supabase
    .from('payment_handles')
    .upsert({ user_id: userId, provider, handle: trimmed }, { onConflict: 'user_id,provider' })
  if (error) console.error('savePaymentHandle failed:', error.message)
}

export async function removePaymentHandle(userId: string, provider: PaymentProvider): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('payment_handles')
    .delete()
    .eq('user_id', userId)
    .eq('provider', provider)
  if (error) console.error('removePaymentHandle failed:', error.message)
}
