import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#2DD4BF", "#F5A623", "#7C9CF5", "#EF5A5A", "#C084FC", "#4ADE80", "#FB923C", "#38BDF8", "#F472B6", "#94A3B8"];

export default function CategoryPie({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-text-muted py-10 text-center">No expenses yet this period.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="category"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
          stroke="#0B1220"
          strokeWidth={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "#182238", border: "1px solid #243049", borderRadius: 8, fontSize: 12 }}
          formatter={(value) => [`₹${value.toLocaleString()}`, ""]}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#8B97AB" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
