import { useAuth } from '@clerk/clerk-react';
import { Armchair, ChevronLeft, ChevronRight, Loader2, MapPin, Play, Trash2, ShieldAlert } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

interface Venue {
  _id: string;
  name: string;
}

interface Section {
  _id: string;
  name: string;
  venue_id: Venue;
}

interface Seat {
  _id: string;
  section_id: string;
  number: number;
  status: 'available' | 'reserved' | 'booked';
}

export default function SeatsManager() {
  const { getToken } = useAuth();

  const [sections, setSections] = useState<Section[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  
  const [seats, setSeats] = useState<Seat[]>([]);
  const [totalSeats, setTotalSeats] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 100;

  const [loading, setLoading] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(false);

  // Filters
  const [filterVenueId, setFilterVenueId] = useState<string>('All');
  const [filterSectionId, setFilterSectionId] = useState<string>('All');

  // Generator State
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genCount, setGenCount] = useState<string>('100');
  const [genStart, setGenStart] = useState<string>('1');
  const [genError, setGenError] = useState('');

  // Wipe Section State
  const [wipeConfirmOpen, setWipeConfirmOpen] = useState(false);
  const [wiping, setWiping] = useState(false);

  // Fetch Meta (Venues & Sections)
  const fetchMeta = async () => {
    try {
      setLoading(true);
      const [sectionsRes, venuesRes] = await Promise.all([
        fetch('http://localhost:5001/api/sections'),
        fetch('http://localhost:5001/api/venue/getVenue')
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

  useEffect(() => { fetchMeta(); }, []);

  // Fetch Seats
  const fetchSeats = async () => {
    if (filterSectionId === 'All') {
        setSeats([]);
        setTotalSeats(0);
        return;
    }
    
    try {
      setLoadingSeats(true);
      const res = await fetch(`http://localhost:5001/api/seats?section_id=${filterSectionId}&page=${page}&limit=${limit}`);
      const data = await res.json();
      if (data.success) {
        setSeats(data.seats);
        setTotalSeats(data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSeats(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, [filterSectionId, page]);

  // Handle Generators
  const handleGenerate = async (e: FormEvent) => {
      e.preventDefault();
      if (filterSectionId === 'All') {
          setGenError("Please select a specific section to generate seats.");
          return;
      }
      setGenerating(true);
      setGenError('');

      try {
          const token = await getToken();
          const res = await fetch(`http://localhost:5001/api/seats/generate`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                  section_id: filterSectionId,
                  start_number: parseInt(genStart, 10),
                  count: parseInt(genCount, 10)
              })
          });

          const data = await res.json();
          if (data.success) {
              setGeneratorOpen(false);
              setPage(1);
              fetchSeats();
          } else {
              setGenError(data.message || 'Error generating seats');
          }
      } catch(err) {
          console.error(err);
          setGenError('Network error');
      } finally {
          setGenerating(false);
      }
  }

  // Handle wiping
  const handleWipe = async () => {
    if (filterSectionId === 'All') return;
    setWiping(true);
    try {
        const token = await getToken();
        const res = await fetch(`http://localhost:5001/api/seats/section/${filterSectionId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            setWipeConfirmOpen(false);
            setPage(1);
            fetchSeats();
        }
    } catch (err) {
        console.error(err);
    } finally {
        setWiping(false);
    }
  };

  // Change seat status quickly
  const toggleSeatStatus = async (seat: Seat) => {
    const nextStatus = seat.status === 'available' ? 'reserved' : seat.status === 'reserved' ? 'booked' : 'available';
    try {
        const token = await getToken();
        await fetch(`http://localhost:5001/api/seats/${seat._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status: nextStatus })
        });
        // Optimistic UI update
        setSeats(seats.map(s => s._id === seat._id ? { ...s, status: nextStatus } : s));
    } catch (err) {
        console.error(err);
    }
  }

  const validSections = filterVenueId === 'All'
    ? sections
    : sections.filter(s => s.venue_id?._id === filterVenueId);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col p-8 bg-card border border-card-border rounded-3xl">
        <h2 className="text-3xl font-bold tracking-tight text-text mb-2">Seats Management</h2>
        <p className="text-subtext mb-6">Bulk generate and monitor seating capacities per section.</p>

        <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
                <MapPin size={18} className="text-subtext" />
                <select
                value={filterVenueId}
                onChange={(e) => { setFilterVenueId(e.target.value); setFilterSectionId('All'); }}
                className="bg-background border border-card-border rounded-xl px-4 py-2 text-text focus:outline-none focus:border-primary"
                >
                <option value="All">All Venues</option>
                {venues.map(v => (
                    <option key={v._id} value={v._id}>{v.name}</option>
                ))}
                </select>
            </div>
            
            <div className="flex items-center gap-3 border-l border-card-border pl-4">
                <select
                value={filterSectionId}
                onChange={(e) => { setFilterSectionId(e.target.value); setPage(1); }}
                className="bg-background border border-card-border rounded-xl px-4 py-2 text-text focus:outline-none focus:border-primary font-bold"
                >
                <option value="All">-- Select a Section --</option>
                {validSections.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.venue_id?.name || 'Unknown Venue'})</option>
                ))}
                </select>
            </div>
        </div>
      </div>

      {filterSectionId === 'All' ? (
          <div className="py-20 text-center border border-dashed border-card-border rounded-3xl bg-card/50">
              <Armchair className="mx-auto h-12 w-12 text-subtext/50 mb-4" />
              <h3 className="text-lg font-bold text-text mb-1">Select a Section</h3>
              <p className="text-subtext">You must select a specific section to manage its seats.</p>
          </div>
      ) : (
          <div className="space-y-6">
              
              {/* Toolbar */}
              <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <ShieldAlert size={20} />
                    <span>Selected Section holds {totalSeats} seats.</span>
                  </div>

                  <div className="flex gap-3">
                      <button 
                         onClick={() => setWipeConfirmOpen(true)}
                         className="flex items-center gap-2 px-4 py-2 rounded-xl border border-error/50 text-error hover:bg-error/10 font-bold transition-colors text-sm"
                      >
                          <Trash2 size={16} /> Wipe Seats
                      </button>
                      <button 
                         onClick={() => setGeneratorOpen(true)}
                         className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-colors shadow-lg shadow-primary/20 text-sm"
                      >
                          <Play size={16} fill="currentColor" /> Generate Block
                      </button>
                  </div>
              </div>

              {/* Data Table */}
              <div className="bg-card border border-card-border rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                      {loadingSeats ? (
                          <div className="py-12 flex justify-center">
                              <Loader2 className="animate-spin text-primary" size={32} />
                          </div>
                      ) : seats.length === 0 ? (
                          <div className="py-12 text-center text-subtext">No seats generated for this section yet.</div>
                      ) : (
                          <table className="w-full text-left border-collapse">
                              <thead>
                                  <tr className="bg-card-border/30 text-subtext text-xs uppercase tracking-wider">
                                      <th className="p-4 font-bold rounded-tl-3xl">Seat #</th>
                                      <th className="p-4 font-bold">Status</th>
                                      <th className="p-4 font-bold text-right rounded-tr-3xl">Actions</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-card-border">
                                  {seats.map(seat => (
                                      <tr key={seat._id} className="hover:bg-card-border/10 transition-colors">
                                          <td className="p-4 font-mono font-bold text-text">#{seat.number}</td>
                                          <td className="p-4">
                                              <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                                                  seat.status === 'available' ? 'bg-success/10 text-success border-success/20' :
                                                  seat.status === 'reserved' ? 'bg-accent/10 text-accent border-accent/20' :
                                                  'bg-error/10 text-error border-error/20'
                                              }`}>
                                                  {seat.status}
                                              </span>
                                          </td>
                                          <td className="p-4 text-right">
                                              <button 
                                                onClick={() => toggleSeatStatus(seat)}
                                                className="text-xs font-bold px-3 py-1.5 border border-card-border rounded-lg text-subtext hover:text-text hover:border-text transition-colors"
                                              >
                                                  Toggle State
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      )}
                  </div>

                  {/* Pagination */}
                  {totalSeats > 0 && (
                      <div className="flex items-center justify-between p-4 border-t border-card-border bg-background/50">
                          <span className="text-sm font-medium text-subtext">
                              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalSeats)} of {totalSeats} seats
                          </span>
                          <div className="flex gap-2">
                              <button 
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="p-2 border border-card-border rounded-xl text-subtext hover:text-text disabled:opacity-50 transition-colors bg-card"
                              >
                                  <ChevronLeft size={20} />
                              </button>
                              <button 
                                disabled={page * limit >= totalSeats}
                                onClick={() => setPage(page + 1)}
                                className="p-2 border border-card-border rounded-xl text-subtext hover:text-text disabled:opacity-50 transition-colors bg-card"
                              >
                                  <ChevronRight size={20} />
                              </button>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Generator Modal */}
      {generatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-[32px] border border-card-border shadow-2xl p-6">
              <h3 className="text-xl font-bold text-text mb-2">Automated Generator</h3>
              <p className="text-sm text-subtext mb-6">Create blocked sequential seats instantly.</p>
              
              <form onSubmit={handleGenerate} className="space-y-4">
                  {genError && <div className="text-xs text-error font-bold p-2 bg-error/10 rounded-lg">{genError}</div>}
                  
                  <div className="flex gap-4">
                      <div className="flex-1">
                          <label className="block text-xs font-bold text-subtext mb-1 uppercase tracking-wider">Start Number</label>
                          <input type="number" required min={1} value={genStart} onChange={e=>setGenStart(e.target.value)} className="w-full bg-background border border-card-border rounded-xl p-3 text-text font-mono" />
                      </div>
                      <div className="flex-1">
                          <label className="block text-xs font-bold text-subtext mb-1 uppercase tracking-wider">Count</label>
                          <input type="number" required min={1} max={5000} value={genCount} onChange={e=>setGenCount(e.target.value)} className="w-full bg-background border border-card-border rounded-xl p-3 text-text font-mono" />
                      </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                      <button type="button" onClick={() => setGeneratorOpen(false)} className="flex-1 py-3 text-subtext font-bold rounded-xl transition-colors">Cancel</button>
                      <button disabled={generating} type="submit" className="flex-1 bg-primary text-white font-bold rounded-xl transition-colors disabled:opacity-50">
                          {generating ? <Loader2 className="animate-spin mx-auto" /> : 'Launch Engine'}
                      </button>
                  </div>
              </form>
          </div>
        </div>
      )}

      {/* Wipe Confirm */}
      {wipeConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-[32px] border border-error/50 shadow-2xl shadow-error/10 p-6 text-center">
              <div className="w-16 h-16 bg-error/10 text-error rounded-2xl flex items-center justify-center mx-auto mb-4"><Trash2 size={32} /></div>
              <h3 className="text-xl font-bold text-error mb-2">Wipe Entire Section?</h3>
              <p className="text-sm text-subtext mb-6">This action is irreversible and drops all current seating capacity for the chosen section.</p>
              <div className="flex gap-3">
                  <button onClick={() => setWipeConfirmOpen(false)} className="flex-1 py-3 bg-background border border-card-border rounded-xl font-bold text-text">Cancel</button>
                  <button onClick={handleWipe} disabled={wiping} className="flex-1 py-3 bg-error text-white font-bold rounded-xl disabled:opacity-50">
                      {wiping ? <Loader2 className="animate-spin mx-auto" /> : 'Purge All'}
                  </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}
