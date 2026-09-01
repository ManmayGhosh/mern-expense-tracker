import { useState, useEffect, useRef } from "react";
import { ExpensesAPI } from "../api/expenses";

const CATEGORIES = [
  "Food", "Transportation", "Housing", "Utilities", "Entertainment",
  "Health", "Shopping", "Education", "Travel", "Investment", "Income", "Other",
];

const empty = {
  amount: "", type: "expense", category: "Other", categorySource: "manual", note: "", account: "Cash",
  date: new Date().toISOString().slice(0, 10),
};

export default function ExpenseForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(initial || empty);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState(null); // { category, confidence } — last thing the AI returned
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);

  useEffect(() => {
    setForm(initial || empty);
  }, [initial]);

  useEffect(() => {
    if (!form.note || form.note.trim().length < 3 || initial) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSuggesting(true);
      try {
        const { category, confidence } = await ExpensesAPI.categorize(form.note);
        if (category) {
          setSuggestion({ category, confidence });
          // Auto-apply anything the model is even moderately sure about. With
          // ~12 categories, a bar of 0.35 is stricter than it sounds — chance
          // alone is ~0.08, so 0.2 is already a meaningful signal.
          if (confidence > 0.2) {
            setForm((f) => ({ ...f, category, categorySource: "ml" }));
          }
        } else {
          setSuggestion(null);
        }
      } catch {
        // ML service optional — fail silently, user can pick manually
        setSuggestion(null);
      } finally {
        setSuggesting(false);
      }
    }, 600);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.note]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.amount || Number(form.amount) <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (initial?._id) {
        await ExpensesAPI.update(initial._id, payload);
      } else {
        await ExpensesAPI.create(payload);
      }
      setForm(empty);
      setSuggestion(null);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save entry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-card p-5 shadow-panel">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs text-text-muted mb-1">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full bg-surface2 border border-border rounded-lg px-2.5 py-2 text-sm"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1">Amount</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full bg-surface2 border border-border rounded-lg px-2.5 py-2 text-sm num"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs text-text-muted mb-1 flex items-center gap-1.5">
            Note
            {suggesting && <span className="text-teal text-[10px] animate-pulse">categorizing…</span>}
            {!suggesting && suggestion && (
              <span className={`text-[10px] ${suggestion.confidence > 0.2 ? "text-teal" : "text-amber"}`}>
                AI: {suggestion.category} ({Math.round(suggestion.confidence * 100)}% sure)
                {suggestion.confidence <= 0.2 && " — too unsure to auto-apply"}
              </span>
            )}
          </label>
          <input
            type="text"
            placeholder="e.g. Metro card recharge"
            value={form.note}
            onChange={(e) => {
              setSuggestion(null);
              setForm({ ...form, note: e.target.value });
            }}
            className="w-full bg-surface2 border border-border rounded-lg px-2.5 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value, categorySource: "manual" })}
            className="w-full bg-surface2 border border-border rounded-lg px-2.5 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1">Date</label>
          <input
            type="date"
            value={form.date?.slice(0, 10)}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full bg-surface2 border border-border rounded-lg px-2.5 py-2 text-sm num"
          />
        </div>
      </div>

      {error && <p className="text-danger text-xs mt-3">{error}</p>}

      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-teal text-base font-medium text-sm hover:bg-teal-dim transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : initial ? "Update entry" : "Add entry"}
        </button>
        {initial && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-border text-sm text-text-muted hover:text-text"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
