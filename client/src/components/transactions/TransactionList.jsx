import { useMemo, useState } from "react";
import { formatCurrency } from "../../utils/currency";

const isWithinPeriod = (dateValue, period) => {
  if (period === "all") return true;
  const date = new Date(dateValue);
  const now = new Date();

  if (period === "daily") return date.toDateString() === now.toDateString();
  if (period === "monthly") {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  if (period === "yearly") return date.getFullYear() === now.getFullYear();

  return true;
};

export default function TransactionList({ transactions = [], onEdit, onDelete }) {
  const [period, setPeriod] = useState("all");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const categories = useMemo(
    () => ["all", ...new Set(transactions.map((t) => t.category))],
    [transactions]
  );

  const filtered = useMemo(() => {
    let result = transactions.filter(
      (t) =>
        isWithinPeriod(t.date, period) && (category === "all" || t.category === category)
    );

    result = result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.date) - new Date(a.date);
      if (sortBy === "oldest") return new Date(a.date) - new Date(b.date);
      if (sortBy === "highest") return b.amount - a.amount;
      if (sortBy === "lowest") return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [transactions, category, period, sortBy]);

  if (!filtered.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/30 bg-white/5 p-8 text-center backdrop-blur">
        <p className="text-slate-200">No transactions found for current filters.</p>
        <p className="mt-1 text-sm text-slate-400">Start by adding your first transaction.</p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-xl">
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-white/20 bg-slate-900/60 px-3 py-2 text-sm text-white"
        >
          <option value="all">All Time</option>
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-white/20 bg-slate-900/60 px-3 py-2 text-sm text-white"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "all" ? "All Categories" : cat}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-white/20 bg-slate-900/60 px-3 py-2 text-sm text-white"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="highest">Highest Amount</option>
          <option value="lowest">Lowest Amount</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map((t) => (
          <article
            key={t._id}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/50 p-3"
          >
            <div>
              <p className="font-medium text-white">{t.title}</p>
              <p className="text-xs text-slate-400">
                {t.category} - {new Date(t.date).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <p className={t.type === "income" ? "text-emerald-300" : "text-rose-300"}>
                {t.type === "income" ? "+" : "-"} {formatCurrency(t.amount)}
              </p>
              <button onClick={() => onEdit?.(t)} className="text-xs text-slate-200 hover:text-white">
                Edit
              </button>
              <button
                onClick={() => onDelete?.(t._id)}
                className="text-xs text-rose-200 hover:text-rose-100"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
