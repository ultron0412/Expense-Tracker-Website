import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ExpenseByCategoryChart from "../components/charts/ExpenseByCategoryChart";
import SpendingTrendChart from "../components/charts/SpendingTrendChart";
import AddTransactionForm from "../components/transactions/AddTransactionForm";
import TransactionList from "../components/transactions/TransactionList";
import { formatCurrency } from "../utils/currency";
import { loginRequest, signupRequest } from "../features/auth/authApi";
import { logout, setCredentials } from "../features/auth/authSlice";
import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
} from "../features/transactions/transactionApi";

const BUDGET_STORAGE_KEY = "category_budget_goals_v1";
const DEFAULT_BUDGETS = {
  Food: 0,
  Rent: 0,
  Salary: 0,
  Entertainment: 0,
  Transport: 0,
  Health: 0,
  Utilities: 0,
  Other: 0,
};

function toLocalDateKey(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getInitialBudgets() {
  try {
    const raw = localStorage.getItem(BUDGET_STORAGE_KEY);
    if (!raw) return DEFAULT_BUDGETS;
    return { ...DEFAULT_BUDGETS, ...JSON.parse(raw) };
  } catch (_error) {
    return DEFAULT_BUDGETS;
  }
}

function SummaryCards({ income, expense }) {
  const balance = income - expense;
  const isNegativeBalance = balance < 0;

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <article className={`group rounded-2xl border transition-all duration-300 backdrop-blur-xl p-5 ${
        isNegativeBalance
          ? 'border-amber-400/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/10'
          : 'border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10'
      }`}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-300">Total Balance</p>
          <span className="text-2xl">💰</span>
        </div>
        <p className={`mt-2 text-2xl font-bold transition-colors ${
          isNegativeBalance ? 'text-amber-100' : 'text-cyan-100'
        }`}>
          {formatCurrency(balance)}
        </p>
        <p className="mt-1 text-xs text-slate-400">{isNegativeBalance ? 'Overspent' : 'Available'}</p>
      </article>

      <article className="group rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-green-500/5 backdrop-blur-xl p-5 transition-all duration-300 hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/10">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-300">Total Income</p>
          <span className="text-2xl">📈</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-emerald-100">{formatCurrency(income)}</p>
        <p className="mt-1 text-xs text-slate-400">Money in</p>
      </article>

      <article className="group rounded-2xl border border-rose-400/30 bg-gradient-to-br from-rose-500/10 to-red-500/5 backdrop-blur-xl p-5 transition-all duration-300 hover:border-rose-400/50 hover:shadow-lg hover:shadow-rose-500/10">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-300">Total Expense</p>
          <span className="text-2xl">📉</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-rose-100">{formatCurrency(expense)}</p>
        <p className="mt-1 text-xs text-slate-400">Money out</p>
      </article>
    </section>
  );
}

