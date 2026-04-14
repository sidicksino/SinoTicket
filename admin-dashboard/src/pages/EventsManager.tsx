import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import {
  Plus,
  Search,
  Filter,
  Loader2,
  Calendar as CalendarIcon,
  X,
  Edit,
  Trash2,
  Eye,
  ImageIcon,
  Upload,
} from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useRef } from 'react';

// ─── Types ────────────────────────────────────────
interface Artist {
  name: string;
  time: string;
}

interface TicketCategory {
  name: string;
  price: number;
  quantity: number;
  sold?: number;
}

interface Venue {
  _id: string;
  name: string;
  location: string;
  capacity?: number;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  category: string;
  status?: string;
  venue_id?: Venue;
  ticket_categories?: TicketCategory[];
  artist_lineup?: Artist[];
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  venue_id: string;
  category: string;
  ticket_categories: TicketCategory[];
  artist_lineup: Artist[];
}

const EMPTY_FORM: EventFormData = {
  title: '',
  description: '',
  date: '',
  imageUrl: '',
  venue_id: '',
  category: 'Music',
  ticket_categories: [{ name: 'General Admission', price: 0, quantity: 100 }],
  artist_lineup: [],
};

const CATEGORIES = ['Music', 'Sports', 'Cultural', 'Business', 'Fashion'];

