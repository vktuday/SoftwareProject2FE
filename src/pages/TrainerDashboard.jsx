import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import Modal from "../components/Modal";
import "./Dashboard.css";
import { } from "react-router-dom";

export default function TrainerDashboard() {
  const [trainer, setTrainer] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
  });
  const [editError, setEditError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [trainerProfileOpen, setTrainerProfileOpen] = useState(false);
  const [trainerProfileForm, setTrainerProfileForm] = useState({
    profileImage: "",
    aboutMe: "",
    experience: "",
    specialties: "",
  });
  const [savingTrainerProfile, setSavingTrainerProfile] = useState(false);

  async function loadTrainer() {
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/api/trainers/me", { method: "GET" });

      if (!data?.trainer) {
        setError("Trainer not found");
        setTrainer(null);
      } else {
        setTrainer(data.trainer);
      }
    } catch (err) {
      setError(err.message || "Failed to load trainer dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrainer();
  }, []);

  function openEdit() {
    setEditError("");
    setEditForm({
      name: trainer?.name || "",
      email: trainer?.email || "",
      age: trainer?.age ?? "",
      gender: trainer?.gender ?? "",
    });
    setEditOpen(true);
  }

  function openTrainerProfileEdit() {
    setTrainerProfileForm({
      profileImage: trainer?.profileImage || "",
      aboutMe: trainer?.aboutMe || "",
      experience: trainer?.experience || "",
      specialties: Array.isArray(trainer?.specialties)
        ? trainer.specialties.join(", ")
        : "",
    });
    setTrainerProfileOpen(true);
  }

  async function saveProfile() {
    setSavingProfile(true);
    setEditError("");
    
    try {
      const res = await apiRequest("/api/trainers/me/profile", {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
    
      if (!res?.trainer) {
        setEditError("Failed to update trainer profile");
      } else {
        setTrainer(res.trainer);
        setEditOpen(false);
      }
    } catch (err) {
      setEditError(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveTrainerProfile() {
    setSavingTrainerProfile(true);
    setError("");

    try {
      const payload = {
        profileImage: trainerProfileForm.profileImage,
        aboutMe: trainerProfileForm.aboutMe,
        experience: trainerProfileForm.experience,
        specialties: trainerProfileForm.specialties,
      };

      const res = await apiRequest("/api/trainers/me/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!res?.trainer) {
        setError("Failed to update trainer profile card");
      } else {
        setTrainer(res.trainer);
        setTrainerProfileOpen(false);
      }
    } catch (err) {
      setError(err.message || "Failed to update trainer profile card");
    } finally {
      setSavingTrainerProfile(false);
    }
  }

  function renderSpecialties(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return <span className="trainer-profile-empty">No specialties added yet.</span>;
    }

    return items.map((item, index) => (
      <span key={`${item}-${index}`} className="trainer-specialty-tag">
        {item}
      </span>
    ));
  }

  return (
    <div className="dashboard-wrap">
      <div className="dashboard-heading">
        <h1>
          Your <span>Trainer Dashboard</span>
        </h1>
        <p>Manage your profile and quiz results</p>
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

      {trainer && (
        <div className="trainer-dashboard-grid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Personal Information</h3>
              <button className="btn-light" onClick={openEdit}>
                Edit
              </button>
            </div>
            <div className="card-body">
              <div className="kv">
                <div className="k">Name</div>
                <div className="v">{trainer.name}</div>

                <div className="k">Email</div>
                <div className="v">{trainer.email}</div>

                <div className="k">Age</div>
                <div className="v">{trainer.age ?? "Not set"}</div>

                <div className="k">Gender</div>
                <div className="v">{trainer.gender ?? "Not set"}</div>
              </div>
            </div>
          </div>

          <div className="card dashboard-full-width">
            <div className="card-header">
              <h3 className="card-title">Trainer Profile</h3>
              <button className="btn-light" onClick={openTrainerProfileEdit}>
                Edit Profile
              </button>
            </div>

            <div className="card-body">
              <div className="trainer-profile-layout">
                <div className="trainer-profile-hero">
                  {trainer.profileImage ? (
                    <img
                      src={trainer.profileImage}
                      alt={trainer.name}
                      className="trainer-profile-avatar"
                    />
                  ) : (
                    <div className="trainer-profile-avatar trainer-profile-avatar-placeholder">
                      {trainer.name ? trainer.name.charAt(0).toUpperCase() : "T"}
                    </div>
                  )}

                  <div className="trainer-profile-hero-copy">
                    <h4>{trainer.name}</h4>
                    <span className="badge badge-pink">Trainer</span>
                  </div>
                </div>

                <div className="trainer-profile-sections">
                  <div className="trainer-profile-block">
                    <p className="trainer-profile-label">About Me</p>
                    <p className="trainer-profile-text">
                      {trainer.aboutMe || "Add a short introduction about yourself."}
                    </p>
                  </div>

                  <div className="trainer-profile-block">
                    <p className="trainer-profile-label">Experience</p>
                    <p className="trainer-profile-text">
                      {trainer.experience || "Add your skincare experience or background."}
                    </p>
                  </div>

                  <div className="trainer-profile-block">
                    <p className="trainer-profile-label">Specialties</p>
                    <div className="trainer-specialties-wrap">
                      {renderSpecialties(trainer.specialties)}
                    </div>
                  </div>
                </div>
              </div>
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
          <div className="trainer-basic-profile-form-grid">
            <div>
              <label>Name</label>
              <input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder="Enter your name"
              />
            </div>
              
            <div>
              <label>Email</label>
              <input
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                placeholder="Enter your email"
              />
            </div>
              
            <div className="trainer-basic-profile-two-col">
              <div>
                <label>Age</label>
                <input
                  value={editForm.age}
                  onChange={(e) =>
                    setEditForm({ ...editForm, age: e.target.value })
                  }
                  placeholder="Enter your age"
                />
              </div>
                
              <div>
                <label>Gender</label>
                <select
                  value={editForm.gender}
                  onChange={(e) =>
                    setEditForm({ ...editForm, gender: e.target.value })
                  }
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
            <button
              className="primary"
              onClick={saveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={trainerProfileOpen} onClose={() => setTrainerProfileOpen(false)}>
        <div className="modal-body">
          <h2 className="modal-title">Edit Trainer Profile</h2>

          <div className="trainer-profile-form-grid">
            <div>
              <label>Profile Image URL</label>
              <input
                value={trainerProfileForm.profileImage}
                onChange={(e) =>
                  setTrainerProfileForm({
                    ...trainerProfileForm,
                    profileImage: e.target.value,
                  })
                }
                placeholder="https://example.com/profile.jpg"
              />
            </div>

            <div>
              <label>About Me</label>
              <textarea
                className="trainer-profile-textarea"
                value={trainerProfileForm.aboutMe}
                onChange={(e) =>
                  setTrainerProfileForm({
                    ...trainerProfileForm,
                    aboutMe: e.target.value,
                  })
                }
                placeholder="Write a short introduction about yourself."
              />
            </div>

            <div>
              <label>Experience</label>
              <textarea
                className="trainer-profile-textarea"
                value={trainerProfileForm.experience}
                onChange={(e) =>
                  setTrainerProfileForm({
                    ...trainerProfileForm,
                    experience: e.target.value,
                  })
                }
                placeholder="Describe your experience helping users with skincare."
              />
            </div>

            <div>
              <label>Specialties</label>
              <input
                value={trainerProfileForm.specialties}
                onChange={(e) =>
                  setTrainerProfileForm({
                    ...trainerProfileForm,
                    specialties: e.target.value,
                  })
                }
                placeholder="Acne, Oily Skin, Sensitive Skin"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              onClick={() => setTrainerProfileOpen(false)}
              disabled={savingTrainerProfile}
            >
              Cancel
            </button>
            <button
              className="primary"
              onClick={saveTrainerProfile}
              disabled={savingTrainerProfile}
            >
              {savingTrainerProfile ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}