import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

function DashboardCharts({ pending, progress, completed }) {
  const chartData = [
    { name: "Pending", value: pending },
    { name: "In Progress", value: progress },
    { name: "Completed", value: completed },
  ];

  const colors = ["#f59e0b", "#3b82f6", "#22c55e"];

  return (
    <div className="charts-container">
      <div className="chart-card">
        <h3>Requests by Status</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>Status Distribution</h3>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DashboardCharts;