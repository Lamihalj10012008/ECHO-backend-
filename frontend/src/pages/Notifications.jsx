import { useEffect, useState } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";
import "../styles/Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications/");
      setNotifications(res.data || []);
    } catch (error) {
      console.log("NOTIFICATION FETCH ERROR:", error.response?.data || error.message);
    }
  };

  return (
    <MainLayout>
      <div className="notifications-page">
        <h1>Notifications</h1>

        {notifications.length === 0 ? (
          <div className="notification-card">
            <h3>No notifications yet</h3>
            <p>New maintenance and inventory alerts will appear here.</p>
          </div>
        ) : (
          notifications.map((note) => (
            <div className="notification-card" key={note.id}>
              <h3>{note.title}</h3>
              <p>{note.message}</p>
            </div>
          ))
        )}
      </div>
    </MainLayout>
  );
}

export default Notifications;