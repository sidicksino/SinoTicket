import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EntityTable, type Column } from '../components/tables/EntityTable'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EntityModal, type FieldDef } from '../components/ui/EntityModal'
import { Panel } from '../components/ui/Panel'
import { StatusBadge } from '../components/ui/StatusBadge'
import { dashboardSeed } from '../data/seed'
import { useCrud } from '../hooks/useCrud'
import type { ReservationItem } from '../types'

const fields: FieldDef[] = [
  { key: 'ticketCode', label: 'Ticket Code' },
  { key: 'event', label: 'Event' },
  { key: 'customer', label: 'Customer' },
  { key: 'seats', label: 'Seats', type: 'number' },
  { key: 'total', label: 'Total ($)', type: 'number' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'draft', 'paused', 'archived'] },
  { key: 'createdAt', label: 'Created At' },
]

export function ReservationsPage() {
  const { filteredItems, query, setQuery, create, update, remove } = useCrud<ReservationItem>(
    dashboardSeed.reservations,
  )

  const [editing, setEditing] = useState<ReservationItem | null>(null)
  const [deleting, setDeleting] = useState<ReservationItem | null>(null)
  const [openCreate, setOpenCreate] = useState(false)

  const columns: Column<ReservationItem>[] = useMemo(
    () => [
      { key: 'ticketCode', title: 'Ticket', render: (item) => <span className="font-medium">{item.ticketCode}</span> },
      { key: 'event', title: 'Event', render: (item) => item.event },
      { key: 'customer', title: 'Customer', render: (item) => item.customer },
      { key: 'seats', title: 'Seats', render: (item) => item.seats },
      { key: 'total', title: 'Total', render: (item) => `$${item.total}` },
      { key: 'status', title: 'Status', render: (item) => <StatusBadge status={item.status} /> },
      { key: 'createdAt', title: 'Created', render: (item) => item.createdAt },
    ],
    [],
  )

  return (
    <>
      <Panel
        title="Reservation Management"
        subtitle="Handle active bookings and post-checkout operations"
        action={
          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <Plus size={16} />
            Add Reservation
          </button>
        }
      >
        <div className="mb-4">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reservations by ticket, customer, event, or status"
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
        <EntityModal<ReservationItem>
          mode="create"
          title="Add Reservation"
          fields={fields}
          onClose={() => setOpenCreate(false)}
          onSave={(values) => {
            create(values)
            setOpenCreate(false)
          }}
        />
      ) : null}

      {editing ? (
        <EntityModal<ReservationItem>
          mode="edit"
          title="Update Reservation"
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
          title="Delete Reservation"
          message={`This will remove ${deleting.ticketCode} permanently from this view.`}
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
