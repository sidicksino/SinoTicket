import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EntityTable, type Column } from '../components/tables/EntityTable'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EntityModal, type FieldDef } from '../components/ui/EntityModal'
import { Panel } from '../components/ui/Panel'
import { StatusBadge } from '../components/ui/StatusBadge'
import { dashboardSeed } from '../data/seed'
import { useCrud } from '../hooks/useCrud'
import type { VenueItem } from '../types'

const fields: FieldDef[] = [
  { key: 'name', label: 'Venue Name' },
  { key: 'city', label: 'City' },
  { key: 'seats', label: 'Seat Count', type: 'number' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'draft', 'paused', 'archived'] },
]

export function VenuesPage() {
  const { filteredItems, query, setQuery, create, update, remove } = useCrud<VenueItem>(dashboardSeed.venues)

  const [editing, setEditing] = useState<VenueItem | null>(null)
  const [deleting, setDeleting] = useState<VenueItem | null>(null)
  const [openCreate, setOpenCreate] = useState(false)

  const columns: Column<VenueItem>[] = useMemo(
    () => [
      { key: 'name', title: 'Venue', render: (item) => <span className="font-medium">{item.name}</span> },
      { key: 'city', title: 'City', render: (item) => item.city },
      { key: 'seats', title: 'Seats', render: (item) => item.seats.toLocaleString() },
      { key: 'status', title: 'Status', render: (item) => <StatusBadge status={item.status} /> },
    ],
    [],
  )

  return (
    <>
      <Panel
        title="Venue Management"
        subtitle="Control inventory and operational availability"
        action={
          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <Plus size={16} />
            Add Venue
          </button>
        }
      >
        <div className="mb-4">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search venues by name, city, or status"
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
        <EntityModal<VenueItem>
          mode="create"
          title="Add Venue"
          fields={fields}
          onClose={() => setOpenCreate(false)}
          onSave={(values) => {
            create(values)
            setOpenCreate(false)
          }}
        />
      ) : null}

      {editing ? (
        <EntityModal<VenueItem>
          mode="edit"
          title="Update Venue"
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
          title="Delete Venue"
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
