import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { dashboardSeed } from '../data/seed'
import { Panel } from '../components/ui/Panel'

const conversionData = [
  { stage: 'Visited', value: 100 },
  { stage: 'Selected', value: 67 },
  { stage: 'Checkout', value: 52 },
  { stage: 'Purchased', value: 45 },
]

export function InsightsPage() {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Panel
        title="Checkout Funnel"
        subtitle="Identify the biggest drop-off point for conversion optimization"
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
              <XAxis dataKey="stage" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid rgba(148,163,184,0.25)',
                  borderRadius: '12px',
                }}
              />
              <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Channel Notes" subtitle="Current operational observations for this week">
        <ul className="space-y-2 text-sm text-slate-200">
          <li className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
            Organic campaigns are generating +21% more ticket selections than paid social.
          </li>
          <li className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
            VIP seats sell out 1.8x faster during Friday evening launches.
          </li>
          <li className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
            Two venues are flagged for payment retries above the 5% threshold.
          </li>
          <li className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
            Average support response time improved from 8m 10s to 6m 40s.
          </li>
        </ul>

        <div className="mt-4 rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-3 text-sm text-cyan-100">
          Pro tip: connect this section to your backend analytics endpoint and replace these
          placeholders with live KPI commentary.
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/40 p-3">
          <p className="text-sm text-slate-300">Top event by demand right now</p>
          <p className="mt-1 text-lg font-semibold text-white">{dashboardSeed.events[0].name}</p>
          <p className="text-sm text-slate-300">Booked ratio: 91.2%</p>
        </div>
      </Panel>
    </div>
  )
}
