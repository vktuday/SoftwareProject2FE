import { useState } from "react";
import { apiRequest, setToken } from "../api";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import Logo from "../components/Logo";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setToken(data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Left decorative panel */}
      <div className="auth-panel">
        <div className="auth-panel-blob-violet" />
        <div className="auth-panel-blob-cyan" />
        <div className="auth-panel-content">
          <p className="auth-eyebrow">Welcome back</p>
          <h2 className="auth-panel-brand">
            Face<em>Card</em>
          </h2>
          <p className="auth-panel-tagline">
            Your skin deserves the best. Sign in to access your personalized skincare routine.
          </p>
          <div className="auth-panel-chips">
            <span className="auth-chip auth-chip-red">Skin Quiz</span>
            <span className="auth-chip auth-chip-violet">AI Picks</span>
            <span className="auth-chip auth-chip-cyan">Expert Tips</span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <Logo />
          <p className="auth-eyebrow">Sign in</p>
          <h1>Welcome back</h1>
          <p>Enter your details to access your account.</p>

          {error && (
            <div style={{ background: "#ffe5e5", border: "1px solid #ffb3b3", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14, color: "#c00" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="auth-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}