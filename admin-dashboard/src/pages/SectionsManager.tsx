import { useAuth } from "@clerk/clerk-react";
import { Edit, Layers, Loader2, MapPin, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { apiUrl } from "../lib/api";

interface Venue {
  _id: string;
  name: string;
}

interface Section {
  _id: string;
  name: string;
  description: string;
  venue_id: Venue;
  parent_section_id?: string | null;
}

interface SectionFormData {
  name: string;
  description: string;
  venue_id: string;
  parent_section_id: string;
}

const EMPTY_FORM: SectionFormData = {
  name: "",
  description: "",
  venue_id: "",
  parent_section_id: "",
};

export default function SectionsManager() {
  const { getToken } = useAuth();

  const [sections, setSections] = useState<Section[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterVenueId, setFilterVenueId] = useState<string>("All");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<SectionFormData>(EMPTY_FORM);
  const [error, setError] = useState("");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sectionsRes, venuesRes] = await Promise.all([
        fetch(apiUrl("/api/sections")),
        fetch(apiUrl("/api/venue/getVenue")),
      ]);
      const stData = await sectionsRes.json();
      const vnData = await venuesRes.json();

      if (stData.success) setSections(stData.sections);
      if (vnData.success) setVenues(vnData.venues);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdd = () => {
    setEditingSection(null);
    setFormData({
      ...EMPTY_FORM,
      venue_id: filterVenueId !== "All" ? filterVenueId : venues[0]?._id || "",
    });
    setError("");
    setShowModal(true);
  };

  const openEdit = (section: Section) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      description: section.description || "",
      venue_id: section.venue_id?._id || "",
      parent_section_id: section.parent_section_id || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = await getToken();
      const isEdit = !!editingSection;

      const payload: any = {
        name: formData.name,
        description: formData.description,
      };

      if (!isEdit) {
        payload.venue_id = formData.venue_id;
        if (formData.parent_section_id) {
          payload.parent_section_id = formData.parent_section_id;
        }
      }

      const url = isEdit
        ? apiUrl(`/api/sections/${editingSection!._id}`)
        : apiUrl("/api/sections/add");

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchData();
      } else {
        setError(data.message || "Error saving section");
      }
    } catch (err) {
      console.error(err);
      setError("Network error saving section");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!deleteTarget) return;

    setDeleting(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch(apiUrl(`/api/sections/${deleteTarget._id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDeleteTarget(null);
        fetchData();
      } else {
        setError(data.message || "Error deleting section");
      }
    } catch (err) {
      console.error(err);
      setError("Network error deleting section");
    } finally {
      setDeleting(false);
    }
  };

  const filteredSections =
    filterVenueId === "All"
      ? sections
      : sections.filter((s) => s.venue_id?._id === filterVenueId);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-text">
            Sections Manager
          </h2>
          <p className="text-subtext mt-1">
            Organize venues into discrete sections like VIP, General, Balcony.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Add Section
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <MapPin size={18} className="text-subtext" />
        <select
          value={filterVenueId}
          onChange={(e) => setFilterVenueId(e.target.value)}
          className="bg-card border border-card-border rounded-xl px-4 py-2 text-text focus:outline-none focus:border-primary"
        >
          <option value="All">All Venues</option>
          {venues.map((v) => (
            <option key={v._id} value={v._id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-primary">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-subtext font-medium animate-pulse">
            Loading sections...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSections.map((section) => (
            <div
              key={section._id}
              className="group bg-card rounded-3xl border border-card-border overflow-hidden hover:border-primary/50 transition-all shadow-sm hover:shadow-xl hover:shadow-primary/5 flex flex-col"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Layers className="text-primary" size={24} />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(section)}
                      className="p-2 bg-card border border-card-border rounded-xl text-subtext hover:text-primary transition-colors hover:border-primary/50"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(section)}
                      className="p-2 bg-card border border-card-border rounded-xl text-subtext hover:text-error transition-colors hover:border-error/50 hover:bg-error/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-text mb-1 line-clamp-1">
                  {section.name}
                </h3>

                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-card-border/50">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-background rounded-lg text-subtext">
                    {section.venue_id?.name || "Unknown Venue"}
                  </span>
                  {section.parent_section_id && (
                    <span className="text-xs font-semibold px-2.5 py-1 border border-primary/20 bg-primary/5 rounded-lg text-primary">
                      Has Parent Section
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredSections.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-card-border rounded-3xl bg-card">
              <Layers className="mx-auto h-12 w-12 text-subtext/50 mb-4" />
              <h3 className="text-lg font-bold text-text mb-1">
                No sections found
              </h3>
              <p className="text-subtext">Create a section to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Save Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-4xl border border-card-border shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-card-border">
              <h3 className="text-xl font-bold text-text">
                {editingSection ? "Edit Section" : "Add Section"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-subtext hover:text-text hover:bg-card-border/50 rounded-xl transition-colors"
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                {error && (
                  <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-text mb-2">
                    Section Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. VIP Front Row"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-text mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={2}
                    className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors resize-none"
                    placeholder="Short details about this section"
                  />
                </div>

                {!editingSection && (
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
                      className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="" disabled>
                        Select Venue
                      </option>
                      {venues.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-subtext hover:text-text font-bold rounded-xl transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center h-12 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-4xl border border-error/20 p-8 shadow-2xl text-center shadow-error/10">
            <div className="w-16 h-16 bg-error/10 text-error rounded-2xl flex items-center justify-center mx-auto mb-6 border border-error/20">
              <Trash2 size={32} />
            </div>

            <h3 className="text-xl font-bold text-text mb-2">
              Delete Section?
            </h3>
            <p className="text-subtext mb-8">
              Are you sure you want to delete{" "}
              <span className="font-bold text-text">{deleteTarget.name}</span>?
              <br />
              <br />
              <span className="text-error font-medium">
                WARNING: This will permanently wipe all seats associated with
                this section!
              </span>
            </p>

            {error && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-medium mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleDelete} className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-background hover:bg-card-border/50 text-text font-bold rounded-xl border border-card-border h-12 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={deleting}
                className="flex-1 bg-error hover:bg-error/90 text-white font-bold rounded-xl flex items-center justify-center h-12 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
