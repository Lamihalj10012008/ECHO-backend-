import { useEffect, useState } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";
import DashboardCharts from "../components/DashboardCharts";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/maintenance");
      setRequests(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // Statistics
  const total = requests.length;
  const pending = requests.filter(
    (r) => r.status === "Pending"
  ).length;

  const progress = requests.filter(
    (r) => r.status === "In Progress"
  ).length;

  const completed = requests.filter(
    (r) => r.status === "Completed"
  ).length;

  const recentRequests = [...requests].slice(0, 5);

  return (
    <MainLayout>
      <div className="dashboard-page">

        <h1>Dashboard</h1>

        <p className="dashboard-subtitle">
          Welcome to the ECHO Facilities & Logistics Dashboard
        </p>

        {/* Statistics Cards */}

        <div className="dashboard-cards">

          <div className="dashboard-card">
            <h3>Total Requests</h3>
            <h2>{total}</h2>
          </div>

          <div className="dashboard-card">
            <h3>Pending</h3>
            <h2>{pending}</h2>
          </div>

          <div className="dashboard-card">
            <h3>In Progress</h3>
            <h2>{progress}</h2>
          </div>

          <div className="dashboard-card">
            <h3>Completed</h3>
            <h2>{completed}</h2>
          </div>

        </div>

        {/* Charts */}

        <DashboardCharts
          pending={pending}
          progress={progress}
          completed={completed}
        />

        {/* Quick Actions */}

        <div className="quick-actions">

          <div className="action-card">
            <div className="action-icon">🛠️</div>

            <h3>Create Request</h3>

            <p>Add a new maintenance request.</p>

            <button onClick={() => navigate("/maintenance")}>
              New Request
            </button>
          </div>

          <div className="action-card">
            <div className="action-icon">📦</div>

            <h3>Inventory</h3>

            <p>Manage inventory items.</p>

            <button onClick={() => navigate("/inventory")}>
              View Inventory
            </button>
          </div>

          <div className="action-card">
            <div className="action-icon">📊</div>

            <h3>Reports</h3>

            <p>View maintenance statistics.</p>

            <button onClick={() => navigate("/reports")}>
              Open Reports
            </button>
          </div>

        </div>

        {/* Recent Requests */}

        <div className="recent-section">

          <h2>Recent Maintenance Requests</h2>

          <table className="dashboard-table">

            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {recentRequests.map((item) => (

                <tr key={item.id}>

                  <td>{item.title}</td>

                  <td>{item.category}</td>

                  <td>
                    <span
                      className={`priority-badge ${item.priority.toLowerCase()}`}
                    >
                      {item.priority}
                    </span>
                  </td>

                  <td>{item.location}</td>

                  <td>
                    <span
                      className={`status-badge ${item.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {item.status}
                    </span>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>
    </MainLayout>
  );
}

export default Dashboard;