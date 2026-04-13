import React from 'react';
import { Plus, MapPin, Edit, Trash2 } from 'lucide-react';

export default function VenuesManager() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Venues</h2>
          <p className="text-slate-500">Locations where your events take place.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold self-stretch sm:self-auto shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
          <Plus size={20} />
          <span>Add Venue</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm group">
            <div className="h-40 bg-slate-100 relative overflow-hidden">
               <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors flex items-center justify-center">
                 <MapPin className="text-blue-600 opacity-20 group-hover:opacity-40 transition-opacity" size={48} />
               </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg text-slate-900 mb-1">Palais des Sports {i}</h3>
              <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                <MapPin size={14} /> Warda, Yaoundé
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Capacity: <span className="text-blue-600 ml-1">5,000</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                    <Edit size={18} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
