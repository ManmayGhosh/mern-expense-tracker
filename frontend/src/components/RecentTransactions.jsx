import { format } from "date-fns";
import {
  ShoppingBag, Coffee, Wallet, Zap, Car, Home, Film, HeartPulse,
  GraduationCap, Plane, TrendingUp, Receipt,
} from "lucide-react";

const CATEGORY_ICON = {
  Food: Coffee,
  Transportation: Car,
  Housing: Home,
  Utilities: Zap,
  Entertainment: Film,
  Health: HeartPulse,
  Shopping: ShoppingBag,
  Education: GraduationCap,
  Travel: Plane,
  Investment: TrendingUp,
  Income: Wallet,
  Other: Receipt,
};

const CATEGORY_COLOR = {
  Food: "bg-amber/10 text-amber",
  Transportation: "bg-[#38BDF8]/10 text-[#38BDF8]",
  Housing: "bg-[#C084FC]/10 text-[#C084FC]",
  Utilities: "bg-[#F472B6]/10 text-[#F472B6]",
  Entertainment: "bg-[#7C9CF5]/10 text-[#7C9CF5]",
  Health: "bg-danger/10 text-danger",
  Shopping: "bg-teal/10 text-teal",
  Education: "bg-[#4ADE80]/10 text-[#4ADE80]",
  Travel: "bg-[#FB923C]/10 text-[#FB923C]",
  Investment: "bg-teal/10 text-teal",
  Income: "bg-teal/10 text-teal",
  Other: "bg-text-muted/10 text-text-muted",
};

export default function RecentTransactions({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-card p-5 shadow-panel h-full">
        <h3 className="text-sm font-medium mb-4">Recent Transactions</h3>
        <p className="text-text-muted text-sm text-center py-8">No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-card p-5 shadow-panel h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Recent Transactions</h3>
        <span className="text-xs text-teal">{items.length}</span>
      </div>
      <div className="space-y-1">
        {items.slice(0, 6).map((e) => {
          const Icon = CATEGORY_ICON[e.category] || Receipt;
          const colorClass = CATEGORY_COLOR[e.category] || CATEGORY_COLOR.Other;
          return (
            <div key={e._id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate">{e.note || e.category}</p>
                <p className="text-xs text-text-muted num">{format(new Date(e.date), "MMM d, yyyy")}</p>
              </div>
              <p className={`num text-sm shrink-0 ${e.type === "income" ? "text-teal" : "text-text"}`}>
                {e.type === "income" ? "+" : "-"}₹{e.amount.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
