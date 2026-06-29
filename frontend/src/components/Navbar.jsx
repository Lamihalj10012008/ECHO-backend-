import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="navbar">
      <h2>Facilities & Logistics</h2>

      <div className="navbar-right">
        <span>{user?.full_name || "Admin"}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Navbar;