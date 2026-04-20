import { Cell, Pie, PieChart, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "../../utils/currency";

const COLORS = [
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#10b981",
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0];
  const total = payload[0].payload.total || 100;
  const percentage = ((point.value / total) * 100).toFixed(1);
  return (
    <div className="rounded-lg border border-cyan-400/30 bg-slate-900/95 backdrop-blur-xl px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-cyan-300">{point.name}</p>
      <p className="text-sm font-bold text-white">{formatCurrency(point.value)}</p>
      <p className="text-xs text-slate-400 mt-1">{percentage}% of total</p>
    </div>
  );
}

export default function ExpenseByCategoryChart({ data = [] }) {
  const chartData = data.filter(item => item.value > 0);
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = chartData.map(item => ({ ...item, total }));

  return (
    <section className="rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-xl">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">📊 Expenses by Category</h3>
        <p className="text-sm text-slate-400 mt-1">Distribution of your spending</p>
      </div>
      {chartData.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/20 bg-slate-900/40 p-8 text-center">
          <p className="text-3xl mb-2">📈</p>
          <p className="text-slate-300 font-medium">No expense data yet</p>
          <p className="text-sm text-slate-500 mt-1">Add expenses to see the breakdown by category.</p>
        </div>
      ) : (
        <div className="mt-2 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithTotal}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={105}
                paddingAngle={2}
                animationDuration={600}
              >
                {dataWithTotal.map((entry, idx) => (
                  <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value, entry) => (
                  <span className="text-sm text-slate-300">
                    {entry.payload.name} ({formatCurrency(entry.payload.value)})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

