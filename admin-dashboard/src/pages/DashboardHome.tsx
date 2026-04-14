import { useAuth } from '@clerk/clerk-react';
import { DollarSign, Ticket, TrendingUp, Users, type LucideIcon, Loader2, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface StatCardProps {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: number;
}

function StatCard({ label, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="bg-card p-6 rounded-3xl border border-card-border shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
          <Icon size={24} />
        </div>
        {trend !== undefined && trend !== 0 && (
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
            trend > 0
              ? 'bg-success/10 text-success'
              : 'bg-error/10 text-error'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="text-subtext font-semibold text-sm mb-1">{label}</h3>
      <div className="text-2xl font-bold text-text">{value}</div>
      <p className="text-subtext text-xs mt-2">{description}</p>
    </div>
  );
}

// Format numbers easily
const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

export default function DashboardHome() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchStats = async () => {
          try {
              const token = await getToken();
              const res = await fetch('http://localhost:5001/api/dashboard/stats', {
                  headers: { Authorization: `Bearer ${token}` }
              });
              const data = await res.json();
              if (data.success) {
                  setStats(data.stats);
              }
          } catch (err) {
              console.error("Error fetching stats", err);
          } finally {
              setLoading(false);
          }
      };
      
      fetchStats();
  }, []);

  if (loading || !stats) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-primary">
            <Loader2 className="animate-spin w-10 h-10" />
            <p className="text-subtext font-bold animate-pulse">Aggregating live data...</p>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-2xl font-bold text-text">Dashboard Overview</h2>
        <p className="text-subtext mt-1">Welcome back! Here is what's happening with SinoTicket today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Revenue" 
          value={`${formatNumber(stats.totalRevenue)} XAF`} 
          description="Total earnings historically"
          icon={DollarSign}
          trend={stats.totalRevenue > 0 ? 12 : 0}
        />
        <StatCard 
          label="Tickets Sold" 
          value={formatNumber(stats.totalTickets)} 
          description="Active tickets issued"
          icon={Ticket}
          trend={stats.totalTickets > 0 ? 8 : 0}
        />
        <StatCard 
          label="Active Users" 
          value={formatNumber(stats.totalUsers)} 
          description="Registered profiles"
          icon={Users}
          trend={stats.totalUsers > 0 ? 5 : 0}
        />
        <StatCard 
          label="Total Events" 
          value={formatNumber(stats.totalEvents)} 
          description="Events orchestrated"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart View */}
        <div className="bg-card p-6 md:p-8 rounded-3xl border border-card-border min-h-[400px] flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-text mb-1">Recent Trajectory</h3>
            <p className="text-xs text-subtext">Estimated ticket demand over trailing 6 months.</p>
          </div>
          
          <div className="flex-1 w-full min-h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <defs>
                         <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#FB6900" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#FB6900" stopOpacity={0}/>
                         </linearGradient>
                         <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#A88BFA" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#A88BFA" stopOpacity={0}/>
                         </linearGradient>
                     </defs>
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888888', fontSize: 12, fontWeight: 'bold' }} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888888', fontSize: 12 }} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--card-border)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 'bold' }}
                     />
                     <Area type="monotone" dataKey="visitors" stroke="#A88BFA" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
                     <Area type="monotone" dataKey="sales" stroke="#FB6900" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                 </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
        
        {/* Latest Events */}
        <div className="bg-card p-6 md:p-8 rounded-3xl border border-card-border flex flex-col">
          <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text">Latest Events</h3>
              <button className="text-sm text-primary font-bold">View All</button>
          </div>
          
          <div className="space-y-4 flex-1">
            {stats.latestEvents && stats.latestEvents.length > 0 ? (
               stats.latestEvents.map((event: any) => (
                 <div key={event._id} className="flex items-center gap-4 p-4 rounded-2xl border border-card-border bg-card-border/10 hover:bg-card-border/20 transition-colors">
                   {event.image ? (
                     <img src={event.image} alt={event.title} className="w-14 h-14 rounded-xl object-cover" />
                   ) : (
                     <div className="w-14 h-14 bg-card-border/50 text-subtext rounded-xl flex items-center justify-center">
                         <Calendar size={24} />
                     </div>
                   )}
                   <div className="flex-1 min-w-0">
                     <h4 className="font-bold text-text truncate leading-tight">{event.title}</h4>
                     <p className="text-xs text-subtext mt-1 truncate">
                        {new Date(event.date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })} • {event.venue_name}
                     </p>
                   </div>
                   <div className="text-right flex-shrink-0 w-24">
                     <div className="font-bold text-text text-sm">{event.soldPercentage}% Sold</div>
                     <div className="w-full h-1.5 bg-card-border rounded-full mt-1.5 overflow-hidden">
                       <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${event.soldPercentage}%` }}></div>
                     </div>
                   </div>
                 </div>
               ))
            ) : (
                <div className="text-center py-10 text-subtext">
                    <Calendar className="mx-auto h-12 w-12 opacity-30 mb-3" />
                    <p className="font-bold">No events created yet.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