function AuthGate() {
  const dispatch = useDispatch();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (mode === "signup" && !form.name.trim()) errors.name = "Name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    if (!form.password) errors.password = "Password is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setError("");
    setLoading(true);

    try {
      const payload = {
        email: form.email.trim(),
        password: form.password,
      };
      const data =
        mode === "signup"
          ? await signupRequest({ ...payload, name: form.name.trim() })
          : await loginRequest(payload);

      dispatch(setCredentials({ token: data.token, user: data.user }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto mt-8 min-h-screen w-full max-w-md px-4 flex flex-col justify-center">
      <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💰</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
            Expense Tracker
          </h1>
          <p className="mt-2 text-slate-400">
            {mode === "login" ? "Welcome back! Log in to your account." : "Get started tracking your expenses."}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="mb-6 flex gap-2 rounded-xl bg-slate-900/50 p-1 border border-white/10">
          <button
            className={`flex-1 rounded-lg py-2 px-4 text-sm font-medium transition-all ${
              mode === "login"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setMode("login")}
            type="button"
          >
            🔐 Login
          </button>
          <button
            className={`flex-1 rounded-lg py-2 px-4 text-sm font-medium transition-all ${
              mode === "signup"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setMode("signup")}
            type="button"
          >
            ✨ Sign Up
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 animate-in fade-in rounded-lg border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
            <p className="font-medium">⚠️ {error}</p>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Full Name</label>
              <input
                className={`w-full rounded-lg border transition-all px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/20 ${
                  formErrors.name
                    ? "border-rose-400/50 bg-rose-500/5 focus:border-rose-400"
                    : "border-white/20 bg-slate-900/50 focus:border-cyan-400/50 focus:bg-slate-900/80"
                }`}
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              {formErrors.name && <p className="mt-1 text-xs text-rose-400">{formErrors.name}</p>}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Email Address</label>
            <input
              className={`w-full rounded-lg border transition-all px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/20 ${
                formErrors.email
                  ? "border-rose-400/50 bg-rose-500/5 focus:border-rose-400"
                  : "border-white/20 bg-slate-900/50 focus:border-cyan-400/50 focus:bg-slate-900/80"
              }`}
              placeholder="your@email.com"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            {formErrors.email && <p className="mt-1 text-xs text-rose-400">{formErrors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Password</label>
            <input
              className={`w-full rounded-lg border transition-all px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/20 ${
                formErrors.password
                  ? "border-rose-400/50 bg-rose-500/5 focus:border-rose-400"
                  : "border-white/20 bg-slate-900/50 focus:border-cyan-400/50 focus:bg-slate-900/80"
              }`}
              placeholder="••••••••"
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />
            {formErrors.password && <p className="mt-1 text-xs text-rose-400">{formErrors.password}</p>}
          </div>

          <button
            className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 font-semibold text-white transition-all hover:from-cyan-600 hover:to-blue-600 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin">⏳</span>
                {mode === "login" ? "Logging in..." : "Creating account..."}
              </span>
            ) : mode === "login" ? (
              "🔐 Login"
            ) : (
              "✨ Create Account"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500">
          {mode === "login"
            ? "Don't have an account? Click Sign Up →"
            : "Already have an account? Click Login →"}
        </p>
      </div>
    </main>
  );
}

function BudgetGoals({ budgets, onChangeBudget, expenseByCategory }) {
  const categoryEmojis = {
    Food: "🍔",
    Rent: "🏠",
    Salary: "💼",
    Entertainment: "🎬",
    Transport: "🚗",
    Health: "⚕️",
    Utilities: "💡",
    Other: "📦",
  };

  const statuses = useMemo(
    () =>
      Object.entries(budgets)
        .filter(([, budget]) => Number(budget) > 0)
        .map(([category, budget]) => {
          const spent = expenseByCategory[category] || 0;
          const percentage = (spent / Number(budget)) * 100;
          return {
            category,
            budget: Number(budget),
            spent,
            percentage,
          };
        })
        .sort((a, b) => b.percentage - a.percentage),
    [budgets, expenseByCategory]
  );

  const alerts = statuses.filter((item) => item.percentage >= 80);

  return (
    <section className="rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            📊 Budget Goals
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Set monthly limits. Alerts trigger at 80% spending.
          </p>
        </div>
      </div>

      {/* Alert Badges */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          <h3 className="text-xs font-semibold uppercase text-slate-400">⚠️ Budget Alerts</h3>
          {alerts.map((item) => (
            <div
              key={item.category}
              className={`flex items-center justify-between rounded-lg border p-3 text-sm transition-all ${
                item.percentage >= 100
                  ? "border-rose-400/50 bg-rose-500/15 text-rose-100"
                  : "border-amber-400/50 bg-amber-500/15 text-amber-100"
              }`}
            >
              <div>
                <strong>{categoryEmojis[item.category]} {item.category}</strong>
                <p className="text-xs opacity-90">
                  {item.percentage.toFixed(0)}% used ({formatCurrency(item.spent)} / {formatCurrency(item.budget)})
                </p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold ${item.percentage >= 100 ? "text-rose-100" : "text-amber-100"}`}>
                  {item.percentage >= 100 ? "🔴" : "🟡"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Budget Input Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase text-slate-400 mb-3">Set Budget Limits</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(budgets).map(([category, value]) => (
            <label
              key={category}
              className="group relative rounded-lg border border-white/10 bg-slate-900/40 p-3 transition-all hover:border-white/20 hover:bg-slate-900/60 cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{categoryEmojis[category]}</span>
                <span className="text-xs font-medium text-slate-300">{category}</span>
              </div>
              <div className="relative">
                <span className="absolute left-2 top-2.5 text-slate-500 text-xs">💵</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={value}
                  onChange={(e) => onChangeBudget(category, e.target.value)}
                  className="w-full pl-6 rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-white placeholder-slate-600 text-sm outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                  placeholder="Set limit"
                />
              </div>
              {value > 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  Limit set to {formatCurrency(value)}
                </p>
              )}
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [budgets, setBudgets] = useState(getInitialBudgets);

  useEffect(() => {
    localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    if (!token) return;
    let ignore = false;

    async function loadTransactions() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchTransactions(token);
        if (!ignore) {
          setTransactions(data.transactions || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadTransactions();
    return () => {
      ignore = true;
    };
  }, [token]);

  const income = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "income")
        .reduce((sum, item) => sum + item.amount, 0),
    [transactions]
  );

  const expense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0),
    [transactions]
  );

  const expenseByCategory = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount;
        return acc;
      }, {});
  }, [transactions]);

  const expenseCategoryChartData = useMemo(
    () =>
      Object.entries(expenseByCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
    [expenseByCategory]
  );

  const spendingTrendData = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 29);

    const dailyTotals = new Map();
    for (let i = 0; i < 30; i += 1) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      dailyTotals.set(toLocalDateKey(day), 0);
    }

    transactions.forEach((item) => {
      if (item.type !== "expense") return;
      const date = new Date(item.date);
      if (Number.isNaN(date.getTime())) return;
      date.setHours(0, 0, 0, 0);
      if (date < start || date > today) return;
      const key = toLocalDateKey(date);
      if (!dailyTotals.has(key)) return;
      dailyTotals.set(key, dailyTotals.get(key) + Number(item.amount || 0));
    });

    return Array.from(dailyTotals.entries()).map(([dateKey, amount]) => {
      const date = new Date(`${dateKey}T00:00:00`);
      return {
        dateKey,
        label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        amount: Number(amount.toFixed(2)),
      };
    });
  }, [transactions]);

  const handleCreate = async (payload) => {
    if (!token) return;
    const data = await createTransaction(token, payload);
    setTransactions((prev) => [data.transaction, ...prev]);
  };

  const handleUpdate = async (payload) => {
    if (!token || !editingTransaction) return;
    const data = await updateTransaction(token, editingTransaction._id, payload);
    setTransactions((prev) =>
      prev.map((item) => (item._id === data.transaction._id ? data.transaction : item))
    );
    setEditingTransaction(null);
  };

  const handleDelete = async (id) => {
    if (!token) return;
    await deleteTransaction(token, id);
    setTransactions((prev) => prev.filter((item) => item._id !== id));
  };

  const handleChangeBudget = (category, value) => {
    setBudgets((prev) => ({
      ...prev,
      [category]: value === "" ? 0 : Number(value),
    }));
  };

  if (!token) {
    return <AuthGate />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl">
        <div>
          <h1 className="text-xl font-semibold text-white">Personal Expense Tracker</h1>
          <p className="text-sm text-slate-300">
            Track, analyze, and stay in control{user?.name ? `, ${user.name}` : ""}.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingTransaction(null);
              setOpenAddModal(true);
            }}
            className="rounded-xl bg-brand-300 px-4 py-2 font-medium text-slate-900 hover:bg-brand-100"
          >
            Add Transaction
          </button>
          <button
            onClick={() => dispatch(logout())}
            className="rounded-xl border border-white/30 px-4 py-2 text-slate-200 hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </header>

      <SummaryCards income={income} expense={expense} />

      <div className="mt-4 space-y-4">
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ExpenseByCategoryChart data={expenseCategoryChartData} />
          <SpendingTrendChart data={spendingTrendData} />
        </section>

        <BudgetGoals
          budgets={budgets}
          onChangeBudget={handleChangeBudget}
          expenseByCategory={expenseByCategory}
        />

        {error && <p className="rounded-lg bg-rose-500/20 p-3 text-sm text-rose-100">{error}</p>}
        {loading ? (
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 text-sm text-slate-200 backdrop-blur-xl">
            Loading transactions...
          </div>
        ) : (
          <TransactionList
            transactions={transactions}
            onEdit={(item) => {
              setEditingTransaction(item);
              setOpenAddModal(true);
            }}
            onDelete={handleDelete}
          />
        )}
      </div>

      <AddTransactionForm
        open={openAddModal}
        onClose={() => {
          setOpenAddModal(false);
          setEditingTransaction(null);
        }}
        onCreate={editingTransaction ? handleUpdate : handleCreate}
        initialData={editingTransaction}
        submitLabel={editingTransaction ? "Update Transaction" : "Save Transaction"}
      />
    </div>
  );
}
