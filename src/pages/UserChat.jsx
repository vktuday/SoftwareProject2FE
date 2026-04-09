import { useEffect, useRef, useState } from "react";
import { getToken, apiRequest } from "../api";
import Modal from "../components/Modal";
import "./Chat.css";

function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isSameDay) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " • " +
    date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

export default function UserChat() {
  const [me, setMe] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [selectedTrainerProfile, setSelectedTrainerProfile] = useState(null);

  const bottomRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const messagesRef = useRef(null);

  const token = getToken();

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (!me) return;
    fetchTrainers();
  }, [me]);

  useEffect(() => {
    if (!selectedTrainer || !me) return;

    fetchMessages();

    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [selectedTrainer, me]);

  useEffect(() => {
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isNearBottom]);

  async function fetchMe() {
    try {
      setError("");
      const data = await apiRequest("/api/users/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMe(data.user);
    } catch (err) {
      console.error("Fetch me error:", err);
      setError("Failed to load your profile.");
    }
  }

  async function fetchTrainers() {
    try {
      setError("");
      const data = await apiRequest("/api/trainers", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const loadedTrainers = data.trainers || [];
      setTrainers(loadedTrainers);

      if (loadedTrainers.length > 0 && !selectedTrainer) {
        setSelectedTrainer(loadedTrainers[0]);
      }
    } catch (err) {
      console.error("Fetch trainers error:", err);
      setError("Failed to load trainers.");
    }
  }

  async function fetchMessages() {
    if (!selectedTrainer || !me) return;

    try {
      setError("");
      const data = await apiRequest("/api/messages", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const filtered = (data.messages || []).filter((message) => {
        const incomingFromSelectedTrainer =
          message.fromModel === "Trainer" &&
          message.fromUser?._id === selectedTrainer._id &&
          message.toModel === "User";

        const outgoingToSelectedTrainer =
          message.fromModel === "User" &&
          message.toUser?._id === selectedTrainer._id &&
          message.toModel === "Trainer";

        return incomingFromSelectedTrainer || outgoingToSelectedTrainer;
      });

      setMessages(filtered);
    } catch (err) {
      console.error("Fetch messages error:", err);
      setError("Failed to load messages.");
    }
  }

  async function fetchSelectedTrainerProfile() {
    if (!selectedTrainer?._id) return;

    try {
      setProfileLoading(true);
      setError("");

      const data = await apiRequest(
        `/api/users/trainers/${selectedTrainer._id}/profile`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSelectedTrainerProfile(data.trainer);
      setProfileOpen(true);
    } catch (err) {
      console.error("Fetch selected trainer profile error:", err);
      setError("Failed to load trainer profile.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function sendMessage() {
    if (!text.trim() || !selectedTrainer) return;

    try {
      setSending(true);
      setError("");

      await apiRequest("/api/messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toUser: selectedTrainer._id,
          text: text.trim(),
          toModel: "Trainer",
        }),
      });

      setText("");
      await fetchMessages();
    } catch (err) {
      console.error("Send message error:", err);
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleTrainerSelect(trainer) {
    setSelectedTrainer(trainer);
    setSelectedTrainerProfile(null);
    setProfileOpen(false);
  }

  function renderSpecialties(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return (
        <span className="trainer-profile-empty">
          No specialties added yet
        </span>
      );
    }

    return (
      <div className="trainer-chat-specialties-wrap">
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="trainer-chat-specialty-tag"
          >
            {item}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-shell">
        <div className="chat-topbar">
          <div className="chat-topbar-copy">
            <h1>User Chat</h1>
            <p>Connect with trainers and ask skincare questions in one place.</p>
          </div>
          <div className="chat-badge">User</div>
        </div>

        {error ? <div className="chat-error">{error}</div> : null}

        <div className="chat-layout">
          <aside className="chat-sidebar">
            <p className="chat-sidebar-title">Available Trainers</p>

            <select
              className="chat-select"
              value={selectedTrainer?._id || ""}
              onChange={(e) => {
                const pickedTrainer = trainers.find(
                  (trainer) => trainer._id === e.target.value
                );
                handleTrainerSelect(pickedTrainer || null);
              }}
            >
              <option value="">Select a trainer</option>
              {trainers.map((trainer) => (
                <option key={trainer._id} value={trainer._id}>
                  {trainer.name}
                </option>
              ))}
            </select>

            <div className="chat-contact-list">
              {trainers.map((trainer) => (
                <button
                  key={trainer._id}
                  className={`chat-contact-button${
                    selectedTrainer?._id === trainer._id ? " active" : ""
                  }`}
                  onClick={() => handleTrainerSelect(trainer)}
                >
                  <span className="chat-contact-name">{trainer.name}</span>
                  <span className="chat-contact-sub">
                    {trainer.email || "FaceCard Trainer"}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section className="chat-main">
            <div className="chat-main-header">
              <div>
                <h2 className="chat-main-title">
                  {selectedTrainer
                    ? `Chat with ${selectedTrainer.name}`
                    : "User Chat"}
                </h2>
                <p className="chat-main-subtitle">
                  {selectedTrainer
                    ? "Send your skincare questions and continue the conversation."
                    : "Select a trainer to start chatting."}
                </p>
              </div>

              <div className="chat-header-actions">
                {selectedTrainer ? (
                  <button
                    className="chat-profile-btn"
                    onClick={fetchSelectedTrainerProfile}
                    disabled={profileLoading}
                  >
                    {profileLoading ? "Loading..." : "View Profile"}
                  </button>
                ) : null}

                <div className="chat-main-status">
                  {me ? `Signed in as ${me.name}` : "Loading..."}
                </div>
              </div>
            </div>

            <div
              className="chat-messages"
              ref={messagesRef}
              onScroll={() => {
                const el = messagesRef.current;
                if (!el) return;

                const threshold = 80;
                const atBottom =
                  el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

                setIsNearBottom(atBottom);
              }}
            >
              {!selectedTrainer ? (
                <div className="chat-empty">
                  Select a trainer from the left to start chatting.
                </div>
              ) : messages.length === 0 ? (
                <div className="chat-empty">
                  No messages yet. Send the first message below.
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`chat-message-row ${
                      message.fromModel === "User" ? "mine" : "theirs"
                    }`}
                  >
                    <div className="chat-message-group">
                      <div className="chat-bubble">
                        <div className="chat-message-text">
                          {message.fromModel !== "User" && (
                            <span className="chat-username">
                              {message.fromUser?.name || "Trainer"}:
                            </span>
                          )}{" "}
                          {message.text}
                        </div>
                      </div>
                      <span className="chat-time">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}

              <div ref={bottomRef}></div>
            </div>

            <div className="chat-composer">
              <div className="chat-composer-row">
                <textarea
                  className="chat-textarea"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message here..."
                />
                <button
                  className="chat-send-btn"
                  onClick={sendMessage}
                  disabled={!text.trim() || !selectedTrainer || sending}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Modal
        open={profileOpen}
        onClose={() => {
          setProfileOpen(false);
        }}
      >
        <div className="chat-profile-modal">
          <div className="chat-profile-modal-header">
            <h2>Trainer Profile</h2>
            <p>Learn more about the selected trainer.</p>
          </div>

          <div className="trainer-chat-profile-layout">
            <div className="trainer-chat-profile-top">
              {selectedTrainerProfile?.profileImage ? (
                <img
                  src={selectedTrainerProfile.profileImage}
                  alt={selectedTrainerProfile.name}
                  className="trainer-chat-profile-avatar"
                />
              ) : (
                <div className="trainer-chat-profile-avatar trainer-chat-profile-avatar-placeholder">
                  {selectedTrainerProfile?.name
                    ? selectedTrainerProfile.name.charAt(0).toUpperCase()
                    : "T"}
                </div>
              )}

              <div className="trainer-chat-profile-top-copy">
                <h3>{selectedTrainerProfile?.name || "Trainer"}</h3>
                <span className="badge badge-pink">Trainer</span>
              </div>
            </div>

            <div className="chat-profile-grid">
              <div className="chat-profile-item chat-profile-item-full">
                <span className="chat-profile-label">About Me</span>
                <span className="chat-profile-value">
                  {selectedTrainerProfile?.aboutMe ||
                    "No introduction added yet."}
                </span>
              </div>

              <div className="chat-profile-item chat-profile-item-full">
                <span className="chat-profile-label">Experience</span>
                <span className="chat-profile-value">
                  {selectedTrainerProfile?.experience ||
                    "No experience details added yet."}
                </span>
              </div>

              <div className="chat-profile-item chat-profile-item-full">
                <span className="chat-profile-label">Specialties</span>
                <div className="chat-profile-value">
                  {renderSpecialties(selectedTrainerProfile?.specialties)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}