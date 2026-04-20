import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { formatCurrency } from "../../utils/currency";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-cyan-400/30 bg-slate-900/95 backdrop-blur-xl px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-cyan-300">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} style={{ color: entry.color }} className="text-sm font-bold">
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function SpendingTrendChart({ data = [] }) {
  return (
    <section className="rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-xl">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">📈 30-Day Spending Trend</h3>
        <p className="text-sm text-slate-400 mt-1">Track your income and expenses over time</p>
      </div>
      {data.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/20 bg-slate-900/40 p-8 text-center">
          <p className="text-3xl mb-2">💰</p>
          <p className="text-slate-300 font-medium">No spending data yet</p>
          <p className="text-sm text-slate-500 mt-1">Add transactions to see your spending trend.</p>
        </div>
      ) : (
        <div className="mt-2 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.25)" />
              <XAxis dataKey="label" stroke="#94a3b8" interval={4} tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
                name="💙 Spending"
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