export default function EventsManager() {
  const { getToken } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<EventFormData>(EMPTY_FORM);
  const [error, setError] = useState('');

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Detail view
  const [viewEvent, setViewEvent] = useState<Event | null>(null);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  // ─── Fetch data ─────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, venuesRes] = await Promise.all([
        fetch('http://localhost:5001/api/events'),
        fetch('http://localhost:5001/api/venue/getVenue'),
      ]);
      const eventsData = await eventsRes.json();
      const venuesData = await venuesRes.json();

      if (eventsData.success) setEvents(eventsData.events);
      if (venuesData.success) {
        setVenues(venuesData.venues);
        if (venuesData.venues.length > 0) {
          setFormData((prev) => ({ ...prev, venue_id: venuesData.venues[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ─── Filtered events ────────────────────────────
  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !filterCategory || e.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // ─── Open modals ────────────────────────────────
  const openAdd = () => {
    setEditingEvent(null);
    setFormData({
      ...EMPTY_FORM,
      venue_id: venues.length > 0 ? venues[0]._id : '',
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    setShowModal(true);
  };

  const openEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      imageUrl: event.imageUrl || '',
      venue_id: event.venue_id?._id || '',
      category: event.category,
      ticket_categories: event.ticket_categories?.map((tc) => ({
        name: tc.name,
        price: tc.price,
        quantity: tc.quantity,
      })) || [{ name: 'General Admission', price: 0, quantity: 100 }],
      artist_lineup: event.artist_lineup?.map((a) => ({
        name: a.name,
        time: a.time,
      })) || [],
    });
    setSelectedFile(null);
    setPreviewUrl(event.imageUrl || '');
    setError('');
    setShowModal(true);
  };

  // ─── File Handling ──────────────────────────────
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return formData.imageUrl;

    setUploading(true);
    try {
      const token = await getToken();
      const uploadFormData = new FormData();
      uploadFormData.append('image', selectedFile);

      const res = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      const data = await res.json();
      if (data.success) {
        return data.imageUrl;
      } else {
        throw new Error(data.message || 'Image upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // ─── Ticket category helpers ────────────────────
  const addTicketCategory = () => {
    setFormData({
      ...formData,
      ticket_categories: [
        ...formData.ticket_categories,
        { name: '', price: 0, quantity: 0 },
      ],
    });
  };

  const updateTicket = (
    index: number,
    field: keyof TicketCategory,
    value: string
  ) => {
    const updated = [...formData.ticket_categories];
    if (field === 'name') {
      updated[index][field] = value;
    } else {
      (updated[index][field] as number) = Number(value);
    }
    setFormData({ ...formData, ticket_categories: updated });
  };

  const removeTicket = (index: number) => {
    const updated = [...formData.ticket_categories];
    updated.splice(index, 1);
    setFormData({ ...formData, ticket_categories: updated });
  };

  // ─── Artist lineup helpers ──────────────────────
  const addArtist = () => {
    setFormData({
      ...formData,
      artist_lineup: [
        ...formData.artist_lineup,
        { name: '', time: '' },
      ],
    });
  };

  const updateArtist = (
    index: number,
    field: keyof Artist,
    value: string
  ) => {
    const updated = [...formData.artist_lineup];
    updated[index][field] = value;
    setFormData({ ...formData, artist_lineup: updated });
  };

  const removeArtist = (index: number) => {
    const updated = [...formData.artist_lineup];
    updated.splice(index, 1);
    setFormData({ ...formData, artist_lineup: updated });
  };

  // ─── Save (create / update) ─────────────────────
  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = await getToken();
      
      // 1. Upload image if selected
      const finalImageUrl = await uploadImage();
      if (!finalImageUrl && selectedFile) return; // Error already set in uploadImage

      const isEdit = !!editingEvent;
      const eventDate = formData.date ? new Date(formData.date) : new Date();

      const payload = {
        title: formData.title,
        description: formData.description,
        date: eventDate.toISOString(),
        imageUrl: finalImageUrl || 'https://images.unsplash.com/photo-1540575861501-7ad058c67a3f?q=80&w=800',
        venue_id: formData.venue_id,
        category: formData.category,
        ticket_categories: formData.ticket_categories,
        artist_lineup: formData.artist_lineup,
      };

      const url = isEdit
        ? `http://localhost:5001/api/events/${editingEvent!._id}`
        : 'http://localhost:5001/api/events/add';

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setShowModal(false);
        setFormData(EMPTY_FORM);
        fetchData();
      } else {
        setError(data.message || 'Validation error. Check fields.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ─────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `http://localhost:5001/api/events/${deleteTarget._id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        setDeleteTarget(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // ─── Helpers ────────────────────────────────────
  function getSalesInfo(event: Event) {
    const total = event.ticket_categories?.reduce((s, c) => s + (c.quantity || 0), 0) || 0;
    const sold = event.ticket_categories?.reduce((s, c) => s + (c.sold || 0), 0) || 0;
    const pct = total === 0 ? 0 : Math.round((sold / total) * 100);
    return { total, sold, pct };
  }

  function getStatusBadge(event: Event) {
    const d = new Date(event.date);
    const now = new Date();
    if (event.status === 'Ended' || d < now) return { label: 'Ended', cls: 'bg-error/10 text-error' };
    if (event.status === 'Ongoing') return { label: 'Live', cls: 'bg-success/10 text-success' };
    return { label: 'Upcoming', cls: 'bg-primary/10 text-primary' };
  }

  // ─── Render ─────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text">Events</h2>
          <p className="text-subtext mt-1">Create and manage your platform events.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-[0.97]"
        >
          <Plus size={20} />
          <span>Create Event</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-card rounded-3xl border border-card-border overflow-hidden shadow-sm">
        <div className="p-5 border-b border-card-border flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-subtext" size={18} />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-input-bg border border-card-border rounded-xl text-text placeholder:text-subtext/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Filter size={18} className="text-subtext" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 bg-input-bg border border-card-border rounded-xl text-text font-bold outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-20 flex justify-center text-primary">
            <Loader2 className="animate-spin" size={40} />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarIcon size={48} className="mx-auto text-subtext/30 mb-4" />
            <h3 className="text-lg font-bold text-text">No events found</h3>
            <p className="text-subtext text-sm mt-1">
              {events.length > 0
                ? 'Try adjusting your search or filters.'
                : 'Create your first event to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-card-border/20 text-subtext text-xs font-bold uppercase tracking-widest border-b border-card-border">
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Venue</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Sales</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/50">
                {filteredEvents.map((event) => {
                  const { total, sold, pct } = getSalesInfo(event);
                  const status = getStatusBadge(event);

                  return (
                    <tr
                      key={event._id}
                      className="hover:bg-card-border/10 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={event.imageUrl}
                            alt=""
                            className="w-10 h-10 object-cover bg-card-border rounded-xl flex-shrink-0"
                          />
                          <span className="font-bold text-text truncate max-w-[200px]">
                            {event.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-card-border/30 text-subtext">
                          {event.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-subtext">
                        {event.venue_id?.name || 'TBA'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-text">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-text">
                          {sold}/{total}
                        </div>
                        <div className="w-24 h-1.5 bg-card-border rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct > 80 ? 'bg-success' : 'bg-primary'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewEvent(event)}
                            className="p-2 text-subtext hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openEdit(event)}
                            className="p-2 text-subtext hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(event)}
                            className="p-2 text-subtext hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Add / Edit Modal ─────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-overlay-dark z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl border border-card-border flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-card-border flex items-center justify-between flex-shrink-0">
              <h3 className="text-xl font-bold text-text">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h3>
              <button
                disabled={saving}
                onClick={() => setShowModal(false)}
                className="p-2 text-subtext hover:bg-card-border/50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="event-form" onSubmit={handleSave} className="space-y-6">
                {error && (
                  <div className="p-3 bg-error/10 text-error text-sm font-bold rounded-xl border border-error/20">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-text mb-2">
                        Event Title
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-input-bg border border-card-border rounded-xl text-text placeholder:text-subtext/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-text mb-2">
                        Date & Time
                      </label>
                      <input
                        required
                        type="datetime-local"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-input-bg border border-card-border rounded-xl text-text focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-text mb-2">
                        Venue
                      </label>
                      <select
                        required
                        value={formData.venue_id}
                        onChange={(e) =>
                          setFormData({ ...formData, venue_id: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-input-bg border border-card-border rounded-xl text-text focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
                      >
                        <option value="" disabled>
                          Select a Venue
                        </option>
                        {venues.map((v) => (
                          <option key={v._id} value={v._id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-text mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-input-bg border border-card-border rounded-xl text-text focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-text mb-2">
                        Event Image
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="relative h-32 w-full bg-input-bg border-2 border-dashed border-card-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-all flex flex-col items-center justify-center group"
                      >
                        {previewUrl ? (
                          <>
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Upload className="text-white" size={24} />
                            </div>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="text-subtext mb-2" size={24} />
                            <span className="text-xs text-subtext font-bold uppercase tracking-widest">Click to upload</span>
                          </>
                        )}
                        {uploading && (
                          <div className="absolute inset-0 bg-card/60 flex items-center justify-center">
                            <Loader2 className="text-primary animate-spin" size={24} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-text mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-input-bg border border-card-border rounded-xl text-text placeholder:text-subtext/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none resize-none"
                  />
                </div>

                {/* Artist Lineup */}
                <div className="pt-6 border-t border-card-border">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-text">Artist Lineup</h4>
                    <button
                      type="button"
                      onClick={addArtist}
                      className="text-sm font-bold text-primary hover:text-primary/80"
                    >
                      + Add Artist
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.artist_lineup.length === 0 ? (
                      <p className="text-xs text-subtext italic">No artists added yet.</p>
                    ) : (
                      formData.artist_lineup.map((artist, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Artist Name"
                            required
                            value={artist.name}
                            onChange={(e) =>
                              updateArtist(index, 'name', e.target.value)
                            }
                            className="flex-1 px-3 py-2.5 bg-input-bg border border-card-border rounded-lg text-text text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          />
                          <input
                            type="text"
                            placeholder="Time (e.g. 8:00 PM)"
                            value={artist.time}
                            onChange={(e) =>
                              updateArtist(index, 'time', e.target.value)
                            }
                            className="w-40 px-3 py-2.5 bg-input-bg border border-card-border rounded-lg text-text text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          />
                          <button
                            type="button"
                            onClick={() => removeArtist(index)}
                            className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Tickets */}
                <div className="pt-6 border-t border-card-border">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-text">Ticket Categories</h4>
                    <button
                      type="button"
                      onClick={addTicketCategory}
                      className="text-sm font-bold text-primary hover:text-primary/80"
                    >
                      + Add Category
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.ticket_categories.map((cat, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Name"
                          required
                          value={cat.name}
                          onChange={(e) =>
                            updateTicket(index, 'name', e.target.value)
                          }
                          className="flex-1 px-3 py-2.5 bg-input-bg border border-card-border rounded-lg text-text text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          min="0"
                          required
                          value={cat.price}
                          onChange={(e) =>
                            updateTicket(index, 'price', e.target.value)
                          }
                          className="w-24 px-3 py-2.5 bg-input-bg border border-card-border rounded-lg text-text text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="text-subtext font-bold text-xs">XAF</span>
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          required
                          value={cat.quantity}
                          onChange={(e) =>
                            updateTicket(index, 'quantity', e.target.value)
                          }
                          className="w-20 px-3 py-2.5 bg-input-bg border border-card-border rounded-lg text-text text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                          type="button"
                          onClick={() => removeTicket(index)}
                          disabled={formData.ticket_categories.length === 1}
                          className="p-2 text-error hover:bg-error/10 rounded-lg disabled:opacity-30 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-card-border bg-card-border/10 flex justify-end gap-3 rounded-b-3xl flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="py-2.5 px-5 bg-card-border/30 text-subtext font-bold rounded-xl hover:bg-card-border/50 transition-colors"
              >
                Cancel
              </button>
              <button
                form="event-form"
                type="submit"
                disabled={saving || uploading}
                className="py-2.5 px-6 bg-primary text-white font-bold rounded-xl hover:brightness-110 disabled:opacity-70 flex items-center gap-2 transition-all min-w-[140px] justify-center"
              >
                {saving || uploading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : editingEvent ? (
                  'Update Event'
                ) : (
                  'Publish Event'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── View Detail Modal ────────────────────── */}
      {viewEvent && (
        <div className="fixed inset-0 bg-overlay-dark z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl w-full max-w-lg shadow-2xl border border-card-border overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Image */}
            <div className="h-48 relative">
              <img
                src={viewEvent.imageUrl}
                alt={viewEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              <button
                onClick={() => setViewEvent(null)}
                className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 -mt-8 relative space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-bold text-text">{viewEvent.title}</h3>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0 ${getStatusBadge(viewEvent).cls}`}>
                  {getStatusBadge(viewEvent).label}
                </span>
              </div>

              <p className="text-subtext text-sm leading-relaxed">
                {viewEvent.description}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-card-border/20 px-4 py-3 rounded-xl">
                  <div className="text-xs text-subtext font-bold uppercase tracking-widest mb-1">
                    Date
                  </div>
                  <div className="text-sm font-bold text-text">
                    {new Date(viewEvent.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <div className="bg-card-border/20 px-4 py-3 rounded-xl">
                  <div className="text-xs text-subtext font-bold uppercase tracking-widest mb-1">
                    Venue
                  </div>
                  <div className="text-sm font-bold text-text">
                    {viewEvent.venue_id?.name || 'TBA'}
                  </div>
                </div>
              </div>

              {/* Artist Lineup View */}
              {viewEvent.artist_lineup && viewEvent.artist_lineup.length > 0 && (
                <div className="pt-4 border-t border-card-border">
                  <h4 className="text-sm font-bold text-text mb-3">Artist Lineup</h4>
                  <div className="space-y-3">
                    {viewEvent.artist_lineup.map((artist, i) => (
                      <div key={i} className="flex justify-between items-center text-sm bg-card-border/10 p-2.5 rounded-xl border border-card-border/30">
                        <div className="font-bold text-text">{artist.name}</div>
                        <div className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md">
                          {artist.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tickets breakdown */}
              {viewEvent.ticket_categories && viewEvent.ticket_categories.length > 0 && (
                <div className="pt-4 border-t border-card-border">
                  <h4 className="text-sm font-bold text-text mb-3">Sales Breakdown</h4>
                  <div className="space-y-3">
                    {viewEvent.ticket_categories.map((tc, i) => {
                      const tcPct = tc.quantity === 0 ? 0 : Math.round(((tc.sold || 0) / tc.quantity) * 100);
                      return (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-text">{tc.name}</span>
                            <span className="text-subtext">
                              {(tc.sold || 0)}/{tc.quantity} Sold
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-card-border rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${tcPct > 80 ? 'bg-success' : 'bg-primary'}`}
                                style={{ width: `${tcPct}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-primary min-w-[60px] text-right">
                              {tc.price.toLocaleString()} XAF
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-card pb-2">
                <button
                  onClick={() => {
                    setViewEvent(null);
                    openEdit(viewEvent);
                  }}
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all text-sm"
                >
                  Edit Event
                </button>
                <button
                  onClick={() => setViewEvent(null)}
                  className="flex-1 py-3 bg-card-border/30 text-subtext font-bold rounded-xl hover:bg-card-border/50 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation ──────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-overlay-dark z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl w-full max-w-sm shadow-2xl border border-card-border p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-error/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-error" />
            </div>
            <h3 className="text-xl font-bold text-text mb-2">Delete Event?</h3>
            <p className="text-subtext text-sm mb-6">
              Are you sure you want to delete{' '}
              <span className="font-bold text-text">{deleteTarget.title}</span>?
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
