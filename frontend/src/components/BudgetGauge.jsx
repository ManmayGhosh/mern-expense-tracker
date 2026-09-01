// Circular budget gauge — dashboard-cluster style with tick marks.
// pct: 0-1+ (can exceed 1 when over budget)
export default function BudgetGauge({ spent, budget, currency = "₹" }) {
  const pct = budget > 0 ? Math.min(spent / budget, 1.25) : 0;
  const overBudget = budget > 0 && spent > budget;

  const size = 220;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Gauge sweeps 270deg starting at 135deg (like a car dashboard)
  const startAngle = 135;
  const sweepAngle = 270;
  const endAngle = startAngle + sweepAngle * Math.min(pct, 1);

  const polarToCartesian = (angleDeg) => {
    const a = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const describeArc = (start, end) => {
    const s = polarToCartesian(end);
    const e = polarToCartesian(start);
    const largeArc = end - start <= 180 ? 0 : 1;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 0 ${e.x} ${e.y}`;
  };

  const ticks = Array.from({ length: 12 }, (_, i) => startAngle + (sweepAngle / 11) * i);

  const color = overBudget ? "#EF5A5A" : pct > 0.85 ? "#F5A623" : "#2DD4BF";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* track */}
        <path
          d={describeArc(startAngle, startAngle + sweepAngle)}
          fill="none"
          stroke="#243049"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* ticks */}
        {ticks.map((t, i) => {
          const inner = ((r - stroke / 2 - 6));
          const outer = ((r - stroke / 2 + 2));
          const a = ((t - 90) * Math.PI) / 180;
          const x1 = cx + inner * Math.cos(a);
          const y1 = cy + inner * Math.sin(a);
          const x2 = cx + outer * Math.cos(a);
          const y2 = cy + outer * Math.sin(a);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#324058" strokeWidth={1.5} />
          );
        })}
        {/* progress */}
        {pct > 0 && (
          <path
            d={describeArc(startAngle, endAngle)}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            style={{ transition: "stroke 300ms ease" }}
          />
        )}
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-text font-mono" fontSize="26" fontWeight="600">
          {Math.round(pct * 100)}%
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" className="fill-text-muted" fontSize="11">
          of budget used
        </text>
      </svg>
      <div className="flex gap-6 -mt-2 text-center">
        <div>
          <p className="text-xs text-text-muted">Spent</p>
          <p className="num text-sm text-text">{currency}{spent.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-text-muted">Budget</p>
          <p className="num text-sm text-text">{currency}{budget.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
