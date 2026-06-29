import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Login.css";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    role: "Staff",
    password: "",
    confirmPassword: "",
  });

  const handleSignup = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await api.post("/auth/register", {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      console.log("SIGNUP SUCCESS:", res.data);

      alert("Account created successfully. Please login.");
      navigate("/");
    } catch (error) {
      console.log("SIGNUP ERROR:", error);
      console.log("SIGNUP RESPONSE:", error.response?.data);

      alert(
        error.response?.data?.detail ||
          error.message ||
          "Signup failed"
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>ECHO</h1>
        <p>Create your account</p>

        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            value={form.full_name}
            onChange={(e) =>
              setForm({ ...form, full_name: e.target.value })
            }
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />

          <select
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
            required
          >
            <option value="Faculty">Faculty</option>
            <option value="Technician">Technician</option>
            <option value="Student">Student</option>
          </select>

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({
                ...form,
                confirmPassword: e.target.value,
              })
            }
            required
          />

          <button type="submit">Sign Up</button>
        </form>

        <p className="demo-login">
          Already have an account?{" "}
          <span onClick={() => navigate("/")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Signup;