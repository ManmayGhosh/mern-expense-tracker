import { useEffect, useState } from "react";
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ExpensesAPI } from "../api/expenses";
import StatCard from "../components/StatCard";
import CategoryPie from "../components/CategoryPie";
import MonthlyTrend from "../components/MonthlyTrend";
import RecentTransactions from "../components/RecentTransactions";

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [s, m, p, r] = await Promise.all([
          ExpensesAPI.summary({}),
          ExpensesAPI.monthly({}),
          ExpensesAPI.predict().catch(() => null),
          ExpensesAPI.list({}),
        ]);
        setSummary(s);
        setTrend(m);
        setPrediction(p);
        setRecent(r);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const mergedTrend = prediction?.nextMonth
    ? [...trend, { month: prediction.nextMonth.label, predicted: prediction.nextMonth.amount }]
    : trend;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-text-muted text-sm mt-1">
            Welcome back, {user?.name?.split(" ")[0]}. Here's where your money went this month.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-text-muted text-sm">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <StatCard
              label="Total Balance"
              value={summary?.totalBalance || 0}
              icon={Wallet}
              iconColor="teal"
            />
            <StatCard
              label="Total Income"
              value={summary?.totalIncome || 0}
              delta={summary?.deltas?.income}
              accent="teal"
              icon={TrendingUp}
              iconColor="teal"
            />
            <StatCard
              label="Total Expenses"
              value={summary?.totalExpense || 0}
              delta={summary?.deltas?.expense}
              icon={TrendingDown}
              iconColor="danger"
            />
            <StatCard
              label="Savings"
              value={summary?.savings || 0}
              delta={summary?.deltas?.savings}
              icon={PiggyBank}
              iconColor="amber"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-surface border border-border rounded-card p-5 shadow-panel">
                  <h3 className="text-sm font-medium mb-3">Expenses by Category</h3>
                  <CategoryPie data={summary?.byCategory || []} />
                </div>
                <div className="bg-surface border border-border rounded-card p-5 shadow-panel">
                  <h3 className="text-sm font-medium mb-3">
                    Expense Trend <span className="text-text-muted font-normal text-xs">— dashed = forecast</span>
                  </h3>
                  <MonthlyTrend data={mergedTrend} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <RecentTransactions items={recent} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
