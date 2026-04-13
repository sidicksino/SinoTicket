import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Edit, Trash2, X, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

export default function VenuesManager() {
  const { getToken } = useAuth();
  
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '', capacity: '' });
  const [error, setError] = useState('');

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5001/api/venues');
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

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleAddVenue = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError('');
    
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:5001/api/venues/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          capacity: parseInt(formData.capacity, 10),
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setFormData({ name: '', location: '', capacity: '' });
        fetchVenues();
      } else {
        setError(data.message || 'Validation error');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Venues</h2>
          <p className="text-slate-500">Locations where your events take place.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold self-stretch sm:self-auto shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
        >
          <Plus size={20} />
          <span>Add Venue</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-blue-600">
          <Loader2 className="animate-spin" size={40} />
        </div>
      ) : venues.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl">
          <MapPin size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">No venues found</h3>
          <p className="text-slate-500 mb-6">Create your first venue to start hosting events.</p>
          <button onClick={() => setShowAddModal(true)} className="px-6 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors">
            Add Venue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <div key={venue._id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm group">
              <div className="h-40 bg-slate-100 relative overflow-hidden">
                 <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors flex items-center justify-center">
                   <MapPin className="text-blue-600 opacity-20 group-hover:opacity-40 transition-opacity" size={48} />
                 </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-slate-900 mb-1">{venue.name}</h3>
                <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                  <MapPin size={14} /> {venue.location}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Capacity: <span className="text-blue-600 ml-1">{venue.capacity?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex gap-2">
                    {/* Placeholder action buttons */}
                    <button disabled className="p-2 text-slate-300 transition-colors cursor-not-allowed">
                      <Edit size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Venue Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Add New Venue</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddVenue} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Venue Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Palais des Sports"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Location / Address</label>
                  <input 
                    required
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g. Warda, Yaoundé"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Maximum Capacity</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    placeholder="e.g. 5000"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="mt-8 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={adding}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-70 flex justify-center items-center gap-2 transition-colors"
                >
                  {adding ? <Loader2 className="animate-spin" size={20} /> : 'Save Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
