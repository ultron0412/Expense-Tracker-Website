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

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <article className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl">
        <p className="text-sm text-slate-300">Total Balance</p>
        <p className="mt-1 text-xl font-semibold text-white">{formatCurrency(balance)}</p>
      </article>
      <article className="rounded-2xl border border-white/20 bg-emerald-500/10 p-4 backdrop-blur-xl">
        <p className="text-sm text-emerald-200">Total Income</p>
        <p className="mt-1 text-xl font-semibold text-emerald-100">{formatCurrency(income)}</p>
      </article>
      <article className="rounded-2xl border border-white/20 bg-rose-500/10 p-4 backdrop-blur-xl">
        <p className="text-sm text-rose-200">Total Expense</p>
        <p className="mt-1 text-xl font-semibold text-rose-100">{formatCurrency(expense)}</p>
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <main className="mx-auto mt-12 max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl">
      <h1 className="text-2xl font-semibold text-white">Welcome</h1>
      <p className="mt-1 text-sm text-slate-300">
        {mode === "login" ? "Log in to sync your transactions." : "Create an account to start tracking."}
      </p>

      <div className="mt-4 flex rounded-xl bg-slate-900/50 p-1">
        <button
          className={`flex-1 rounded-lg py-2 text-sm ${
            mode === "login" ? "bg-brand-300 text-slate-900" : "text-slate-300"
          }`}
          onClick={() => setMode("login")}
          type="button"
        >
          Login
        </button>
        <button
          className={`flex-1 rounded-lg py-2 text-sm ${
            mode === "signup" ? "bg-brand-300 text-slate-900" : "text-slate-300"
          }`}
          onClick={() => setMode("signup")}
          type="button"
        >
          Sign Up
        </button>
      </div>

      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        {mode === "signup" && (
          <input
            className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2 text-white"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        )}
        <input
          className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2 text-white"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        />
        <input
          className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2 text-white"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
        />
        {error && <p className="rounded-lg bg-rose-500/20 p-2 text-sm text-rose-100">{error}</p>}
        <button
          className="w-full rounded-xl bg-brand-300 px-4 py-2 font-semibold text-slate-900 transition hover:bg-brand-100 disabled:opacity-70"
          disabled={loading}
        >
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
        </button>
      </form>
    </main>
  );
}

function BudgetGoals({ budgets, onChangeBudget, expenseByCategory }) {
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
    <section className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl">
      <h2 className="text-lg font-semibold text-white">Budget Goals</h2>
      <p className="mt-1 text-sm text-slate-300">
        Set monthly category limits. Alerts appear when spending reaches 80%.
      </p>

      {alerts.length > 0 && (
        <div className="mt-3 space-y-2">
          {alerts.map((item) => (
            <div
              key={item.category}
              className={`rounded-xl border p-3 text-sm ${
                item.percentage >= 100
                  ? "border-rose-400/50 bg-rose-500/20 text-rose-100"
                  : "border-amber-400/50 bg-amber-500/20 text-amber-100"
              }`}
            >
              <strong>{item.category}</strong>: {item.percentage.toFixed(0)}% used (
              {formatCurrency(item.spent)} of {formatCurrency(item.budget)})
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.keys(budgets).map((category) => (
          <label key={category} className="rounded-xl border border-white/10 bg-slate-900/50 p-3 text-sm">
            <span className="mb-2 block text-slate-300">{category}</span>
            <input
              type="number"
              min="0"
              step="1"
              value={budgets[category]}
              onChange={(e) => onChangeBudget(category, e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-slate-950/70 px-3 py-2 text-white"
              placeholder="Set budget"
            />
          </label>
        ))}
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
