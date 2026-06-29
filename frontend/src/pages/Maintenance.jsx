import { useEffect, useState } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";
import "../styles/Maintenance.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Maintenance() {
  const [requests, setRequests] = useState([]);
  const totalRequests = requests.length;

const pendingRequests = requests.filter(
  (r) => r.status === "Pending"
).length;

const inProgressRequests = requests.filter(
  (r) => r.status === "In Progress"
).length;

const completedRequests = requests.filter(
  (r) => r.status === "Completed"
).length;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [form, setForm] = useState({
    title: "",
    category: "",
    priority: "",
    location: "",
    description: ""
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get("/maintenance"); // ✅ removed trailing slash
      setRequests(response.data || []);
    } catch (error) {
      console.log("FETCH ERROR:", error.response?.data || error.message);
    }
  };

  const deleteRequest = async (id) => {
    try {
      await api.delete(`/maintenance/${id}`);
      fetchRequests();
    } catch (error) {
      console.log("DELETE ERROR:", error.response?.data || error.message);
    }
  };

const updateStatus = async (id, status) => {
  try {
    await api.patch(`/maintenance/${id}/status`, {
      status: status,
    });

    fetchRequests();
  } catch (error) {
    console.log("STATUS ERROR:", error.response?.data || error.message);
  }
};

  // ✅ FIXED CREATE REQUEST
  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const payload = {
      title: form.title,
      category: form.category,
      priority: form.priority,
      location: form.location,
      description: form.description
    };

    if (editingId) {
      await api.put(`/maintenance/${editingId}`, payload);
      alert("Request updated successfully");
    } else {
      await api.post("/maintenance/", payload);
      alert("Request created successfully");
    }

    fetchRequests();

    setShowModal(false);

    setEditingId(null);

    setForm({
      title: "",
      category: "",
      priority: "",
      location: "",
      description: ""
    });

  } catch (error) {
    console.log(error);
    alert("Operation failed");
  }
};
const exportMaintenancePDF = () => {
  const doc = new jsPDF();

  doc.text("ECHO - Maintenance Requests Report", 14, 15);

  autoTable(doc, {
    startY: 25,
    head: [["Title", "Category", "Priority", "Location", "Status"]],
    body: requests.map((item) => [
      item.title,
      item.category,
      item.priority,
      item.location,
      item.status,
    ]),
  });

  doc.save("maintenance_report.pdf");
};

  return (
    <MainLayout>
    <div className="stats-container">

  <div className="stat-card">
    <h3>Total Requests</h3>
    <h2>{totalRequests}</h2>
  </div>

  <div className="stat-card">
    <h3>Pending</h3>
    <h2>{pendingRequests}</h2>
  </div>

  <div className="stat-card">
    <h3>In Progress</h3>
    <h2>{inProgressRequests}</h2>
  </div>

  <div className="stat-card">
    <h3>Completed</h3>
    <h2>{completedRequests}</h2>
  </div>

</div>
      {/* HEADER */}
      <div className="header-section">
        <h1>Maintenance Requests</h1>

        <div className="header-actions"><div className="header-actions">

  <select
    className="filter-select"
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    <option value="All">All Status</option>
    <option value="Pending">Pending</option>
    <option value="In Progress">In Progress</option>
    <option value="Completed">Completed</option>
  </select>

  <select
    className="filter-select"
    value={priorityFilter}
    onChange={(e) => setPriorityFilter(e.target.value)}
  >
    <option value="All">All Priority</option>
    <option value="High">High</option>
    <option value="Medium">Medium</option>
    <option value="Low">Low</option>
  </select>



  <button
    className="new-request-btn"
    onClick={() => {
      setEditingId(null);

      setForm({
        title: "",
        category: "",
        priority: "",
        location: "",
        description: "",
      });

      setShowModal(true);
    }}
  >
    + New Request
  </button>
  <button className="export-btn" onClick={exportMaintenancePDF}>
  Export PDF
</button>

</div>

          <input
            type="text"
            placeholder="Search requests..."
            className="search-box"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />



        </div>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table>
         <thead>
  <tr>
    <th>Sl. No</th>
    <th>Title</th>
    <th>Category</th>
    <th>Priority</th>
    <th>Location</th>
    <th>Status</th>
    <th>Actions</th>
  </tr>
</thead>

          <tbody>
            {requests
              .filter((r) => {
  const matchesSearch =
    r.title?.toLowerCase().includes(search.toLowerCase());

  const matchesStatus =
    statusFilter === "All" ||
    r.status === statusFilter;

  const matchesPriority =
    priorityFilter === "All" ||
    r.priority === priorityFilter;

  return (
    matchesSearch &&
    matchesStatus &&
    matchesPriority
  );
})
              .map((request, index) => (
                <tr key={request.id}>
                  <td>{index + 1}</td>
                  <td>{request.title}</td>
                  <td>{request.category}</td>
                  <td>
  <span
    className={`priority-badge ${request.priority.toLowerCase()}`}
  >
    {request.priority}
  </span>
</td>
                  <td>{request.location}</td>
                  <td>
  <span
    className={`status-badge ${request.status
      .toLowerCase()
      .replace(" ", "-")}`}
  >
    {request.status}
  </span>
</td>

                  <td>
                    <button
  className="edit-btn"
  onClick={() => {
    setEditingId(request.id);

    setForm({
      title: request.title,
      category: request.category,
      priority: request.priority,
      location: request.location,
      description: request.description || ""
    });

    setShowModal(true);
  }}
>
  ✏️ Edit
</button>
<button
  className="view-btn"
  onClick={() => setSelectedRequest(request)}
>
  👁 View
</button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteRequest(request.id)}
                    >
                      🗑️ Delete
                    </button>

               <select
  className="status-select"
  value={request.status}
  onChange={(e) =>
    updateStatus(request.id, e.target.value)
  }
>
  <option value="Pending">Pending</option>
  <option value="In Progress">In Progress</option>
  <option value="Completed">Completed</option>
</select>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>
  {editingId
    ? "Edit Maintenance Request"
    : "New Maintenance Request"}
</h2>

            <form onSubmit={handleSubmit}>
              <input
                placeholder="Title"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                required
              />

              <input
                placeholder="Category"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                required
              />

              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value })
                }
                required
              >
                <option value="">Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

             
              <input
  placeholder="Location"
  value={form.location}
  onChange={(e) =>
    setForm({ ...form, location: e.target.value })
  }
  required
