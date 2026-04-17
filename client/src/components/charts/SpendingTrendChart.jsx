import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "../../utils/currency";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2 text-xs text-slate-100">
      <p className="font-medium">{label}</p>
      <p>{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export default function SpendingTrendChart({ data = [] }) {
  return (
    <section className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl">
      <h3 className="text-sm font-medium text-slate-200">Spending Trend (Last 30 Days)</h3>
      {data.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/20 bg-slate-900/40 p-5 text-center text-sm text-slate-300">
          No expense data yet.
        </div>
      ) : (
        <div className="mt-2 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.25)" />
              <XAxis dataKey="label" stroke="#94a3b8" interval={4} tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#22d3ee"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

