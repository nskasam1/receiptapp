import { supabase } from './client'

export interface PeopleGroup {
  id: string
  name: string
  memberNames: string[]
}

export async function fetchPeopleGroups(userId: string): Promise<PeopleGroup[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('people_groups')
    .select('id, name, member_names')
    .eq('user_id', userId)
    .order('name')
  if (error) {
    console.error('fetchPeopleGroups failed:', error.message)
    return []
  }
  return data.map((row) => ({ id: row.id, name: row.name, memberNames: row.member_names }))
}

export async function savePeopleGroup(userId: string, name: string, memberNames: string[]): Promise<void> {
  if (!supabase) return
  const trimmed = name.trim()
  if (!trimmed || memberNames.length === 0) return
  const { error } = await supabase
    .from('people_groups')
    .insert({ user_id: userId, name: trimmed, member_names: memberNames })
  if (error) console.error('savePeopleGroup failed:', error.message)
}

export async function deletePeopleGroup(groupId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('people_groups').delete().eq('id', groupId)
  if (error) console.error('deletePeopleGroup failed:', error.message)
}
