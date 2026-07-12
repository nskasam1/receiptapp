import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Item, Person, SplitBasis, Step, TipBasis, TipMode } from '../lib/types'
import { STEPS } from '../lib/types'
import type { ParsedReceipt } from '../lib/ocr/types'

function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

interface ReceiptState {
  step: Step
  people: Person[]
  items: Item[]
  taxCents: number
  tipMode: TipMode
  tipValue: number // dollars if flat, percent points if percent
  tipBasis: TipBasis
  splitBasis: SplitBasis
  enteredGrandTotalCents: number | null

  goToStep: (step: Step) => void
  nextStep: () => void
  prevStep: () => void

  addPerson: (name: string) => void
  addPeople: (people: Person[]) => void
  removePerson: (id: string) => void
  renamePerson: (id: string, name: string) => void

  addItem: () => void
  updateItem: (id: string, patch: Partial<Pick<Item, 'name' | 'quantity' | 'totalPriceCents'>>) => void
  removeItem: (id: string) => void
  splitItem: (id: string) => void
  setItemsFromScan: (receipt: ParsedReceipt) => void

  toggleAssignment: (itemId: string, personId: string) => void
  setAssignmentUnits: (itemId: string, personId: string, units: number) => void

  setTaxCents: (cents: number) => void
  setTipMode: (mode: TipMode) => void
  setTipValue: (value: number) => void
  setTipBasis: (basis: TipBasis) => void
  setSplitBasis: (basis: SplitBasis) => void
  setEnteredGrandTotalCents: (cents: number | null) => void

  reset: () => void
}

const initialState = {
  step: 'scan' as Step,
  people: [] as Person[],
  items: [] as Item[],
  taxCents: 0,
  tipMode: 'percent' as TipMode,
  tipValue: 18,
  tipBasis: 'subtotal' as TipBasis,
  splitBasis: 'proportional' as SplitBasis,
  enteredGrandTotalCents: null as number | null,
}

export const useReceiptStore = create<ReceiptState>()(
  persist(
    (set, get) => ({
      ...initialState,

      goToStep: (step) => set({ step }),
      nextStep: () => {
        const idx = STEPS.indexOf(get().step)
        if (idx < STEPS.length - 1) set({ step: STEPS[idx + 1] })
      },
      prevStep: () => {
        const idx = STEPS.indexOf(get().step)
        if (idx > 0) set({ step: STEPS[idx - 1] })
      },

      addPerson: (name) => {
        const trimmed = name.trim()
        if (!trimmed) return
        set({ people: [...get().people, { id: makeId(), name: trimmed }] })
      },
      addPeople: (people) => {
        const existingNames = new Set(get().people.map((p) => p.name.toLowerCase()))
        const toAdd = people.filter((p) => !existingNames.has(p.name.toLowerCase()))
        set({ people: [...get().people, ...toAdd.map((p) => ({ id: makeId(), name: p.name }))] })
      },
      removePerson: (id) => {
        set({
          people: get().people.filter((p) => p.id !== id),
          items: get().items.map((item) => {
            if (!(id in item.assignments)) return item
            const assignments = { ...item.assignments }
            delete assignments[id]
            return { ...item, assignments }
          }),
        })
      },
      renamePerson: (id, name) => {
        set({
          people: get().people.map((p) => (p.id === id ? { ...p, name } : p)),
        })
      },

      addItem: () => {
        set({
          items: [
            ...get().items,
            { id: makeId(), name: '', quantity: 1, totalPriceCents: 0, assignments: {} },
          ],
        })
      },
      updateItem: (id, patch) => {
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, ...patch, lowConfidence: false } : item,
          ),
        })
      },
      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) })
      },
      splitItem: (id) => {
        const items = get().items
        const idx = items.findIndex((i) => i.id === id)
        if (idx === -1) return
        const item = items[idx]
        const halfA = Math.ceil(item.totalPriceCents / 2)
        const halfB = item.totalPriceCents - halfA
        const partA: Item = {
          id: makeId(),
          name: item.name,
          quantity: 1,
          totalPriceCents: halfA,
          assignments: {},
        }
        const partB: Item = {
          id: makeId(),
          name: item.name,
          quantity: 1,
          totalPriceCents: halfB,
          assignments: {},
        }
        const next = [...items]
        next.splice(idx, 1, partA, partB)
        set({ items: next })
      },
      setItemsFromScan: (receipt) => {
        const items: Item[] = receipt.items
          .filter((line) => line.totalPrice > 0)
          .map((line) => ({
            id: makeId(),
            name: line.name,
            quantity: line.quantity && line.quantity > 0 ? Math.round(line.quantity) : 1,
            totalPriceCents: Math.round(line.totalPrice * 100),
            assignments: {},
            lowConfidence: line.lowConfidence,
          }))
        set({
          items,
          taxCents: receipt.tax ? Math.round(receipt.tax * 100) : 0,
          enteredGrandTotalCents: receipt.grandTotal ? Math.round(receipt.grandTotal * 100) : null,
        })
      },

      toggleAssignment: (itemId, personId) => {
        set({
          items: get().items.map((item) => {
            if (item.id !== itemId) return item
            const assignments = { ...item.assignments }
            if (personId in assignments) {
              delete assignments[personId]
            } else {
              assignments[personId] = 1
            }
            return { ...item, assignments }
          }),
        })
      },
      setAssignmentUnits: (itemId, personId, units) => {
        set({
          items: get().items.map((item) => {
            if (item.id !== itemId) return item
            if (!(personId in item.assignments)) return item
            return {
              ...item,
              assignments: { ...item.assignments, [personId]: Math.max(1, units) },
            }
          }),
        })
      },

      setTaxCents: (cents) => set({ taxCents: cents }),
      setTipMode: (mode) => set({ tipMode: mode }),
      setTipValue: (value) => set({ tipValue: value }),
      setTipBasis: (basis) => set({ tipBasis: basis }),
      setSplitBasis: (basis) => set({ splitBasis: basis }),
      setEnteredGrandTotalCents: (cents) => set({ enteredGrandTotalCents: cents }),

      reset: () => set({ ...initialState, items: [], people: [] }),
    }),
    {
      name: 'splitscan.session.v1',
    },
  ),
)
