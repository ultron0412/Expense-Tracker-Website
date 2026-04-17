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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {initialData ? "Edit Transaction" : "Add Transaction"}
          </h2>
          <button onClick={onClose} className="text-slate-200 hover:text-white">
            Close
          </button>
        </div>

        {error && (
          <p className="mb-3 rounded-lg bg-rose-500/20 p-2 text-sm text-rose-100">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-brand-300"
          />

          <input
            name="amount"
            type="number"
            step="0.01"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-brand-300"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-brand-300"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-brand-300"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-brand-300"
          />

          <button
            type="submit"
            className="w-full rounded-xl bg-brand-300 px-4 py-2 font-semibold text-slate-900 transition hover:bg-brand-100"
          >
            {submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
