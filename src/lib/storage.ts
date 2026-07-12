import type { Person } from './types'

const FREQUENT_GROUPS_KEY = 'splitscan.frequentGroups.v1'

export interface FrequentGroup {
  id: string
  name: string
  people: Person[]
}

export function loadFrequentGroups(): FrequentGroup[] {
  try {
    const raw = localStorage.getItem(FREQUENT_GROUPS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveFrequentGroup(group: FrequentGroup): FrequentGroup[] {
  const existing = loadFrequentGroups().filter((g) => g.id !== group.id)
  const next = [group, ...existing].slice(0, 8)
  localStorage.setItem(FREQUENT_GROUPS_KEY, JSON.stringify(next))
  return next
}

export function deleteFrequentGroup(id: string): FrequentGroup[] {
  const next = loadFrequentGroups().filter((g) => g.id !== id)
  localStorage.setItem(FREQUENT_GROUPS_KEY, JSON.stringify(next))
  return next
}
