import { useEffect, useState } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";
import ReportsCharts from "../components/ReportsCharts";
import "../styles/Reports.css";

function Reports() {
  const [maintenance, setMaintenance] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      const maintenanceRes = await api.get("/maintenance/");
      const inventoryRes = await api.get("/inventory/");
      const notificationsRes = await api.get("/notifications/");

      setMaintenance(maintenanceRes.data || []);
      setInventory(inventoryRes.data || []);
      setNotifications(notificationsRes.data || []);
    } catch (error) {
      console.log("REPORTS ERROR:", error.response?.data || error.message);
    }
  };

  const totalMaintenance = maintenance.length;
  const pending = maintenance.filter((m) => m.status === "Pending").length;
  const completed = maintenance.filter((m) => m.status === "Completed").length;

  const totalInventory = inventory.length;
  const lowStock = inventory.filter(
    (item) => item.quantity > 0 && item.quantity <= 5
  ).length;
  const outOfStock = inventory.filter((item) => item.quantity === 0).length;

  return (
    <MainLayout>
      <div className="reports-page">
        <h1>Reports & Analytics</h1>

        <div className="reports-cards">
          <div className="report-card">
            <h3>Total Maintenance</h3>
            <h2>{totalMaintenance}</h2>
          </div>

          <div className="report-card">
            <h3>Pending Requests</h3>
            <h2>{pending}</h2>
          </div>

          <div className="report-card">
            <h3>Completed Requests</h3>
            <h2>{completed}</h2>
          </div>

          <div className="report-card">
            <h3>Total Inventory</h3>
            <h2>{totalInventory}</h2>
          </div>

          <div className="report-card">
            <h3>Low Stock</h3>
            <h2>{lowStock}</h2>
          </div>

          <div className="report-card">
            <h3>Out of Stock</h3>
            <h2>{outOfStock}</h2>
          </div>
        </div>

        <ReportsCharts
          pending={pending}
          completed={completed}
          lowStock={lowStock}
          outOfStock={outOfStock}
        />

        <div className="reports-section">
          <h2>Latest Notifications</h2>

          {notifications.length === 0 ? (
            <div className="report-notification">
              <h4>No notifications yet</h4>
              <p>System alerts will appear here.</p>
            </div>
          ) : (
            notifications.slice(0, 5).map((note) => (
              <div className="report-notification" key={note.id}>
                <h4>{note.title}</h4>
                <p>{note.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default Reports;