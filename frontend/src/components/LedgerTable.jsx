import { format } from "date-fns";

export default function LedgerTable({ items, onEdit, onDelete }) {
  if (!items || items.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-border rounded-card">
        <p className="text-text-muted text-sm">No entries yet. Add your first transaction above.</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface2 text-text-muted text-xs uppercase tracking-wide">
            <th className="text-left font-medium px-4 py-3">Date</th>
            <th className="text-left font-medium px-4 py-3">Note</th>
            <th className="text-left font-medium px-4 py-3">Category</th>
            <th className="text-left font-medium px-4 py-3">Account</th>
            <th className="text-right font-medium px-4 py-3">Amount</th>
            <th className="text-right font-medium px-4 py-3 w-20"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((e) => (
            <tr key={e._id} className="border-t border-border hover:bg-surface2/40 transition-colors">
              <td className="px-4 py-3 text-text-muted num text-xs">{format(new Date(e.date), "dd MMM yyyy")}</td>
              <td className="px-4 py-3">{e.note || <span className="text-text-muted">—</span>}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface2 border border-border text-xs">
                  {e.category}
                  {e.categorySource === "ml" && <span className="text-teal text-[10px]">AI</span>}
                </span>
              </td>
              <td className="px-4 py-3 text-text-muted">{e.account}</td>
              <td className={`px-4 py-3 text-right num ${e.type === "income" ? "text-teal" : "text-text"}`}>
                {e.type === "income" ? "+" : "-"}₹{e.amount.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right">
                <button onClick={() => onEdit(e)} className="text-text-muted hover:text-teal text-xs mr-3">
                  Edit
                </button>
                <button onClick={() => onDelete(e._id)} className="text-text-muted hover:text-danger text-xs">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
