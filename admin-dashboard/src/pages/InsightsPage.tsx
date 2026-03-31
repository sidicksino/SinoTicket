import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Panel } from "../components/ui/Panel";
import { dashboardSeed } from "../data/seed";

const conversionData = [
  { stage: "Visited", value: 100 },
  { stage: "Selected", value: 67 },
  { stage: "Checkout", value: 52 },
  { stage: "Purchased", value: 45 },
];

export function InsightsPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-2 pb-12 font-body">
      <Panel
        title="Checkout Funnel"
        subtitle="Identify the biggest drop-off point for conversion optimization"
      >
        <div className="h-80 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={conversionData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis 
                dataKey="stage" 
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
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  background: "rgba(0,0,0,0.8)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[12, 12, 0, 0]} barSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel
        title="Channel Notes"
        subtitle="Current operational observations for this week"
      >
        <ul className="space-y-3 mt-6">
          {[
            "Organic campaigns are generating +21% more ticket selections than paid social.",
            "VIP seats sell out 1.8x faster during Friday evening launches.",
            "Two venues are flagged for payment retries above the 5% threshold.",
            "Average support response time improved from 8m 10s to 6m 40s.",
          ].map((note, index) => (
            <li key={index} className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 text-sm text-white/70 leading-relaxed transition-colors hover:bg-white/[0.03]">
              {note}
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60 shrink-0 mt-1">
            <span className="text-xs font-bold">!</span>
          </div>
          <div>
            <p className="text-sm text-white/40 leading-relaxed">
              Pro tip: connect this section to your backend analytics endpoint and
              replace these placeholders with live KPI commentary.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-2 font-medium">
            Top event by demand right now
          </p>
          <div className="flex items-end justify-between gap-4">
            <p className="text-2xl font-heading italic text-white tracking-tight leading-none">
              {dashboardSeed.events[0].name}
            </p>
            <p className="text-sm font-semibold text-emerald-400">91.2% RATIO</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
