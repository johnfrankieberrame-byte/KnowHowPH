import { BarChart3, Laptop, MapPin, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import TrendingSkills from "./insights/TrendingSkills";
import LiveProofFeed from "./insights/LiveProofFeed";

const salaryData = [
  { industry: "Technology", Entry: 35000, Senior: 120000 },
  { industry: "BPO & Shared Services", Entry: 22000, Senior: 85000 },
  { industry: "Finance & Fintech", Entry: 28000, Senior: 110000 },
  { industry: "Healthcare & Nursing", Entry: 25000, Senior: 75000 },
  { industry: "Engineering & Construction", Entry: 26000, Senior: 95000 },
  { industry: "Creative & Digital Media", Entry: 24000, Senior: 90000 },
];

const growthData = [
  { year: 2024, Tech: 100, Healthcare: 100 },
  { year: 2025, Tech: 128, Healthcare: 108 },
  { year: 2026, Tech: 165, Healthcare: 117 },
  { year: 2027, Tech: 212, Healthcare: 126 },
  { year: 2028, Tech: 270, Healthcare: 136 },
];

function currencyTick(value: number) {
  return `₱${value / 1000}k`;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-xs shadow-xl">
      <p className="mb-1 font-bold text-white">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.dataKey}: ₱{Number(entry.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

const metrics = [
  { label: "Market Demand", value: "High", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Remote Friendly", value: "65%", icon: Laptop, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Avg. Entry Pay", value: "₱25k+", icon: BarChart3, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Top Hubs", value: "NCR, Cebu, Clark, Davao", icon: MapPin, color: "text-purple-600", bg: "bg-purple-50" },
];

export default function MarketInsights() {
  return (
    <section id="insights" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h2 className="font-serif text-4xl font-bold text-zinc-900">PH Market Intelligence</h2>
        <p className="mt-2 text-zinc-500">Salary benchmarks and career trends, grounded in Philippine data.</p>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-zinc-200 bg-white p-6">
            <span className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${metric.bg} ${metric.color}`}>
              <metric.icon size={20} />
            </span>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{metric.label}</p>
            <p className="mt-1 text-xl font-bold text-zinc-900">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h3 className="mb-4 font-bold text-zinc-900">Salary Benchmarks by Industry</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={salaryData} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
              <XAxis
                dataKey="industry"
                tick={{ fontSize: 10, fill: "#71717a" }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={70}
              />
              <YAxis tickFormatter={currencyTick} tick={{ fontSize: 11, fill: "#71717a" }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Entry" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Senior" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h3 className="mb-4 font-bold text-zinc-900">5-Year Growth Trajectory (Indexed)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={growthData} margin={{ left: 0, right: 10 }}>
              <defs>
                <linearGradient id="techGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#71717a" }} />
              <YAxis tick={{ fontSize: 11, fill: "#71717a" }} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="Tech" stroke="#10b981" fill="url(#techGradient)" strokeWidth={2} />
              <Area
                type="monotone"
                dataKey="Healthcare"
                stroke="#3b82f6"
                fill="url(#healthGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TrendingSkills />
        <LiveProofFeed />
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="text-lg italic text-zinc-700">
          &ldquo;Employers are shifting towards skill-based hiring rather than just degree-based,
          especially in the tech and outsourcing sectors.&rdquo;
        </p>
        <p className="mt-3 text-sm font-semibold text-zinc-400">— Source: PH Labor Report</p>
      </div>
    </section>
  );
}
