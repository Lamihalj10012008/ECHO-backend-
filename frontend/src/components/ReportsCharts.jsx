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

function ReportsCharts({ pending, completed, lowStock, outOfStock }) {
  const maintenanceData = [
    { name: "Pending", value: pending },
    { name: "Completed", value: completed },
  ];

  const inventoryData = [
    { name: "Low Stock", value: lowStock },
    { name: "Out of Stock", value: outOfStock },
  ];

  const colors = ["#f59e0b", "#22c55e", "#ef4444"];

  return (
    <div className="reports-charts">
      <div className="report-chart-card">
        <h3>Maintenance Summary</h3>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={maintenanceData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value">
              {maintenanceData.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="report-chart-card">
        <h3>Inventory Stock Alerts</h3>

        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={inventoryData}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
              label
            >
              {inventoryData.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index + 1]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ReportsCharts;