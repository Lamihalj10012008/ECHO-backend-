import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";
import SustainabilityCharts from "../components/SustainabilityCharts";
import "../styles/Sustainability.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Sustainability() {
  const [records, setRecords] = useState([]);

  const [form, setForm] = useState({
    date: "",
    department: "",
    electricity: "",
    water: "",
    waste: "",
    fuel: "",
    remarks: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/sustainability/");
      setRecords(res.data || []);
    } catch (err) {
      console.log("SUSTAINABILITY FETCH ERROR:", err);
    }
  };

  const addRecord = async (e) => {
    e.preventDefault();

    try {
      await api.post("/sustainability/", {
        date: form.date,
        department: form.department,
        electricity: Number(form.electricity),
        water: Number(form.water),
        waste: Number(form.waste),
        fuel: Number(form.fuel),
        remarks: form.remarks,
      });

      alert("Sustainability record added successfully");

      setForm({
        date: "",
        department: "",
        electricity: "",
        water: "",
        waste: "",
        fuel: "",
        remarks: "",
      });

      fetchData();
    } catch (err) {
      console.log("SUSTAINABILITY SAVE ERROR:", err.response?.data || err.message);
      alert("Unable to save record");
    }
  };

  const totalElectricity = records.reduce(
    (sum, item) => sum + Number(item.electricity || 0),
    0
  );

  const totalWater = records.reduce(
    (sum, item) => sum + Number(item.water || 0),
    0
  );

  const totalCarbon = records.reduce(
    (sum, item) => sum + Number(item.carbon_emission || 0),
    0
  );

  const averageScore =
    records.length > 0
      ? (
          records.reduce(
            (sum, item) => sum + Number(item.sustainability_score || 0),
            0
          ) / records.length
        ).toFixed(1)
      : 0;
      const exportPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("ECHO - Sustainability Report", 14, 18);

  doc.setFontSize(10);
  doc.text(
    `Generated on: ${new Date().toLocaleString()}`,
    14,
    26
  );

  autoTable(doc, {
    startY: 35,
    head: [[
      "Date",
      "Department",
      "Electricity",
      "Water",
      "Waste",
      "Fuel",
      "Carbon",
      "Score"
    ]],
    body: records.map((item) => [
      item.date,
      item.department,
      item.electricity,
      item.water,
      item.waste,
      item.fuel,
      item.carbon_emission,
      item.sustainability_score + "%",
    ]),
  });

  doc.save("Sustainability_Report.pdf");
};

  return (
    <MainLayout>
      <div className="sustainability-page">
        <h1>🌱 Carbon & Sustainability Agent</h1>

        <form className="sustainability-form" onSubmit={addRecord}>
          <h2>Add Sustainability Record</h2>

          <div className="form-grid">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />

            <input
              type="text"
              placeholder="Department / Block"
              value={form.department}
              onChange={(e) =>
                setForm({ ...form, department: e.target.value })
              }
              required
            />

            <input
              type="number"
              placeholder="Electricity (kWh)"
              value={form.electricity}
              onChange={(e) =>
                setForm({ ...form, electricity: e.target.value })
              }
              required
            />

            <input
              type="number"
              placeholder="Water (Litres)"
              value={form.water}
              onChange={(e) => setForm({ ...form, water: e.target.value })}
              required
            />

            <input
              type="number"
              placeholder="Waste (Kg)"
              value={form.waste}
              onChange={(e) => setForm({ ...form, waste: e.target.value })}
              required
            />

            <input
              type="number"
              placeholder="Fuel (Litres)"
              value={form.fuel}
              onChange={(e) => setForm({ ...form, fuel: e.target.value })}
              required
            />
          </div>

          <textarea
            placeholder="Remarks / Notes"
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          />

          <button type="submit">Save Record</button>
        </form>
<button
  type="button"
  className="export-btn"
  onClick={exportPDF}
>
  📄 Export PDF
</button>
        <div className="sustainability-cards">
          <div className="sustainability-card">
            <h3>Total Electricity</h3>
            <h2>{totalElectricity} kWh</h2>
          </div>

          <div className="sustainability-card">
            <h3>Total Water</h3>
            <h2>{totalWater} L</h2>
          </div>

          <div className="sustainability-card">
            <h3>Carbon Emission</h3>
            <h2>{totalCarbon.toFixed(2)} kg CO₂</h2>
          </div>

          <div className="sustainability-card">
            <h3>Sustainability Score</h3>
            <h2>{averageScore}%</h2>
          </div>
        </div>

        <SustainabilityCharts records={records} />

        <div className="ai-insights">
          <h2>🤖 AI Sustainability Advisor</h2>

          <div className="insight success">
            🌱 Electricity usage is being monitored for efficiency.
          </div>

          <div className="insight warning">
            ⚠️ If water consumption increases, check for leakage or wastage.
          </div>

          <div className="insight info">
            ♻️ Improve recycling practices to reduce campus waste.
          </div>

          <div className="insight success">
            ✅ Higher sustainability scores indicate better green performance.
          </div>
        </div>

        <div className="green-goals">
          <h2>🌍 Green Campus Goals</h2>

          <div className="goal">
            <div className="goal-header">
              <span>Electricity Saving</span>
              <span>82%</span>
            </div>
            <div className="progress-bar">
              <div className="progress electricity"></div>
            </div>
          </div>

          <div className="goal">
            <div className="goal-header">
              <span>Water Conservation</span>
              <span>74%</span>
            </div>
            <div className="progress-bar">
              <div className="progress water"></div>
            </div>
          </div>

          <div className="goal">
            <div className="goal-header">
              <span>Carbon Reduction</span>
              <span>90%</span>
            </div>
            <div className="progress-bar">
              <div className="progress carbon"></div>
            </div>
          </div>

          <div className="goal">
            <div className="goal-header">
              <span>Waste Recycling</span>
              <span>65%</span>
            </div>
            <div className="progress-bar">
              <div className="progress waste"></div>
            </div>
          </div>
        </div>

        <div className="sustainability-table">
          <h2>Recent Sustainability Records</h2>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Department</th>
                <th>Electricity</th>
                <th>Water</th>
                <th>Waste</th>
                <th>Fuel</th>
                <th>Carbon</th>
                <th>Score</th>
              </tr>
            </thead>

            <tbody>
              {records.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{item.department}</td>
                  <td>{item.electricity}</td>
                  <td>{item.water}</td>
                  <td>{item.waste}</td>
                  <td>{item.fuel}</td>
                  <td>{item.carbon_emission}</td>
                  <td>{item.sustainability_score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}

export default Sustainability;