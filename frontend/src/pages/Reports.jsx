import { useEffect, useState } from "react";
import { ExpensesAPI } from "../api/expenses";

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        setSummary(await ExpensesAPI.summary({}));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await ExpensesAPI.exportCsv();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `ledger-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setExporting(false);
    }
  };

  const total = summary?.byCategory?.reduce((s, c) => s + c.total, 0) || 0;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-text-muted text-sm mt-1">Category breakdown for the current month.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2 rounded-lg border border-border text-sm hover:border-teal/40 hover:text-teal transition-colors disabled:opacity-50"
        >
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </div>

      {loading ? (
        <p className="text-text-muted text-sm">Loading…</p>
      ) : (
        <div className="border border-border rounded-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface2 text-text-muted text-xs uppercase tracking-wide">
                <th className="text-left font-medium px-4 py-3">Category</th>
                <th className="text-right font-medium px-4 py-3">Amount</th>
                <th className="text-right font-medium px-4 py-3">Share</th>
              </tr>
            </thead>
            <tbody>
              {(summary?.byCategory || []).map((c) => (
                <tr key={c.category} className="border-t border-border">
                  <td className="px-4 py-3">{c.category}</td>
                  <td className="px-4 py-3 text-right num">₹{c.total.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right num text-text-muted">
                    {total ? ((c.total / total) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
