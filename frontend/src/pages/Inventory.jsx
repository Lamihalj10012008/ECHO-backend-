import { useEffect, useState } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";
import "../styles/Inventory.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Inventory() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    item_name: "",
    category: "",
    quantity: "",
    unit: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get("/inventory/");
      setItems(res.data || []);
    } catch (error) {
      console.log("INVENTORY FETCH ERROR:", error.response?.data || error.message);
    }
  };

  const getStockStatus = (quantity) => {
    if (Number(quantity) === 0) return "Out of Stock";
    if (Number(quantity) <= 5) return "Low Stock";
    return "In Stock";
  };

  const totalItems = items.length;
  const lowStock = items.filter(
    (item) => item.quantity > 0 && item.quantity <= 5
  ).length;
  const outOfStock = items.filter((item) => item.quantity === 0).length;

  const categories = ["All", ...new Set(items.map((item) => item.category))];

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.item_name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;

    const status = getStockStatus(item.quantity);

    const matchesStock =
      stockFilter === "All" || status === stockFilter;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      item_name: "",
      category: "",
      quantity: "",
      unit: "",
      location: "",
      description: "",
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setForm({
      item_name: item.item_name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      location: item.location,
      description: item.description || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      item_name: form.item_name,
      category: form.category,
      quantity: Number(form.quantity),
      unit: form.unit,
      location: form.location,
      description: form.description,
    };

    try {
      if (editingId) {
        await api.put(`/inventory/${editingId}`, payload);
        alert("Item updated successfully");
      } else {
        await api.post("/inventory/", payload);
        alert("Item added successfully");
      }

      fetchItems();
      setShowModal(false);
      setEditingId(null);
    } catch (error) {
      console.log("SAVE ERROR:", error.response?.data || error.message);
      alert("Operation failed");
    }
  };

  const deleteItem = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/inventory/${id}`);
      fetchItems();
    } catch (error) {
      console.log("DELETE ERROR:", error.response?.data || error.message);
      alert("Delete failed");
    }
  };
const exportInventoryPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("ECHO - Inventory Report", 14, 15);

  doc.setFontSize(10);
  doc.text(
    `Generated on: ${new Date().toLocaleString()}`,
    14,
    22
  );

  autoTable(doc, {
    startY: 30,
    head: [[
      "Item",
      "Category",
      "Quantity",
      "Unit",
      "Location"
    ]],
    body: items.map((item) => [
      item.item_name,
      item.category,
      item.quantity,
      item.unit,
      item.location,
    ]),
    styles: {
      fontSize: 10,
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
    },
  });

  doc.save("inventory_report.pdf");
};
  return (
    <MainLayout>
      <div className="inventory-page">
        <h1>Inventory Management</h1>

        <div className="inventory-cards">
          <div className="inventory-card">
            <h3>Total Items</h3>
            <h2>{totalItems}</h2>
          </div>

          <div className="inventory-card">
            <h3>Low Stock</h3>
            <h2>{lowStock}</h2>
          </div>

          <div className="inventory-card">
            <h3>Out of Stock</h3>
            <h2>{outOfStock}</h2>
          </div>
        </div>

        <div className="inventory-toolbar">
          <select
            className="inventory-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "All" ? "All Categories" : category}
              </option>
            ))}
          </select>

          <select
            className="inventory-select"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="All">All Stock</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>

          <input
            className="inventory-search"
            type="text"
            placeholder="Search item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="add-item-btn" onClick={openAddModal}>
            + Add Item
          </button>
          <button className="export-btn" onClick={exportInventoryPDF}>
            Export PDF
          </button>
        </div>

        <div className="inventory-table-container">
          <table>
            <thead>
              <tr>
                <th>Sl. No</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((item, index) => {
                const status = getStockStatus(item.quantity);

                return (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.item_name}</td>
                    <td>{item.category}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td>{item.location}</td>
                    <td>
                      <span
                        className={`stock-badge ${status
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="inventory-edit-btn"
                        onClick={() => openEditModal(item)}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        className="inventory-delete-btn"
                        onClick={() => deleteItem(item.id)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="inventory-modal-overlay">
            <div className="inventory-modal">
              <h2>{editingId ? "Edit Inventory Item" : "Add Inventory Item"}</h2>

              <form onSubmit={handleSubmit}>
                <input
                  placeholder="Item Name"
                  value={form.item_name}
                  onChange={(e) =>
                    setForm({ ...form, item_name: e.target.value })
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

                <input
                  type="number"
                  placeholder="Quantity"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                  min="0"
                  required
                />

                <input
                  placeholder="Unit"
                  value={form.unit}
                  onChange={(e) =>
                    setForm({ ...form, unit: e.target.value })
                  }
                  required
                />

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
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={4}
                />

                <div className="inventory-modal-actions">
                  <button type="button" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>

                  <button type="submit">
                    {editingId ? "Update" : "Add Item"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Inventory;