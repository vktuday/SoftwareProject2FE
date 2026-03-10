import { useState } from "react";
import { apiRequest, setToken } from "../api";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import Logo from "../components/Logo";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setToken(data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Register failed");
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
          <p className="auth-eyebrow">Join for free</p>
          <h2 className="auth-panel-brand">
            Face<em>Card</em>
          </h2>
          <p className="auth-panel-tagline">
            Create your account and discover products perfectly matched to your skin type.
          </p>
          <div className="auth-panel-chips">
            <span className="auth-chip auth-chip-red">Personalized</span>
            <span className="auth-chip auth-chip-violet">Free Quiz</span>
            <span className="auth-chip auth-chip-cyan">Smart Picks</span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <Logo />
          <p className="auth-eyebrow">Get started</p>
          <h1>Create account</h1>
          <p>Join thousands discovering their perfect skincare routine.</p>

          {error && (
            <div style={{ background: "#ffe5e5", border: "1px solid #ffb3b3", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14, color: "#c00" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-group">
              <label>Full Name</label>
              <input
                placeholder="Jane Smith"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
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
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}