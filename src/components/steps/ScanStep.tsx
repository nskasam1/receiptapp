import { useRef, useState } from 'react'
import { useReceiptStore } from '../../store/useReceiptStore'
import { parseReceiptImage } from '../../lib/ocr/parseReceipt'
import type { ParseReceiptOutcome } from '../../lib/ocr/types'
import { StepShell } from '../StepShell'
import { BottomBar } from '../BottomBar'
import { Icon } from '../ui/Icon'

type ScanState =
  | { phase: 'idle' }
  | { phase: 'parsing' }
  | { phase: 'not_configured' }
  | { phase: 'low_confidence' }
  | { phase: 'error'; message: string }

export function ScanStep() {
  const setItemsFromScan = useReceiptStore((s) => s.setItemsFromScan)
  const nextStep = useReceiptStore((s) => s.nextStep)

  const [state, setState] = useState<ScanState>({ phase: 'idle' })
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const libraryInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setState({ phase: 'parsing' })
    const outcome: ParseReceiptOutcome = await parseReceiptImage(file)

    switch (outcome.status) {
      case 'success':
        setItemsFromScan(outcome.receipt)
        nextStep()
        return
      case 'low_confidence':
        setItemsFromScan(outcome.receipt)
        setState({ phase: 'low_confidence' })
        return
      case 'not_configured':
        setState({ phase: 'not_configured' })
        return
      case 'error':
        setState({ phase: 'error', message: outcome.message })
        return
    }
  }

  return (
    <StepShell
      title="SplitScan"
      stepIndex={0}
      stepCount={7}
      bottomBar={
        <BottomBar
          primaryLabel="Enter items manually"
          onPrimary={nextStep}
        />
      }
    >
      <div className="flex flex-col items-center py-6 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface">
          <Icon name="receipt" size={30} className="text-primary" />
        </div>
        <h2 className="mb-1.5 text-[20px] font-semibold">Scan the receipt</h2>
        <p className="mb-6 max-w-[30ch] text-[14px] text-muted">
          Snap a photo and we'll read every item off it — no typing required.
        </p>

        {state.phase === 'parsing' && (
          <div className="animate-rise flex flex-col items-center gap-3 py-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-surface-2 border-t-primary" />
            <p className="text-[14px] text-muted">Reading your receipt…</p>
          </div>
        )}

        {state.phase === 'idle' && (
          <div className="flex w-full max-w-xs flex-col gap-2.5">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[15px] font-semibold text-primary-ink hover:bg-primary-hover"
            >
              <Icon name="receipt" size={18} />
              Take a photo
            </button>
            <button
              type="button"
              onClick={() => libraryInputRef.current?.click()}
              className="rounded-xl border border-border py-3.5 text-[15px] font-medium text-ink hover:bg-surface"
            >
              Choose from library
            </button>
          </div>
        )}

        {state.phase === 'not_configured' && (
          <div className="animate-rise flex w-full max-w-xs flex-col items-center gap-3 rounded-xl bg-surface p-4">
            <Icon name="alert" size={18} className="text-accent" />
            <p className="text-[13px] text-muted">
              Scanning isn't set up on this device yet — add an Anthropic API key to enable it. You can still
              enter items yourself below.
            </p>
          </div>
        )}

        {state.phase === 'low_confidence' && (
          <div className="animate-rise flex w-full max-w-xs flex-col items-center gap-3 rounded-xl bg-surface p-4">
            <Icon name="alert" size={18} className="text-accent" />
            <p className="text-[13px] text-muted">
              That photo was hard to read — I filled in what I could, but double-check the items on the next
              screen.
            </p>
            <button
              type="button"
              onClick={nextStep}
              className="rounded-lg bg-primary px-4 py-2 text-[14px] font-semibold text-primary-ink"
            >
              Review items
            </button>
            <button
              type="button"
              onClick={() => setState({ phase: 'idle' })}
              className="text-[13px] font-medium text-muted"
            >
              Retake photo
            </button>
          </div>
        )}

        {state.phase === 'error' && (
          <div className="animate-rise flex w-full max-w-xs flex-col items-center gap-3 rounded-xl bg-surface p-4">
            <Icon name="alert" size={18} className="text-danger" />
            <p className="text-[13px] text-muted">{state.message}</p>
            <button
              type="button"
              onClick={() => setState({ phase: 'idle' })}
              className="rounded-lg bg-primary px-4 py-2 text-[14px] font-semibold text-primary-ink"
            >
              Try again
            </button>
          </div>
        )}

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <input
          ref={libraryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </StepShell>
  )
}
