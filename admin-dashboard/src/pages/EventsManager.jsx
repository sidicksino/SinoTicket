import React from 'react';
import { Plus, Search, MoreVertical, Filter } from 'lucide-react';

export default function EventsManager() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Events</h2>
          <p className="text-slate-500">Create and manage your platform events.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold self-stretch sm:self-auto shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
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
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium text-slate-600 italic"
            />
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">
              <Filter size={18} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Venue</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Sales</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 font-bold text-slate-800">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex-shrink-0 overflow-hidden">
                        <div className="w-full h-full bg-blue-100 animate-pulse"></div>
                      </div>
                      <span>Met Gala Tribute {i}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-500">Fashion</td>
                  <td className="px-6 py-4 text-sm text-slate-500">Convention Center</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase">Upcoming</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-800">250/500</div>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1">
                      <div className="bg-blue-500 h-full w-[50%] rounded-full"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
