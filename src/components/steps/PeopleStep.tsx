import { useState } from 'react'
import { useReceiptStore } from '../../store/useReceiptStore'
import { deleteFrequentGroup, loadFrequentGroups, saveFrequentGroup, type FrequentGroup } from '../../lib/storage'
import { StepShell } from '../StepShell'
import { BottomBar } from '../BottomBar'
import { PersonAvatar } from '../ui/PersonAvatar'
import { Icon } from '../ui/Icon'

export function PeopleStep() {
  const people = useReceiptStore((s) => s.people)
  const addPerson = useReceiptStore((s) => s.addPerson)
  const addPeople = useReceiptStore((s) => s.addPeople)
  const removePerson = useReceiptStore((s) => s.removePerson)
  const nextStep = useReceiptStore((s) => s.nextStep)
  const prevStep = useReceiptStore((s) => s.prevStep)

  const [name, setName] = useState('')
  const [groups, setGroups] = useState<FrequentGroup[]>(() => loadFrequentGroups())
  const [savingName, setSavingName] = useState(false)
  const [groupName, setGroupName] = useState('')

  function submitName() {
    const trimmed = name.trim()
    if (!trimmed) return
    addPerson(trimmed)
    setName('')
  }

  function commitSaveGroup() {
    const trimmed = groupName.trim()
    if (!trimmed || people.length === 0) {
      setSavingName(false)
      return
    }
    const next = saveFrequentGroup({ id: trimmed.toLowerCase(), name: trimmed, people })
    setGroups(next)
    setSavingName(false)
    setGroupName('')
  }

  return (
    <StepShell
      title="Who's splitting?"
      stepIndex={1}
      stepCount={7}
      onBack={prevStep}
      bottomBar={
        <BottomBar
          primaryLabel="Continue"
          primaryDisabled={people.length === 0}
          onPrimary={nextStep}
          info={
            people.length > 0 ? (
              <span className="text-[13px] text-muted">
                {people.length} {people.length === 1 ? 'person' : 'people'}
              </span>
            ) : (
              <span className="text-[13px] text-muted">Add at least one person</span>
            )
          }
        />
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submitName()
        }}
        className="flex gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a name"
          autoFocus
          className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-faint focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          aria-label="Add person"
          className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-primary text-primary-ink disabled:opacity-35"
        >
          <Icon name="plus" />
        </button>
      </form>

      <div className="mt-5">
        {people.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
            <Icon name="users" size={22} className="mx-auto mb-2 text-faint" />
            <p className="text-[14px] text-muted">
              Add who's splitting this bill — you first, then everyone else at the table.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {people.map((p, i) => (
              <li
                key={p.id}
                className="animate-rise flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5"
              >
                <PersonAvatar name={p.name} index={i} />
                <span className="flex-1 truncate text-[15px]">{p.name}</span>
                <button
                  type="button"
                  onClick={() => removePerson(p.id)}
                  aria-label={`Remove ${p.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-faint hover:bg-surface-2 hover:text-danger"
                >
                  <Icon name="x" size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {people.length > 0 && (
        <div className="mt-4">
          {savingName ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                commitSaveGroup()
              }}
              className="flex gap-2"
            >
              <input
                autoFocus
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Name this group (e.g. Roommates)"
                className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-[14px] focus:border-primary focus:outline-none"
              />
              <button type="submit" className="rounded-lg bg-surface-2 px-3 py-2 text-[14px] font-medium text-ink">
                Save
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setSavingName(true)}
              className="text-[13px] font-medium text-primary"
            >
              Save this group for next time
            </button>
          )}
        </div>
      )}

      {groups.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-[13px] font-medium text-muted">Frequent groups</div>
          <div className="flex flex-col gap-2">
            {groups.map((g) => (
              <div
                key={g.id}
                className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5"
              >
                <button
                  type="button"
                  onClick={() => addPeople(g.people)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span className="truncate text-[14px] font-medium text-ink">{g.name}</span>
                  <span className="shrink-0 text-[12px] text-faint">
                    {g.people.length} {g.people.length === 1 ? 'person' : 'people'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setGroups(deleteFrequentGroup(g.id))}
                  aria-label={`Delete ${g.name} group`}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-faint hover:bg-surface-2 hover:text-danger"
                >
                  <Icon name="trash" size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </StepShell>
  )
}
