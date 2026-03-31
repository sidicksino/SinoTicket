import { Activity, DollarSign, Ticket, Timer } from "lucide-react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Panel } from "../components/ui/Panel";
import { StatCard } from "../components/ui/StatCard";
import { dashboardSeed } from "../data/seed";

const icons = [DollarSign, Ticket, Activity, Timer];

export function OverviewPage() {
  return (
    <div className="space-y-8 pb-12 font-body">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardSeed.metrics.map((metric, index) => {
          const Icon = icons[index];
          return (
            <div
              key={metric.title}
              className="relative group"
            >
              <div className="absolute right-4 top-4 rounded-xl bg-white/5 p-2.5 text-white/40 group-hover:text-white/80 transition-colors z-10 border border-white/5">
                <Icon size={18} />
              </div>
              <StatCard {...metric} />
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr,0.85fr]">
        <Panel
          title="Revenue Pulse"
          subtitle="Gross vs net performance by month"
        >
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardSeed.salesSeries}>
                <defs>
                  <linearGradient id="gross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="net" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="rgba(255,255,255,0.05)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
                  contentStyle={{
                    background: "rgba(0,0,0,0.8)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    color: "#fff",
                    fontSize: "12px",
                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="gross"
                  stroke="#ffffff"
                  fill="url(#gross)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="net"
                  stroke="#3b82f6"
                  fill="url(#net)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Seat Category Mix" subtitle="Live occupancy segmentation">
          <div className="h-80 flex flex-col items-center justify-between py-4">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardSeed.occupancySeries}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={65}
                    paddingAngle={8}
                    fill="#3b82f6"
                    stroke="none"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(0,0,0,0.8)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full">
              {dashboardSeed.occupancySeries.map((segment) => (
                <div
                  key={segment.name}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center"
                >
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{segment.name}</p>
                  <p className="text-sm font-semibold text-white">{segment.value}%</p>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </section>

      <Panel
        title="Recent Operations"
        subtitle="Latest actions made by admins and managers"
      >
        <ul className="space-y-3 mt-4">
          {dashboardSeed.recentActivity.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.01] px-5 py-4 transition-colors hover:bg-white/[0.03] group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60 group-hover:text-white transition-colors">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="font-medium text-white group-hover:text-white transition-colors">{item.title}</p>
                  <p className="text-sm text-white/40 font-light">{item.description}</p>
                </div>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium text-white/50 uppercase tracking-wider">
                {item.createdAt}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
