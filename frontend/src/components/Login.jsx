import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {

  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <h1>ECHO</h1>

        <p className="subtitle">
          Educational Communication & Help Organizer
        </p>

        <label>Username</label>
        <input
          type="text"
          placeholder="Enter Username"
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter Password"
        />

        <label>Role</label>
        <select>
          <option>Student</option>
          <option>Faculty</option>
          <option>Administrator</option>
        </select>

        <button onClick={handleLogin}>
          Login
        </button>

        <hr />

        <p className="footer-text">
          Smart Campus Governance & Student Helpdesk System
        </p>

      </div>
    </div>
  );
}

export default Login;