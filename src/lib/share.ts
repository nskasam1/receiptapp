import { formatCents } from './split'
import type { PersonSplit } from './types'

export function buildShortText(split: PersonSplit): string {
  return `You owe ${formatCents(split.totalCents)}`
}

export function buildItemizedText(split: PersonSplit): string {
  const lines = split.items.map((i) => `${i.name} ${formatCents(i.shareCents)}`)
  if (split.taxShareCents > 0) lines.push(`tax ${formatCents(split.taxShareCents)}`)
  if (split.tipShareCents > 0) lines.push(`tip ${formatCents(split.tipShareCents)}`)
  return `${lines.join(', ')} = ${formatCents(split.totalCents)} total`
}

export function buildGroupSummaryText(splits: PersonSplit[], itemized: boolean): string {
  return splits
    .map((s) => `${s.name}: ${itemized ? buildItemizedText(s) : buildShortText(s)}`)
    .join('\n')
}

export type ShareOutcome = 'shared' | 'copied' | 'sms' | 'unavailable'

export async function shareText(text: string, title = 'SplitScan'): Promise<ShareOutcome> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ text, title })
      return 'shared'
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return 'unavailable'
      // fall through to clipboard fallback below
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text)
      return 'copied'
    } catch {
      // fall through
    }
  }

  return 'unavailable'
}

export function smsHref(text: string): string {
  return `sms:?&body=${encodeURIComponent(text)}`
}
