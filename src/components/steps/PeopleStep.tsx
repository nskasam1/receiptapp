import { useEffect, useState } from 'react'
import { useReceiptStore } from '../../store/useReceiptStore'
import { useAuth } from '../../lib/supabase/useAuth'
import { fetchKnownPeople, forgetPerson, rememberPerson, type KnownPerson } from '../../lib/supabase/knownPeople'
import { fetchPeopleGroups, savePeopleGroup, deletePeopleGroup, type PeopleGroup } from '../../lib/supabase/peopleGroups'
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
  const [groups, setGroups] = useState<PeopleGroup[]>([])
  const [showSaveGroup, setShowSaveGroup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [savingGroup, setSavingGroup] = useState(false)

  useEffect(() => {
    if (!user) {
      setKnownPeople([])
      setGroups([])
      return
    }
    fetchKnownPeople(user.id).then(setKnownPeople)
    fetchPeopleGroups(user.id).then(setGroups)
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

  function handleAddGroup(group: PeopleGroup) {
    const already = new Set(people.map((p) => p.name.toLowerCase()))
    for (const name of group.memberNames) {
      if (!already.has(name.toLowerCase())) addPerson(name)
    }
  }

  async function handleSaveGroup() {
    if (!user) return
    const trimmed = groupName.trim()
    if (!trimmed || people.length === 0) return
    setSavingGroup(true)
    await savePeopleGroup(
      user.id,
      trimmed,
      people.map((p) => p.name),
    )
    setGroups(await fetchPeopleGroups(user.id))
    setSavingGroup(false)
    setShowSaveGroup(false)
    setGroupName('')
  }

  async function handleDeleteGroup(id: string) {
    setGroups((prev) => prev.filter((g) => g.id !== id))
    await deletePeopleGroup(id)
  }

  const addedNames = new Set(people.map((p) => p.name.toLowerCase()))
  const quickAddPeople = knownPeople.filter((p) => !addedNames.has(p.name.toLowerCase()))
  const hasMe = people.some((p) => p.name === 'ME')

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
      {user && !hasMe && (
        <button
          type="button"
          onClick={() => addPerson('ME')}
          className="mb-3 flex w-full items-center gap-3 rounded-xl border border-primary/30 bg-surface px-3.5 py-3 text-left hover:bg-primary-hover/10"
        >
          <PersonAvatar name="ME" size={36} />
          <span className="flex-1 text-[15px] font-medium text-ink">Add myself</span>
          <Icon name="plus" size={16} className="shrink-0 text-primary" />
        </button>
      )}

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

      {user && people.length > 0 && (
        <div className="mt-3">
          {showSaveGroup ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSaveGroup()
              }}
              className="flex gap-2"
            >
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name (e.g. Roommates)"
                autoFocus
                className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-[14px] text-ink placeholder:text-muted focus:border-primary"
              />
              <button
                type="submit"
                disabled={!groupName.trim() || savingGroup}
                className="shrink-0 rounded-lg bg-primary px-3.5 py-2 text-[13px] font-semibold text-primary-ink disabled:opacity-40"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSaveGroup(false)
                  setGroupName('')
                }}
                className="shrink-0 text-[13px] font-medium text-muted"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowSaveGroup(true)}
              className="text-[13px] font-medium text-primary"
            >
              Save this group for next time
            </button>
          )}
        </div>
      )}

      {groups.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-[13px] font-medium text-muted">Your groups</div>
          <div className="flex flex-col gap-2">
            {groups.map((g) => (
              <div key={g.id} className="flex items-center gap-3 rounded-xl border border-border px-3.5 py-3">
                <button
                  type="button"
                  onClick={() => handleAddGroup(g)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <Icon name="users" size={14} className="shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium text-ink">{g.name}</span>
                    <span className="block truncate text-[12px] text-muted">{g.memberNames.join(', ')}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteGroup(g.id)}
                  aria-label={`Delete group ${g.name}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-accent-text"
                >
                  <Icon name="trash" size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
