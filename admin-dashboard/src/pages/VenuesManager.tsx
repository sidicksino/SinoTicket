import { useAuth } from '@clerk/clerk-react';
import { Building2, Edit, Loader2, MapPin, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

interface Venue {
  _id: string;
  name: string;
  location: string;
  capacity?: number;
}

interface VenueFormData {
  name: string;
  location: string;
  capacity: string;
}

const EMPTY_FORM: VenueFormData = { name: '', location: '', capacity: '' };

export default function VenuesManager() {
  const { getToken } = useAuth();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<VenueFormData>(EMPTY_FORM);
  const [error, setError] = useState('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Venue | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Fetch ───────────────────────────────────────
  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5001/api/venue/getVenue');
      const data = await res.json();
      if (data.success) {
        setVenues(data.venues);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVenues(); }, []);

  // ─── Open modals ─────────────────────────────────
  const openAdd = () => {
    setEditingVenue(null);
    setFormData(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  const openEdit = (venue: Venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name,
      location: venue.location,
      capacity: String(venue.capacity || ''),
    });
    setError('');
    setShowModal(true);
  };

  // ─── Save (create / update) ──────────────────────
  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = await getToken();
      const isEdit = !!editingVenue;

      const url = isEdit
        ? `http://localhost:5001/api/venue/updateVenue/${editingVenue!._id}`
        : 'http://localhost:5001/api/venue/add';

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          capacity: parseInt(formData.capacity, 10),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setShowModal(false);
        setFormData(EMPTY_FORM);
        fetchVenues();
      } else {
        setError(data.message || 'Validation error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ──────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `http://localhost:5001/api/venue/deleteVenue/${deleteTarget._id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setDeleteTarget(null);
        fetchVenues();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // ─── Render ──────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text">Venues</h2>
          <p className="text-subtext mt-1">Locations where your events take place.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-[0.97]"
        >
          <Plus size={20} />
          <span>Add Venue</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-primary">
          <Loader2 className="animate-spin" size={40} />
        </div>
      ) : venues.length === 0 ? (
        <div className="p-12 text-center bg-card border border-card-border rounded-3xl">
          <Building2 size={48} className="mx-auto text-subtext/40 mb-4" />
          <h3 className="text-xl font-bold text-text mb-2">No venues yet</h3>
          <p className="text-subtext mb-6">Create your first venue to start hosting events.</p>
          <button
            onClick={openAdd}
            className="px-6 py-2.5 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-colors"
          >
            Add Venue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <div
              key={venue._id}
              className="bg-card rounded-3xl border border-card-border overflow-hidden shadow-sm group transition-all hover:border-primary/30"
            >
              {/* Visual header */}
              <div className="h-36 bg-primary/5 relative overflow-hidden flex items-center justify-center">
                <MapPin
                  className="text-primary opacity-10 group-hover:opacity-20 transition-opacity"
                  size={64}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80 pointer-events-none" />
              </div>

              <div className="p-6 -mt-6 relative">
                <h3 className="font-bold text-lg text-text mb-1">{venue.name}</h3>
                <p className="text-sm text-subtext mb-4 flex items-center gap-1.5">
                  <MapPin size={14} className="flex-shrink-0" /> {venue.location}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-card-border">
                  <div className="text-xs font-bold text-subtext uppercase tracking-widest">
                    Capacity:{' '}
                    <span className="text-primary ml-1">
                      {venue.capacity?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(venue)}
                      className="p-2 text-subtext hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(venue)}
                      className="p-2 text-subtext hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Add / Edit Modal ─────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-overlay-dark z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl w-full max-w-md shadow-2xl border border-card-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-card-border flex items-center justify-between">
              <h3 className="text-xl font-bold text-text">
                {editingVenue ? 'Edit Venue' : 'Add New Venue'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-subtext hover:bg-card-border/50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-error/10 text-error text-sm font-bold rounded-xl border border-error/20">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-text mb-2">
                    Venue Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Palais des Sports"
                    className="w-full px-4 py-3 bg-input-bg border border-card-border rounded-xl text-text placeholder:text-subtext/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 font-medium outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text mb-2">
                    Location / Address
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g. N'Djamena, Tchad"
                    className="w-full px-4 py-3 bg-input-bg border border-card-border rounded-xl text-text placeholder:text-subtext/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 font-medium outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text mb-2">
                    Maximum Capacity
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    placeholder="e.g. 5000"
                    className="w-full px-4 py-3 bg-input-bg border border-card-border rounded-xl text-text placeholder:text-subtext/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 font-medium outline-none transition-all"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 bg-card-border/30 text-subtext font-bold rounded-xl hover:bg-card-border/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 px-4 bg-primary text-white font-bold rounded-xl hover:brightness-110 disabled:opacity-70 flex justify-center items-center gap-2 transition-all"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : editingVenue ? (
                    'Update Venue'
                  ) : (
                    'Save Venue'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-overlay-dark z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl w-full max-w-sm shadow-2xl border border-card-border p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-error/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-error" />
            </div>
            <h3 className="text-xl font-bold text-text mb-2">Delete Venue?</h3>
            <p className="text-subtext text-sm mb-6">
              Are you sure you want to delete{' '}
              <span className="font-bold text-text">{deleteTarget.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 bg-card-border/30 text-subtext font-bold rounded-xl hover:bg-card-border/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-error text-white font-bold rounded-xl hover:brightness-110 disabled:opacity-70 flex justify-center items-center gap-2 transition-all"
              >
                {deleting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
