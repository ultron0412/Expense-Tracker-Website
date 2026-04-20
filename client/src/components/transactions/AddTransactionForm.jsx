import { useEffect, useState } from "react";

const CATEGORY_OPTIONS = [
  "Food",
  "Rent",
  "Salary",
  "Entertainment",
  "Transport",
  "Health",
  "Utilities",
  "Other",
];

const defaultForm = {
  title: "",
  amount: "",
  category: "Food",
  date: new Date().toISOString().slice(0, 10),
  type: "expense",
};

export default function AddTransactionForm({
  open,
  onClose,
  onCreate,
  submitLabel = "Save Transaction",
  initialData = null,
}) {
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm({
        title: initialData.title || "",
        amount: initialData.amount ?? "",
        category: initialData.category || "Food",
        date: initialData.date
          ? new Date(initialData.date).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        type: initialData.type || "expense",
      });
      return;
    }
    setForm(defaultForm);
  }, [initialData, open]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) return setError("Title is required.");
    if (Number(form.amount) <= 0) return setError("Amount must be greater than 0.");

    await onCreate({
      ...form,
      title: form.title.trim(),
      amount: Number(form.amount),
    });

    setForm(defaultForm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-5 rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900/95 to-slate-950/95 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-lg font-semibold text-white">
            {initialData ? '\u270f\ufe0f Edit Transaction' : '\u2795 Add Transaction'}
          </h2>
          <button 
            onClick={onClose} 
            className="rounded-lg px-3 py-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            \u2717
          </button>
        </div>

        {error && (
          <p className="mb-4 animate-in fade-in rounded-lg bg-rose-500/20 p-3 text-sm font-medium text-rose-100 border border-rose-400/30">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Transaction Title</label>
            <input
              name="title"
              placeholder="e.g., Groceries, Rent, Salary"
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/20 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:bg-slate-900/80 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-400">\ud83d\udcb5</span>
              <input
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={handleChange}
                className="w-full pl-10 rounded-lg border border-white/20 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:bg-slate-900/80 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/20 bg-slate-900/50 px-4 py-3 text-white outline-none transition focus:border-cyan-400/50 focus:bg-slate-900/80 focus:ring-2 focus:ring-cyan-400/20"
              >
                <option value="expense">\ud83d\udcc9 Expense</option>
                <option value="income">\ud83d\udcc8 Income</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/20 bg-slate-900/50 px-4 py-3 text-white outline-none transition focus:border-cyan-400/50 focus:bg-slate-900/80 focus:ring-2 focus:ring-cyan-400/20"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Date</label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/20 bg-slate-900/50 px-4 py-3 text-white outline-none transition focus:border-cyan-400/50 focus:bg-slate-900/80 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 font-semibold text-white transition hover:from-cyan-600 hover:to-blue-600 active:scale-95"
          >
            {submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
