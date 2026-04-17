import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "../../utils/currency";

const COLORS = [
  "#22d3ee",
  "#38bdf8",
  "#60a5fa",
  "#818cf8",
  "#34d399",
  "#fbbf24",
  "#f87171",
  "#f472b6",
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0];
  return (
    <div className="rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2 text-xs text-slate-100">
      <p className="font-medium">{point.name}</p>
      <p>{formatCurrency(point.value)}</p>
    </div>
  );
}

export default function ExpenseByCategoryChart({ data = [] }) {
  return (
    <section className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl">
      <h3 className="text-sm font-medium text-slate-200">Expenses by Category</h3>
      {data.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/20 bg-slate-900/40 p-5 text-center text-sm text-slate-300">
          No expense data yet.
        </div>
      ) : (
        <div className="mt-2 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={105}
                paddingAngle={2}
              >
                {data.map((entry, idx) => (
                  <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

