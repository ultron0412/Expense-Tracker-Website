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
      <div className="rounded-2xl border border-dashed border-slate-600 bg-slate-900/40 p-12 text-center backdrop-blur">
        <p className="text-3xl mb-3">\ud83d\udced</p>
        <p className="text-slate-200 font-medium">No transactions found</p>
        <p className="mt-1 text-sm text-slate-400">Start by adding your first transaction to see them here.</p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            \ud83d\udccb Transactions
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-slate-400 mb-2">Period</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-slate-900/50 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 hover:border-white/30"
          >
            <option value="all">\ud83d\udcc5 All Time</option>
            <option value="daily">\ud83d\udccf Daily</option>
            <option value="monthly">\ud83d\udcc6 Monthly</option>
            <option value="yearly">\ud83d\udcca Yearly</option>
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-slate-400 mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-slate-900/50 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 hover:border-white/30"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "\ud83c\udf7f All Categories" : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-slate-400 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-slate-900/50 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 hover:border-white/30"
          >
            <option value="newest">\ud83d\uddd3 Newest</option>
            <option value="oldest">\ud83d\uddd1 Oldest</option>
            <option value="highest">\ud83d\udcc8 Highest</option>
            <option value="lowest">\ud83d\udcc9 Lowest</option>
          </select>
        </div>
      </div>

      {/* Transaction Cards */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {filtered.map((t) => {
          const categoryEmojis = {
            Food: "\ud83c\udf54",
            Rent: "\ud83c\udfe0",
            Salary: "\ud83d\udcbc",
            Entertainment: "\ud83c\udfac",
            Transport: "\ud83d\ude97",
            Health: "\u2695\ufe0f",
            Utilities: "\ud83d\udca1",
            Other: "\ud83d\udce6",
          };
          return (
            <article
              key={t._id}
              className="group flex items-center justify-between rounded-lg border border-white/10 bg-gradient-to-r from-slate-900/40 to-slate-800/20 p-4 transition-all hover:border-white/20 hover:bg-gradient-to-r hover:from-slate-900/60 hover:to-slate-800/40 hover:shadow-lg hover:shadow-cyan-500/5"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  {/* Category Badge */}
                  <span className="flex-shrink-0 text-xl">
                    {categoryEmojis[t.category] || "\ud83d\udce6"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate group-hover:text-cyan-300 transition">
                      {t.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t.category} \u2022 {new Date(t.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                {/* Amount */}
                <p
                  className={`text-right font-bold text-lg ${
                    t.type === "income" ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  <span className="text-sm text-slate-400 mr-1">
                    {t.type === "income" ? "+" : "-"}
                  </span>
                  {formatCurrency(t.amount)}
                </p>

                {/* Actions */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit?.(t)}
                    className="rounded-lg bg-cyan-500/20 px-3 py-2 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/30"
                    title="Edit"
                  >
                    \u270f\ufe0f
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this transaction?")) {
                        onDelete?.(t._id);
                      }
                    }}
                    className="rounded-lg bg-rose-500/20 px-3 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-500/30"
                    title="Delete"
                  >
                    \ud83d\uddd1\ufe0f
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Scrollbar styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.5);
        }
      `}</style>
    </section>
  );
}
