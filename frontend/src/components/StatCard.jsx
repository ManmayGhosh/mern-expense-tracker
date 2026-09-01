export default function StatCard({ label, value, delta, currency = "₹", accent = "text", icon: Icon, iconColor = "teal" }) {
  const iconBg = {
    teal: "bg-teal/10 text-teal",
    amber: "bg-amber/10 text-amber",
    danger: "bg-danger/10 text-danger",
    violet: "bg-[#7C9CF5]/10 text-[#7C9CF5]",
  }[iconColor];

  const deltaPositive = delta > 0;

  return (
    <div className="bg-surface border border-border rounded-card p-5 shadow-panel">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-text-muted">{label}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <p className={`num text-2xl font-semibold text-${accent}`}>
        {currency}
        {typeof value === "number" ? value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : value}
      </p>
      {delta !== undefined && delta !== null && (
        <p className={`num text-xs mt-1.5 ${deltaPositive ? "text-teal" : "text-danger"}`}>
          {deltaPositive ? "+" : ""}
          {delta}% vs last month
        </p>
      )}
    </div>
  );
}
