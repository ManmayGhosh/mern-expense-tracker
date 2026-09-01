import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function MonthlyTrend({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-text-muted py-10 text-center">Not enough history yet.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#243049" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: "#8B97AB", fontSize: 11 }} axisLine={{ stroke: "#243049" }} tickLine={false} />
        <YAxis tick={{ fill: "#8B97AB", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#182238", border: "1px solid #243049", borderRadius: 8, fontSize: 12 }}
          formatter={(value) => [`₹${value.toLocaleString()}`, ""]}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#2DD4BF"
          strokeWidth={2}
          dot={{ r: 3, fill: "#2DD4BF" }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="predicted"
          stroke="#F5A623"
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={{ r: 3, fill: "#F5A623" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