/>

<textarea
  placeholder="Description"
  value={form.description}
  onChange={(e) =>
    setForm({
      ...form,
      description: e.target.value,
    })
  }
  rows={4}
  required
/>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>

               <button type="submit">
  {editingId ? "Update" : "Create"}
</button>
              </div>
            </form>
          </div>
        </div>
      )}
 
    {selectedRequest && (
  <div className="modal-overlay">
    <div className="modal view-modal">

      <h2>Maintenance Request Details</h2>

      <div className="details-grid">

        <div>
          <strong>Title</strong>
          <p>{selectedRequest.title}</p>
        </div>

        <div>
          <strong>Category</strong>
          <p>{selectedRequest.category}</p>
        </div>

        <div>
          <strong>Priority</strong>
          <p>{selectedRequest.priority}</p>
        </div>

        <div>
          <strong>Location</strong>
          <p>{selectedRequest.location}</p>
        </div>

        <div className="full-width">
          <strong>Description</strong>
          <p>{selectedRequest.description}</p>
        </div>

        <div>
          <strong>Status</strong>
          <p>{selectedRequest.status}</p>
        </div>

      </div>

      <div className="modal-actions">
        <button
          type="button"
          onClick={() => setSelectedRequest(null)}
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}
    </MainLayout>
  );
}


export default Maintenance;