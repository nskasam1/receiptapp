import { useReceiptStore } from '../../store/useReceiptStore'
import { formatCents } from '../../lib/split'
import { StepShell } from '../StepShell'
import { BottomBar } from '../BottomBar'
import { PersonChip } from '../ui/Chip'
import { Icon } from '../ui/Icon'

export function AssignStep() {
  const people = useReceiptStore((s) => s.people)
  const items = useReceiptStore((s) => s.items)
  const toggleAssignment = useReceiptStore((s) => s.toggleAssignment)
  const setAssignmentUnits = useReceiptStore((s) => s.setAssignmentUnits)
  const nextStep = useReceiptStore((s) => s.nextStep)
  const prevStep = useReceiptStore((s) => s.prevStep)

  const unassignedCount = items.filter(
    (item) => Object.keys(item.assignments).length === 0,
  ).length

  return (
    <StepShell
      title="Who had what?"
      stepIndex={3}
      stepCount={7}
      onBack={prevStep}
      bottomBar={
        <BottomBar
          primaryLabel="Continue"
          onPrimary={nextStep}
          info={
            unassignedCount > 0 ? (
              <span className="flex items-center gap-1.5 text-[13px] text-accent-text">
                <Icon name="alert" size={14} />
                {unassignedCount} unassigned
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[13px] text-primary">
                <Icon name="check" size={14} />
                Everything's assigned
              </span>
            )
          }
        />
      }
    >
      <p className="mb-4 text-[13px] text-muted">
        Tap a name to add them to an item. Assign to more than one and the cost splits between them.
      </p>
      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const assignedIds = Object.keys(item.assignments)
          const isSplit = assignedIds.length > 1
          return (
            <li key={item.id} className="rounded-xl border border-border bg-surface p-3.5">
              <div className="mb-2.5 flex items-baseline">
                <span className="truncate text-[15px] font-medium">{item.name || 'Unnamed item'}</span>
                <span className="leader" />
                <span className="font-mono-tabular shrink-0 text-[15px] font-semibold">
                  {formatCents(item.totalPriceCents)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {people.map((person) => (
                  <PersonChip
                    key={person.id}
                    name={person.name}
                    selected={person.id in item.assignments}
                    units={item.assignments[person.id]}
                    onToggle={() => toggleAssignment(item.id, person.id)}
                    onIncrement={
                      isSplit
                        ? () => setAssignmentUnits(item.id, person.id, (item.assignments[person.id] ?? 1) + 1)
                        : undefined
                    }
                    onDecrement={
                      isSplit
                        ? () =>
                            setAssignmentUnits(
                              item.id,
                              person.id,
                              Math.max(1, (item.assignments[person.id] ?? 1) - 1),
                            )
                        : undefined
                    }
                  />
                ))}
              </div>
              {isSplit && (
                <div className="mt-3 border-t border-dashed border-accent-text pt-2 text-[12px] text-muted">
                  Split {assignedIds.length} ways
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </StepShell>
  )
}
