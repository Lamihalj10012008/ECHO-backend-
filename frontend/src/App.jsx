import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Maintenance from "./pages/Maintenance";
import Inventory from "./pages/Inventory";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import Signup from "./pages/Signup";
import Sustainability from "./pages/Sustainability";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/maintenance"
        element={
          <ProtectedRoute>
            <Maintenance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Inventory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route path="/signup" element={<Signup />} />
      <Route
  path="/sustainability"
  element={
    <ProtectedRoute>
      <Sustainability />
    </ProtectedRoute>
  }
/>
    </Routes>
  );
}

export default App;