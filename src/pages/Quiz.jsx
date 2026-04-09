import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { useNavigate } from "react-router-dom";
import "./Quiz.css";
import Modal from "../components/Modal";
import { getSkinTypeInfo } from "../utils/skinTypeInfo";

function detectSkinType({ shineLevel, drynessLevel, sensitivityLevel }) {
  if (sensitivityLevel === "High") return "Sensitive";
  if (drynessLevel === "High" && shineLevel === "Low") return "Dry";
  if (shineLevel === "High" && drynessLevel === "Low") return "Oily";
  if (shineLevel === "Medium" && drynessLevel === "Medium") return "Combination";
  return "Combination";
}

export default function Quiz() {
  const navigate = useNavigate();
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [shineLevel, setShineLevel] = useState("");
  const [drynessLevel, setDrynessLevel] = useState("");
  const [sensitivityLevel, setSensitivityLevel] = useState("");
  const [concerns, setConcerns] = useState("");
  const isAgePrefilled = age !== "";
  const isGenderPrefilled = gender !== "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSkinType, setPreviewSkinType] = useState("");
  const [previewConcerns, setPreviewConcerns] = useState([]);
  const previewInfo = getSkinTypeInfo(previewSkinType, gender);

  function handlePreview(e) {
    e.preventDefault();
    setError("");
    const skinType = detectSkinType({ shineLevel, drynessLevel, sensitivityLevel });
    const concernsArray = concerns
      ? concerns.split(",").map((c) => c.trim()).filter(Boolean)
      : [];
    setPreviewSkinType(skinType);
    setPreviewConcerns(concernsArray);
    setPreviewOpen(true);
  }

  async function saveResult() {
  setLoading(true);
  setError("");

  try {
    const role = localStorage.getItem("role");

    if (role === "trainer") {
      
      await apiRequest("/api/trainers/me/quiz", {
        method: "PUT",
        body: JSON.stringify({
          skinType: previewSkinType,
          concerns: previewConcerns,
          age,        
          gender,     
        }),
      });

      navigate("/trainer-dashboard");
    } else {
      await apiRequest("/api/users/me/quiz-result", {
        method: "PUT",
        body: JSON.stringify({
          skinType: previewSkinType,
          concerns: previewConcerns,
          age,
          gender,
        }),
      });

      navigate("/dashboard");
    }

    setPreviewOpen(false);
  } catch (err) {
    setError(err.message || "Failed to save quiz");
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    async function prefill() {
      try {
        const data = await apiRequest("/api/users/me", { method: "GET" });
        if (data?.user?.age !== null && data?.user?.age !== undefined) {
          setAge(String(data.user.age));
        }
        if (data?.user?.gender) {
          setGender(String(data.user.gender));
        }
      } catch {
      } finally {
        setPrefillLoading(false);
      }
    }
    prefill();
  }, []);

  return (
    <div className="quiz-container">
      <div className="quiz-blob-cyan" />

      <div className="quiz-card">
        <p className="quiz-eyebrow">Personalized for you</p>
        <h2>Skin Quiz</h2>
        <p>Answer a few questions and we'll find your perfect skincare match.</p>

        {error && (
          <div style={{ background: "#ffe5e5", border: "1px solid #ffb3b3", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14, color: "#c00" }}>
            {error}
          </div>
        )}

        <form onSubmit={handlePreview}>
          <div className="quiz-group">
            <label>Age</label>
            <input
              className={isAgePrefilled ? "input-prefilled" : ""}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 22"
              required
            />
          </div>

          <div className="quiz-group">
            <label>Gender</label>
            <select
              className={isGenderPrefilled ? "input-prefilled" : ""}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">Select</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div className="quiz-group">
            <label>How oily does your skin feel during the day?</label>
            <select value={shineLevel} onChange={(e) => setShineLevel(e.target.value)} required>
              <option value="">Select</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="quiz-group">
            <label>How dry does your skin feel?</label>
            <select value={drynessLevel} onChange={(e) => setDrynessLevel(e.target.value)} required>
              <option value="">Select</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="quiz-group">
            <label>How sensitive is your skin?</label>
            <select value={sensitivityLevel} onChange={(e) => setSensitivityLevel(e.target.value)} required>
              <option value="">Select</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="quiz-group">
            <label>Skin concerns (comma separated)</label>
            <input
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              placeholder="Acne, Blackheads, Dryness"
            />
          </div>

          <div className="quiz-actions">
            <button type="submit" disabled={loading || prefillLoading}>
              {prefillLoading ? "Loading..." : loading ? "Please wait..." : "Preview My Result →"}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)}>
        <div className="modal-body">
          <h2 className="modal-title">Your Skin Result</h2>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginTop: 8 }}>
            <img
              src={previewInfo.image}
              alt={previewInfo.title}
              style={{ width: 260, height: 260, objectFit: "cover", borderRadius: 14, flexShrink: 0, border: "1.5px solid #E4E4E7" }}
            />
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#E8003D" }}>Detected</p>
              <p style={{ fontSize: 26, fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: 12 }}>{previewSkinType}</p>
              <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginBottom: 14 }}>{previewInfo.description}</p>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666", marginBottom: 6 }}>Concerns</p>
              <p style={{ fontSize: 14, color: "#333" }}>{previewConcerns.length ? previewConcerns.join(", ") : "None"}</p>
            </div>
          </div>
          <div className="modal-actions">
            <button onClick={() => setPreviewOpen(false)} disabled={loading}>Back</button>
            <button className="primary" onClick={saveResult} disabled={loading}>
              {loading ? "Saving..." : "Save & Continue →"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}