import { useEffect, useState } from 'react'
import { useReceiptStore } from '../../store/useReceiptStore'
import { useAuth } from '../../lib/supabase/useAuth'
import { fetchKnownPeople, forgetPerson, rememberPerson, type KnownPerson } from '../../lib/supabase/knownPeople'
import { StepShell } from '../StepShell'
import { BottomBar } from '../BottomBar'
import { PersonAvatar } from '../ui/PersonAvatar'
import { Icon } from '../ui/Icon'

export function PeopleStep() {
  const people = useReceiptStore((s) => s.people)
  const addPerson = useReceiptStore((s) => s.addPerson)
  const removePerson = useReceiptStore((s) => s.removePerson)
  const nextStep = useReceiptStore((s) => s.nextStep)
  const prevStep = useReceiptStore((s) => s.prevStep)

  const [name, setName] = useState('')
  const { user } = useAuth()
  const [knownPeople, setKnownPeople] = useState<KnownPerson[]>([])

  useEffect(() => {
    if (!user) {
      setKnownPeople([])
      return
    }
    fetchKnownPeople(user.id).then(setKnownPeople)
  }, [user])

  async function submitName() {
    const trimmed = name.trim()
    if (!trimmed) return
    addPerson(trimmed)
    setName('')
    if (user) {
      await rememberPerson(user.id, trimmed, knownPeople)
      fetchKnownPeople(user.id).then(setKnownPeople)
    }
  }

  async function handleForget(id: string) {
    setKnownPeople((prev) => prev.filter((p) => p.id !== id))
    await forgetPerson(id)
  }

  const addedNames = new Set(people.map((p) => p.name.toLowerCase()))
  const quickAddPeople = knownPeople.filter((p) => !addedNames.has(p.name.toLowerCase()))

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
          className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 py-3.5 text-[16px] text-ink placeholder:text-muted focus:border-primary"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          aria-label="Add person"
          className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl bg-primary text-primary-ink disabled:opacity-35"
        >
          <Icon name="plus" size={22} />
        </button>
      </form>

      <div className="mt-5">
        {people.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
            <Icon name="users" size={24} className="mx-auto mb-2 text-muted" />
            <p className="text-[14px] text-muted">
              Add who's splitting this bill — you first, then everyone else at the table.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {people.map((p) => (
              <li
                key={p.id}
                className="animate-rise flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-3"
              >
                <PersonAvatar name={p.name} size={36} />
                <span className="flex-1 truncate text-[16px]">{p.name}</span>
                <button
                  type="button"
                  onClick={() => removePerson(p.id)}
                  aria-label={`Remove ${p.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-accent-text"
                >
                  <Icon name="x" size={17} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {quickAddPeople.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-[13px] font-medium text-muted">People you know</div>
          <div className="flex flex-col gap-2">
            {quickAddPeople.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border px-3.5 py-3">
                <button
                  type="button"
                  onClick={() => addPerson(p.name)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <Icon name="plus" size={14} className="shrink-0 text-primary" />
                  <span className="truncate text-[15px] font-medium text-ink">{p.name}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleForget(p.id)}
                  aria-label={`Forget ${p.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-accent-text"
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
