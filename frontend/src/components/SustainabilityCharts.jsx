import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

function SustainabilityCharts({ records }) {
  const data = records.map((item) => ({
    date: item.date,
    electricity: item.electricity,
    water: item.water,
    carbon: item.carbon_emission,
    score: item.sustainability_score,
  }));

  return (
    <div className="sustainability-charts">
      <div className="sustainability-chart-card">
        <h3>Electricity Usage Trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="electricity" stroke="#16a34a" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="sustainability-chart-card">
        <h3>Carbon Emission Trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="carbon" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SustainabilityCharts;