import {
  FaTools,
  FaClipboardList,
  FaWarehouse,
  FaBell,
  FaChartBar,
  FaUserCircle,
  FaUsers,
  FaLeaf,
} from "react-icons/fa";

import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">ECHO</h2>

      <ul>

        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            <FaClipboardList />
            <span>Dashboard</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/maintenance"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            <FaTools />
            <span>Maintenance</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/inventory"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            <FaWarehouse />
            <span>Inventory</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            <FaBell />
            <span>Notifications</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            <FaChartBar />
            <span>Reports</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/sustainability"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            <FaLeaf />
            <span>Sustainability</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/users"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            <FaUsers />
            <span>Users</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            <FaUserCircle />
            <span>Profile</span>
          </NavLink>
        </li>

      </ul>
    </div>
  );
}

export default Sidebar;