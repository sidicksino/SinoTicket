import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EntityTable, type Column } from '../components/tables/EntityTable'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EntityModal, type FieldDef } from '../components/ui/EntityModal'
import { Panel } from '../components/ui/Panel'
import { StatusBadge } from '../components/ui/StatusBadge'
import { dashboardSeed } from '../data/seed'
import { useCrud } from '../hooks/useCrud'
import type { EventItem } from '../types'

const fields: FieldDef[] = [
  { key: 'name', label: 'Event Name' },
  { key: 'date', label: 'Date & Time' },
  { key: 'venue', label: 'Venue' },
  { key: 'capacity', label: 'Capacity', type: 'number' },
  { key: 'price', label: 'Ticket Price', type: 'number' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'draft', 'paused', 'archived'] },
]

export function EventsPage() {
  const { filteredItems, query, setQuery, create, update, remove } = useCrud<EventItem>(dashboardSeed.events)

  const [editing, setEditing] = useState<EventItem | null>(null)
  const [deleting, setDeleting] = useState<EventItem | null>(null)
  const [openCreate, setOpenCreate] = useState(false)

  const columns: Column<EventItem>[] = useMemo(
    () => [
      { key: 'name', title: 'Event', render: (item) => <span className="font-medium">{item.name}</span> },
      { key: 'date', title: 'Date', render: (item) => item.date },
      { key: 'venue', title: 'Venue', render: (item) => item.venue },
      { key: 'capacity', title: 'Capacity', render: (item) => item.capacity.toLocaleString() },
      { key: 'price', title: 'Price', render: (item) => `$${item.price}` },
      { key: 'status', title: 'Status', render: (item) => <StatusBadge status={item.status} /> },
    ],
    [],
  )

  return (
    <>
      <Panel
        title="Event Management"
        subtitle="Create, modify, and retire events from the catalogue"
        action={
          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <Plus size={16} />
            Add Event
          </button>
        }
      >
        <div className="mb-4">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events by title, venue, or status"
            className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
          />
        </div>

        <EntityTable
          data={filteredItems}
          columns={columns}
          onEdit={(item) => setEditing(item)}
          onDelete={(item) => setDeleting(item)}
        />
      </Panel>

      {openCreate ? (
        <EntityModal<EventItem>
          mode="create"
          title="Add Event"
          fields={fields}
          onClose={() => setOpenCreate(false)}
          onSave={(values) => {
            create(values)
            setOpenCreate(false)
          }}
        />
      ) : null}

      {editing ? (
        <EntityModal<EventItem>
          mode="edit"
          title="Update Event"
          fields={fields}
          initialValue={editing}
          onClose={() => setEditing(null)}
          onSave={(values) => {
            update(editing.id, values)
            setEditing(null)
          }}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          title="Delete Event"
          message={`This will remove ${deleting.name} permanently from this view.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            remove(deleting.id)
            setDeleting(null)
          }}
        />
      ) : null}
    </>
  )
}
