import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import Modal from "../components/Modal";
import { getSkinTypeInfo } from "../utils/skinTypeInfo";
import "./Dashboard.css";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [resultOpen, setResultOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", age: "", gender: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  function openEdit() {
    setEditForm({
      name: me?.name || "",
      email: me?.email || "",
      age: me?.age ?? "",
      gender: me?.gender ?? "",
    });
    setEditOpen(true);
  }

  async function saveProfile() {
    setSavingProfile(true);
    setError("");
    try {
      const res = await apiRequest("/api/users/me/profile", {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
      setMe(res.user);
      setEditOpen(false);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function loadMe() {
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest("/api/users/me", { method: "GET" });
      setMe(data.user);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMe(); }, []);

  const savedInfo = getSkinTypeInfo(me?.quizResult?.skinType);

  return (
    <div className="dashboard-wrap">
      {/* Page heading */}
      <div className="dashboard-heading">
        <h1>Your <span>Dashboard</span></h1>
        <p>Manage your profile and skincare results</p>
      </div>

      {loading && <p style={{ color: "#888" }}>Loading...</p>}

      {error && (
        <div style={{ background: "#ffe5e5", border: "1px solid #ffb3b3", padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: 14, color: "#c00" }}>
          {error}
        </div>
      )}

      {me && (
        <div className="dashboard-grid">
          {/* Profile card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Profile</h3>
              <button className="btn-light" onClick={openEdit}>Edit</button>
            </div>
            <div className="card-body">
              <div className="kv">
                <div className="k">Name</div>
                <div className="v">{me.name}</div>
                <div className="k">Email</div>
                <div className="v">{me.email}</div>
                <div className="k">Age</div>
                <div className="v">{me.age ?? "Not set"}</div>
                <div className="k">Gender</div>
                <div className="v">{me.gender ?? "Not set"}</div>
              </div>
            </div>
          </div>

          {/* Quiz Result card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quiz Result</h3>
              <span className={`badge ${me.quizResult ? "badge-red" : ""}`}>
                {me.quizResult ? "Saved" : "Not taken"}
              </span>
            </div>
            <div className="card-body">
              {me.quizResult ? (
                <>
                  <div className="kv">
                    <div className="k">Skin Type</div>
                    <div className="v">{me.quizResult.skinType}</div>
                    <div className="k">Concerns</div>
                    <div className="v">{me.quizResult.concerns?.join(", ") || "None"}</div>
                    <div className="k">Updated</div>
                    <div className="v">
                      {me.quizResult.updatedAt
                        ? new Date(me.quizResult.updatedAt).toLocaleString()
                        : "—"}
                    </div>
                  </div>
                  <div className="cta-row">
                    <Link to="/quiz" className="btn-light" style={{ textDecoration: "none", color: "inherit" }}>
                      Retake Quiz
                    </Link>
                    <button className="btn-light" onClick={() => setResultOpen(true)}>
                      View Result
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ color: "#888", marginBottom: 16 }}>No quiz result saved yet.</p>
                  <div className="cta-row">
                    <Link to="/quiz" className="btn-light" style={{ textDecoration: "none", color: "inherit" }}>
                      Take Quiz
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal open={editOpen} title="Edit Profile" onClose={() => setEditOpen(false)}>
        <div className="modal-body">
          <h2 className="modal-title">Edit Profile</h2>
          <div style={{ display: "grid", gap: 16 }}>
            <div className="auth-group">
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#666", marginBottom: 8 }}>Name</label>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1.5px solid #E4E4E7", fontFamily: "inherit", fontSize: 14, outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#666", marginBottom: 8 }}>Email</label>
              <input
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1.5px solid #E4E4E7", fontFamily: "inherit", fontSize: 14, outline: "none" }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#666", marginBottom: 8 }}>Age</label>
                <input
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1.5px solid #E4E4E7", fontFamily: "inherit", fontSize: 14, outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#666", marginBottom: 8 }}>Gender</label>
                <select
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1.5px solid #E4E4E7", fontFamily: "inherit", fontSize: 14, outline: "none", appearance: "none" }}
                >
                  <option value="">Select</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>
          <div className="modal-actions">
            <button onClick={() => setEditOpen(false)} disabled={savingProfile}>Cancel</button>
            <button className="primary" onClick={saveProfile} disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Quiz Result Modal */}
      <Modal open={resultOpen} title="Quiz Result" onClose={() => setResultOpen(false)}>
        {me?.quizResult ? (
          <div className="modal-body">
            <h2 className="modal-title">Your Skin Result</h2>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginTop: 8 }}>
              <img
                src={savedInfo.image}
                alt={savedInfo.title}
                style={{ width: 280, height: 280, objectFit: "cover", borderRadius: 14, flexShrink: 0, border: "1.5px solid #E4E4E7" }}
              />
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#E8003D" }}>Skin Type</p>
                <p style={{ fontSize: 22, fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: 12 }}>{me.quizResult.skinType}</p>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginBottom: 12 }}>{savedInfo.description}</p>
                <p style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666", marginBottom: 6 }}>Concerns</p>
                <p style={{ fontSize: 14, color: "#333" }}>{me.quizResult.concerns?.join(", ") || "None"}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setResultOpen(false)}>Close</button>
            </div>
          </div>
        ) : (
          <div className="modal-body"><p>No quiz result saved yet.</p></div>
        )}
      </Modal>
    </div>
  );
}