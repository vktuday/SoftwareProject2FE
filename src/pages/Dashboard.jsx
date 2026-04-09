import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import Modal from "../components/Modal";
import { getSkinTypeInfo } from "../utils/skinTypeInfo";
import { getProductImage } from "../utils/productImageMap";
import "./Dashboard.css";
import { Link } from "react-router-dom";

const NO_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <rect width="100%" height="100%" fill="#F4F4F5"/>
    <rect x="28" y="44" width="144" height="112" rx="14" fill="#E4E4E7"/>
    <path d="M58 130l22-24 18 20 16-18 28 34H58z" fill="#D4D4D8"/>
    <circle cx="90" cy="84" r="10" fill="#D4D4D8"/>
    <text x="50%" y="175" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#A1A1AA">No Image</text>
  </svg>
`);

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [resultOpen, setResultOpen] = useState(false);
  const [favoriteDetailsOpen, setFavoriteDetailsOpen] = useState(false);
  const [activeFavorite, setActiveFavorite] = useState(null);
  const [favoriteLoadingId, setFavoriteLoadingId] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", age: "", gender: "" });
  const [editError, setEditError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  function openEdit() {
    setEditError("");
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
    setEditError("");

    try {
      const res = await apiRequest("/api/users/me/profile", {
        method: "PUT",
        body: JSON.stringify(editForm),
      });

      if (!res?.user) {
        setEditError("Failed to update profile");
      } else {
        setMe(res.user);
        setEditOpen(false);
      }
    } catch (err) {
      setEditError(err.message || "Failed to update profile");
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

  async function removeFavorite(productId) {
    setFavoriteLoadingId(productId);
    setError("");

    try {
      const res = await apiRequest(`/api/users/me/favorites/${productId}`, {
        method: "DELETE",
      });

      setMe((prev) => ({
        ...prev,
        favorites: res.favorites || [],
      }));

      if (activeFavorite?._id === productId) {
        setFavoriteDetailsOpen(false);
        setActiveFavorite(null);
      }
    } catch (err) {
      setError(err.message || "Failed to remove product from favorites");
    } finally {
      setFavoriteLoadingId("");
    }
  }

  function openFavoriteDetails(product) {
    setActiveFavorite(product);
    setFavoriteDetailsOpen(true);
  }

  useEffect(() => {
    loadMe();
  }, []);

  const savedInfo = getSkinTypeInfo(me?.quizResult?.skinType, me?.gender);

  return (
    <div className="dashboard-wrap">
      <div className="dashboard-heading">
        <h1>
          Your <span>Dashboard</span>
        </h1>
        <p>Manage your profile, skincare results, and favorite products</p>
      </div>

      {loading && <p style={{ color: "#888" }}>Loading...</p>}

      {error && (
        <div
          style={{
            background: "#ffe5e5",
            border: "1px solid #ffb3b3",
            padding: "12px 16px",
            borderRadius: 10,
            marginBottom: 16,
            fontSize: 14,
            color: "#c00",
          }}
        >
          {error}
        </div>
      )}

      {me && (
        <div className="dashboard-grid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Profile</h3>
              <button className="btn-light" onClick={openEdit}>
                Edit
              </button>
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
                    <Link
                      to="/quiz"
                      className="btn-light"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
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
                    <Link
                      to="/quiz"
                      className="btn-light"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      Take Quiz
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card dashboard-full-width">
            <div className="card-header">
              <h3 className="card-title">Favorite Products</h3>
              <span className="badge">{me.favorites?.length || 0} saved</span>
            </div>

            <div className="card-body">
              {me.favorites && me.favorites.length > 0 ? (
                <div className="favorites-list">
                  {me.favorites.map((product) => (
                    <div className="favorite-item" key={product._id}>
                      <div className="favorite-item-left">
                        <img
                          className="favorite-thumb"
                          src={getProductImage(product.name) || NO_IMAGE}
                          alt={product.name}
                        />
                        <div className="favorite-copy">
                          <h4>{product.name}</h4>
                          <p>{product.brand}</p>
                        </div>
                      </div>

                      <div className="favorite-actions">
                        <button
                          className="btn-light"
                          onClick={() => openFavoriteDetails(product)}
                        >
                          View More Product Details
                        </button>

                        <button
                          className="btn-light btn-remove"
                          onClick={() => removeFavorite(product._id)}
                          disabled={favoriteLoadingId === product._id}
                        >
                          {favoriteLoadingId === product._id
                            ? "Removing..."
                            : "Remove Product"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#888" }}>No favorite products saved yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <div className="modal-body">
          <h2 className="modal-title">Edit Profile</h2>
          {editError && (
            <div className="trainer-modal-error">
              {editError}
            </div>
          )}
          <div style={{ display: "grid", gap: 16 }}>
            <div className="auth-group">
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#666",
                  marginBottom: 8,
                }}
              >
                Name
              </label>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: "1.5px solid #E4E4E7",
                  fontFamily: "inherit",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#666",
                  marginBottom: 8,
                }}
              >
                Email
              </label>
              <input
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: "1.5px solid #E4E4E7",
                  fontFamily: "inherit",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#666",
                    marginBottom: 8,
                  }}
                >
                  Age
                </label>
                <input
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 8,
                    border: "1.5px solid #E4E4E7",
                    fontFamily: "inherit",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#666",
                    marginBottom: 8,
                  }}
                >
                  Gender
                </label>
                <select
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 8,
                    border: "1.5px solid #E4E4E7",
                    fontFamily: "inherit",
                    fontSize: 14,
                    outline: "none",
                    appearance: "none",
                  }}
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
            <button onClick={() => setEditOpen(false)} disabled={savingProfile}>
              Cancel
            </button>
            <button className="primary" onClick={saveProfile} disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={resultOpen} onClose={() => setResultOpen(false)}>
        {me?.quizResult ? (
          <div className="modal-body">
            <h2 className="modal-title">Your Skin Result</h2>
            <div
              style={{
                display: "flex",
                gap: 20,
                alignItems: "flex-start",
                marginTop: 8,
              }}
            >
              <img
                src={savedInfo.image}
                alt={savedInfo.title}
                style={{
                  width: 280,
                  height: 280,
                  objectFit: "cover",
                  borderRadius: 14,
                  flexShrink: 0,
                  border: "1.5px solid #E4E4E7",
                }}
              />
              <div>
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#E8003D",
                  }}
                >
                  Skin Type
                </p>
                <p
                  style={{
                    fontSize: 22,
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    marginBottom: 12,
                  }}
                >
                  {me.quizResult.skinType}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "#555",
                    lineHeight: 1.7,
                    marginBottom: 12,
                  }}
                >
                  {savedInfo.description}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#666",
                    marginBottom: 6,
                  }}
                >
                  Concerns
                </p>
                <p style={{ fontSize: 14, color: "#333" }}>
                  {me.quizResult.concerns?.join(", ") || "None"}
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setResultOpen(false)}>Close</button>
            </div>
          </div>
        ) : (
          <div className="modal-body">
            <p>No quiz result saved yet.</p>
          </div>
        )}
      </Modal>

      <Modal
        open={favoriteDetailsOpen}
        onClose={() => {
          setFavoriteDetailsOpen(false);
          setActiveFavorite(null);
        }}
      >
        {activeFavorite ? (
          <div className="modal-body favorite-details-modal">
            <h2 className="modal-title">Product Details</h2>

            <div className="favorite-modal-layout">
              <img
                className="favorite-modal-image"
                src={getProductImage(activeFavorite.name) || NO_IMAGE}
                alt={activeFavorite.name}
              />

              <div className="favorite-modal-copy">
                <p className="favorite-modal-label">Brand</p>
                <p className="favorite-modal-value">{activeFavorite.brand}</p>

                <p className="favorite-modal-label">Skin Type</p>
                <p className="favorite-modal-value">{activeFavorite.skinType}</p>

                <p className="favorite-modal-label">Product Name</p>
                <p className="favorite-modal-value">{activeFavorite.name}</p>

                <p className="favorite-modal-label">Description</p>
                <p className="favorite-modal-description">
                  {activeFavorite.description}
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => removeFavorite(activeFavorite._id)}
                disabled={favoriteLoadingId === activeFavorite._id}
              >
                {favoriteLoadingId === activeFavorite._id
                  ? "Removing..."
                  : "Remove Product"}
              </button>
              <button
                className="primary"
                onClick={() => {
                  setFavoriteDetailsOpen(false);
                  setActiveFavorite(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}