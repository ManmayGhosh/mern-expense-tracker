import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Overview", icon: "◇" },
  { to: "/expenses", label: "Ledger", icon: "≡" },
  { to: "/reports", label: "Reports", icon: "▤" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-surface h-screen sticky top-0 flex flex-col">
      <div className="px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-teal/10 border border-teal/30 flex items-center justify-center text-teal font-mono text-sm">
            ₹
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">Ledger</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-surface2 text-text border border-border"
                  : "text-text-muted hover:text-text hover:bg-surface2/60"
              }`
            }
          >
            <span className="font-mono text-teal">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-border">
        <div className="px-2 mb-3">
          <p className="text-sm text-text truncate">{user?.name}</p>
          <p className="text-xs text-text-muted truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="w-full text-left px-2 py-2 text-sm text-text-muted hover:text-danger transition-colors rounded-lg hover:bg-surface2/60"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
