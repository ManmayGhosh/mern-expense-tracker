import { useEffect, useState } from "react";
import { ExpensesAPI } from "../api/expenses";
import ExpenseForm from "../components/ExpenseForm";
import LedgerTable from "../components/LedgerTable";

export default function Expenses() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const data = await ExpensesAPI.list({});
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this entry?")) return;
    await ExpensesAPI.remove(id);
    load();
  };

  const filtered = items.filter((e) => filter === "all" || e.type === filter);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Ledger</h1>
        <p className="text-text-muted text-sm mt-1">
          Type a note and the AI will suggest a category automatically.
        </p>
      </div>

      <div className="mb-6">
        <ExpenseForm
          initial={editing}
          onSaved={() => {
            setEditing(null);
            load();
          }}
          onCancel={() => setEditing(null)}
        />
      </div>

      <div className="flex items-center gap-2 mb-4">
        {["all", "expense", "income"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs border ${
              filter === f
                ? "bg-surface2 border-teal/40 text-teal"
                : "border-border text-text-muted hover:text-text"
            }`}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-text-muted text-sm">Loading…</p>
      ) : (
        <LedgerTable items={filtered} onEdit={setEditing} onDelete={handleDelete} />
      )}
    </div>
  );
}
