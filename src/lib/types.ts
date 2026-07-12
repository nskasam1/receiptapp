export type PersonId = string
export type ItemId = string

export interface Person {
  id: PersonId
  name: string
}

export interface Item {
  id: ItemId
  name: string
  quantity: number
  totalPriceCents: number
  /** personId -> relative units (e.g. 2 of 3 fries -> 2). Absence = unassigned. */
  assignments: Record<PersonId, number>
}

export type TipBasis = 'subtotal' | 'total'
export type TipMode = 'flat' | 'percent'
export type SplitBasis = 'proportional' | 'even'

export interface PersonSplit {
  personId: PersonId
  name: string
  items: { name: string; shareCents: number }[]
  subtotalShareCents: number
  taxShareCents: number
  tipShareCents: number
  totalCents: number
}

export interface SplitResult {
  people: PersonSplit[]
  subtotalCents: number
  taxCents: number
  tipCents: number
  computedGrandTotalCents: number
  enteredGrandTotalCents: number | null
  reconciles: boolean
  differenceCents: number
  unassignedItemCount: number
}

export const PERSON_COLOR_COUNT = 6

export const STEPS = ['scan', 'people', 'items', 'assign', 'taxtip', 'summary', 'share'] as const
export type Step = (typeof STEPS)[number]
