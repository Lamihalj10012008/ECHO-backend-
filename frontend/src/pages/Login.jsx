import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
      alert("Login Successful");

      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.detail || "Invalid email or password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <h1>ECHO</h1>
        <p>Facilities & Logistics Management</p>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />

          <button type="submit">
            Login
          </button>

        </form>

        <div className="signup-link">
          Don't have an account?
          <span onClick={() => navigate("/signup")}>
            {" "}Sign Up
          </span>
        </div>

      </div>
    </div>
  );
}

export default Login;