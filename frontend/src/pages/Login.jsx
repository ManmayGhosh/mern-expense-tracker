import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-md bg-teal/10 border border-teal/30 flex items-center justify-center text-teal font-mono">₹</div>
          <span className="font-display font-semibold text-xl">Ledger</span>
        </div>

        <div className="bg-surface border border-border rounded-card p-6 shadow-panel">
          <h1 className="font-display text-lg font-semibold mb-1">Welcome back</h1>
          <p className="text-text-muted text-sm mb-6">Sign in to your ledger</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-text-muted mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-danger text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-teal text-base font-medium text-sm hover:bg-teal-dim transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-text-muted mt-5">
          No account?{" "}
          <Link to="/register" className="text-teal hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
