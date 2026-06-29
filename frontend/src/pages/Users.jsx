import { useEffect, useState } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";
import "../styles/Users.css";

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/auth/users");
      setUsers(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <MainLayout>
      <div className="users-page">
        <h1>User Management</h1>

        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

export default Users;