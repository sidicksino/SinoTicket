import { Activity, DollarSign, Ticket, Timer } from 'lucide-react'
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
} from 'recharts'
import { dashboardSeed } from '../data/seed'
import { Panel } from '../components/ui/Panel'
import { StatCard } from '../components/ui/StatCard'

const icons = [DollarSign, Ticket, Activity, Timer]

export function OverviewPage() {
  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {dashboardSeed.metrics.map((metric, index) => {
          const Icon = icons[index]
          return (
            <div key={metric.title} className="relative overflow-hidden rounded-2xl">
              <div className="absolute right-3 top-3 rounded-xl bg-white/10 p-2 text-cyan-200">
                <Icon size={16} />
              </div>
              <StatCard {...metric} />
            </div>
          )
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr,0.85fr]">
        <Panel title="Revenue Pulse" subtitle="Gross vs net performance by month">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardSeed.salesSeries}>
                <defs>
                  <linearGradient id="gross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="net" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,163,184,0.2)" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip
                  cursor={{ stroke: '#475569', strokeWidth: 1 }}
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(148,163,184,0.25)',
                    borderRadius: '12px',
                  }}
                />
                <Area type="monotone" dataKey="gross" stroke="#22d3ee" fill="url(#gross)" strokeWidth={2} />
                <Area type="monotone" dataKey="net" stroke="#f59e0b" fill="url(#net)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Seat Category Mix" subtitle="Live occupancy segmentation">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardSeed.occupancySeries}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={56}
                  paddingAngle={4}
                  fill="#06b6d4"
                />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(148,163,184,0.25)',
                    borderRadius: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
            {dashboardSeed.occupancySeries.map((segment) => (
              <div key={segment.name} className="rounded-xl border border-white/10 bg-slate-900/50 p-2.5">
                <p className="font-semibold text-slate-100">{segment.name}</p>
                <p>{segment.value}% seats</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <Panel title="Recent Operations" subtitle="Latest actions made by admins and managers">
        <ul className="space-y-2">
          {dashboardSeed.recentActivity.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-slate-900/40 px-3 py-3"
            >
              <div>
                <p className="font-medium text-white">{item.title}</p>
                <p className="text-sm text-slate-300">{item.description}</p>
              </div>
              <span className="rounded-full bg-cyan-500/15 px-2 py-1 text-xs font-semibold text-cyan-200">
                {item.createdAt}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
