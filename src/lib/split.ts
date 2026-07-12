import type { Item, Person, PersonSplit, SplitBasis, SplitResult, TipBasis, TipMode } from './types'

export function computeTipCents(
  tipMode: TipMode,
  tipValue: number,
  tipBasis: TipBasis,
  subtotalCents: number,
  taxCents: number,
): number {
  if (tipMode === 'flat') return Math.round(tipValue * 100)
  const basisCents = tipBasis === 'total' ? subtotalCents + taxCents : subtotalCents
  return Math.round((basisCents * tipValue) / 100)
}

/**
 * Distributes `totalCents` across `weights` (keyed by id) so the rounded
 * shares sum EXACTLY to totalCents, using the largest-remainder method.
 * Ties (and the leftover-cent order generally) resolve by `tieBreakOrder`.
 */
function allocateCents(
  totalCents: number,
  weights: Record<string, number>,
  tieBreakOrder: string[],
): Record<string, number> {
  const ids = tieBreakOrder.filter((id) => (weights[id] ?? 0) > 0)
  const weightSum = ids.reduce((sum, id) => sum + weights[id], 0)

  if (ids.length === 0 || weightSum === 0) return {}

  const raw: Record<string, number> = {}
  const floor: Record<string, number> = {}
  let flooredTotal = 0

  for (const id of ids) {
    const exact = (totalCents * weights[id]) / weightSum
    raw[id] = exact
    floor[id] = Math.floor(exact)
    flooredTotal += floor[id]
  }

  let remainder = totalCents - flooredTotal
  const result = { ...floor }

  const byRemainderDesc = [...ids].sort((a, b) => {
    const diff = raw[b] - floor[b] - (raw[a] - floor[a])
    if (Math.abs(diff) > 1e-9) return diff
    return tieBreakOrder.indexOf(a) - tieBreakOrder.indexOf(b)
  })

  for (let i = 0; i < byRemainderDesc.length && remainder > 0; i++, remainder--) {
    result[byRemainderDesc[i]] += 1
  }

  return result
}

export interface ComputeSplitArgs {
  people: Person[]
  items: Item[]
  taxCents: number
  tipCents: number
  splitBasis: SplitBasis
  enteredGrandTotalCents: number | null
}

export function computeSplit({
  people,
  items,
  taxCents,
  tipCents,
  splitBasis,
  enteredGrandTotalCents,
}: ComputeSplitArgs): SplitResult {
  const subtotalCents = items.reduce((sum, item) => sum + item.totalPriceCents, 0)
  const tieBreakOrder = [...people]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p) => p.id)

  const subtotalShares: Record<string, number> = Object.fromEntries(
    people.map((p) => [p.id, 0]),
  )
  const itemsByPerson: Record<string, { name: string; shareCents: number }[]> = Object.fromEntries(
    people.map((p) => [p.id, []]),
  )
  let unassignedItemCount = 0

  for (const item of items) {
    const assignedIds = Object.keys(item.assignments).filter(
      (id) => item.assignments[id] > 0 && people.some((p) => p.id === id),
    )
    if (assignedIds.length === 0) {
      unassignedItemCount++
      continue
    }
    const shareCents = allocateCents(item.totalPriceCents, item.assignments, tieBreakOrder)
    for (const id of assignedIds) {
      const cents = shareCents[id] ?? 0
      subtotalShares[id] += cents
      if (cents > 0) itemsByPerson[id].push({ name: item.name, shareCents: cents })
    }
  }

  const weightsForTaxTip: Record<string, number> =
    splitBasis === 'even'
      ? Object.fromEntries(people.map((p) => [p.id, 1]))
      : subtotalShares

  const taxShares = allocateCents(taxCents, weightsForTaxTip, tieBreakOrder)
  const tipShares = allocateCents(tipCents, weightsForTaxTip, tieBreakOrder)

  const personSplits: PersonSplit[] = people.map((p) => {
    const subtotalShareCents = subtotalShares[p.id] ?? 0
    const taxShareCents = taxShares[p.id] ?? 0
    const tipShareCents = tipShares[p.id] ?? 0
    return {
      personId: p.id,
      name: p.name,
      items: itemsByPerson[p.id],
      subtotalShareCents,
      taxShareCents,
      tipShareCents,
      totalCents: subtotalShareCents + taxShareCents + tipShareCents,
    }
  })

  const computedGrandTotalCents = subtotalCents + taxCents + tipCents
  const differenceCents = (enteredGrandTotalCents ?? computedGrandTotalCents) - computedGrandTotalCents

  return {
    people: personSplits,
    subtotalCents,
    taxCents,
    tipCents,
    computedGrandTotalCents,
    enteredGrandTotalCents,
    reconciles: enteredGrandTotalCents === null || Math.abs(differenceCents) < 1,
    differenceCents,
    unassignedItemCount,
  }
}

export function formatCents(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  return `${sign}$${(abs / 100).toFixed(2)}`
}

export function parseDollarsToCents(input: string): number {
  const cleaned = input.replace(/[^0-9.-]/g, '')
  if (cleaned === '' || cleaned === '-') return 0
  const value = Number.parseFloat(cleaned)
  if (Number.isNaN(value)) return 0
  return Math.round(value * 100)
}
