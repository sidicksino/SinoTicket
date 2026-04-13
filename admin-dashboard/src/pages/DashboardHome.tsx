import { DollarSign, Ticket, TrendingUp, Users, type LucideIcon } from 'lucide-react';

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
        {trend !== undefined && (
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

export default function DashboardHome() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-2xl font-bold text-text">Dashboard Overview</h2>
        <p className="text-subtext mt-1">Welcome back! Here is what's happening with SinoTicket today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Revenue" 
          value="4,250,500 XAF" 
          description="Total earnings this month"
          icon={DollarSign}
          trend={12}
        />
        <StatCard 
          label="Tickets Sold" 
          value="1,248" 
          description="Tickets issued across all events"
          icon={Ticket}
          trend={8}
        />
        <StatCard 
          label="Active Users" 
          value="8,420" 
          description="Users currently registered"
          icon={Users}
          trend={5}
        />
        <StatCard 
          label="Conversion Rate" 
          value="3.2%" 
          description="Visitors to purchase ratio"
          icon={TrendingUp}
          trend={-2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-8 rounded-3xl border border-card-border min-h-[400px]">
          <h3 className="text-lg font-bold text-text mb-6">Recent Sales</h3>
          <div className="space-y-6 text-center py-20">
            <p className="text-subtext">Sales graph visualization — coming soon</p>
          </div>
        </div>
        
        <div className="bg-card p-8 rounded-3xl border border-card-border">
          <h3 className="text-lg font-bold text-text mb-6">Latest Events</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-card-border bg-card-border/20">
                <div className="w-12 h-12 bg-card-border rounded-xl flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-text truncate">Summer Music Festival {i}</h4>
                  <p className="text-sm text-subtext">Aug 24, 2026 • Palais des Sports</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-text text-sm">45% Sold</div>
                  <div className="w-24 h-1.5 bg-card-border rounded-full mt-1 overflow-hidden">
                    <div className="bg-primary h-full w-[45%]"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
