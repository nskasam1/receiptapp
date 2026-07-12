import { supabase } from './client'

export interface KnownPerson {
  id: string
  name: string
}

export async function fetchKnownPeople(userId: string): Promise<KnownPerson[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('known_people')
    .select('id, name')
    .eq('user_id', userId)
    .order('name')
  if (error) {
    console.error('fetchKnownPeople failed:', error.message)
    return []
  }
  return data
}

export async function rememberPerson(userId: string, name: string, existing: KnownPerson[]): Promise<void> {
  if (!supabase) return
  const trimmed = name.trim()
  if (!trimmed) return
  const alreadyKnown = existing.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())
  if (alreadyKnown) return
  const { error } = await supabase.from('known_people').insert({ user_id: userId, name: trimmed })
  if (error) console.error('rememberPerson failed:', error.message)
}

export async function forgetPerson(personId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('known_people').delete().eq('id', personId)
  if (error) console.error('forgetPerson failed:', error.message)
}
