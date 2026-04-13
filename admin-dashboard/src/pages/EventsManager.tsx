import { useState, useEffect, type FormEvent } from 'react';
import { Plus, Search, Filter, Loader2, Calendar as CalendarIcon, X } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

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
  venue_id?: Venue;
  ticket_categories?: TicketCategory[];
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  venue_id: string;
  category: string;
  ticket_categories: TicketCategory[];
}

export default function EventsManager() {
  const { getToken } = useAuth();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    imageUrl: '',
    venue_id: '',
    category: 'Music',
    ticket_categories: [
      { name: 'General Admission', price: 0, quantity: 100 }
    ]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, venuesRes] = await Promise.all([
        fetch('http://localhost:5001/api/events'),
        fetch('http://localhost:5001/api/venues')
      ]);
      const eventsData = await eventsRes.json();
      const venuesData = await venuesRes.json();
      
      if (eventsData.success) setEvents(eventsData.events);
      if (venuesData.success) {
        setVenues(venuesData.venues);
        if (venuesData.venues.length > 0) {
          setFormData(prev => ({ ...prev, venue_id: venuesData.venues[0]._id }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTicketCategory = () => {
    setFormData({
      ...formData,
      ticket_categories: [
        ...formData.ticket_categories,
        { name: '', price: 0, quantity: 0 }
      ]
    });
  };

  const handleTicketChange = (index: number, field: keyof TicketCategory, value: string) => {
    const updated = [...formData.ticket_categories];
    if (field === 'name') {
      updated[index][field] = value;
    } else {
      (updated[index][field] as number) = Number(value);
    }
    setFormData({ ...formData, ticket_categories: updated });
  };

  const handleRemoveTicket = (index: number) => {
    const updated = [...formData.ticket_categories];
    updated.splice(index, 1);
    setFormData({ ...formData, ticket_categories: updated });
  };

  const handleAddEvent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAdding(true);
    setError('');
    
    try {
      const token = await getToken();
      
      let eventDate = new Date();
      if (formData.date) {
         eventDate = new Date(formData.date);
      }
      
      const payload = {
        title: formData.title,
        description: formData.description,
        date: eventDate.toISOString(),
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1540575861501-7ad058c67a3f?q=80&w=800',
        venue_id: formData.venue_id,
        category: formData.category,
        ticket_categories: formData.ticket_categories
      };

      const res = await fetch('http://localhost:5001/api/events/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowAddModal(false);
        setFormData({
          title: '',
          description: '',
          date: '',
          imageUrl: '',
          venue_id: venues.length > 0 ? venues[0]._id : '',
          category: 'Music',
          ticket_categories: [{ name: 'General Admission', price: 0, quantity: 100 }]
        });
        fetchData();
      } else {
        setError(data.message || 'Validation error. Check fields.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Events</h2>
          <p className="text-slate-500">Create and manage your platform events.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold self-stretch sm:self-auto shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
        >
          <Plus size={20} />
          <span>Create New Event</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search events..." 
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium text-slate-600"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">
              <Filter size={18} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {loading ? (
           <div className="p-20 flex justify-center text-blue-600"><Loader2 className="animate-spin" size={40} /></div>
        ) : events.length === 0 ? (
           <div className="p-12 text-center">
             <CalendarIcon size={48} className="mx-auto text-slate-300 mb-4" />
             <h3 className="text-lg font-bold text-slate-700">No events found</h3>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Venue</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {events.map((event) => {
                  const totalTickets = event.ticket_categories?.reduce((acc, c) => acc + (c.quantity || 0), 0) || 0;
                  const soldTickets = event.ticket_categories?.reduce((acc, c) => acc + (c.sold || 0), 0) || 0;
                  const pct = totalTickets === 0 ? 0 : Math.round((soldTickets / totalTickets) * 100);
                  
                  return (
                    <tr key={event._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 cursor-pointer">
                        <div className="flex items-center gap-4 font-bold text-slate-800">
                          <img src={event.imageUrl} alt="" className="w-10 h-10 object-cover bg-slate-100 rounded-xl flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{event.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-500">{event.category}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{event.venue_id?.name || "TBA"}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">
                        {new Date(event.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-800">{soldTickets}/{totalTickets}</div>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1">
                          <div className={`h-full rounded-full ${pct > 80 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }}></div>
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

       {/* Add Event Modal */}
       {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Draft New Event</h3>
              <button disabled={adding} onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="add-event-form" onSubmit={handleAddEvent} className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Event Title</label>
                      <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Date & Time</label>
                      <input required type="datetime-local" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Venue</label>
                      <select required value={formData.venue_id} onChange={(e) => setFormData({...formData, venue_id: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                        <option value="" disabled>Select a Venue</option>
                        {venues.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                      <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                        <option value="Music">Music</option>
                        <option value="Sports">Sports</option>
                        <option value="Cultural">Cultural</option>
                        <option value="Business">Business</option>
                        <option value="Fashion">Fashion</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Cover Image URL</label>
                      <input type="url" placeholder="Optional URL" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"></textarea>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-800">Ticket Categories</h4>
                    <button type="button" onClick={handleAddTicketCategory} className="text-sm font-bold text-blue-600 hover:text-blue-700">
                      + Add Category
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.ticket_categories.map((cat, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input type="text" placeholder="Name" required value={cat.name} onChange={(e) => handleTicketChange(index, 'name', e.target.value)} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
                        <input type="number" placeholder="Price" min="0" required value={cat.price} onChange={(e) => handleTicketChange(index, 'price', e.target.value)} className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
                        <span className="text-slate-400 font-bold">XAF</span>
                        <input type="number" placeholder="Qty" min="1" required value={cat.quantity} onChange={(e) => handleTicketChange(index, 'quantity', e.target.value)} className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
                        <button type="button" onClick={() => handleRemoveTicket(index)} disabled={formData.ticket_categories.length === 1} className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-3xl">
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="py-2.5 px-5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                form="add-event-form"
                type="submit" 
                disabled={adding}
                className="py-2.5 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2 transition-colors min-w-[140px] justify-center"
              >
                {adding ? <Loader2 className="animate-spin" size={20} /> : 'Publish Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
