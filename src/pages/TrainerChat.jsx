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

export default function TrainerChat() {
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);

  const bottomRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const messagesRef = useRef(null);

  const token = getToken();

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (!me) return;
    fetchUsers();
  }, [me]);

  useEffect(() => {
    if (!selectedUser || !me) return;

    fetchMessages();

    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [selectedUser, me]);

  useEffect(() => {
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isNearBottom]);

  async function fetchMe() {
    try {
      setError("");
      const data = await apiRequest("/api/trainers/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMe(data.trainer);
    } catch (err) {
      console.error("Fetch me error:", err);
      setError("Failed to load trainer profile.");
    }
  }

  async function fetchUsers() {
    try {
      setError("");
      const data = await apiRequest("/api/messages", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const userMap = new Map();

      (data.messages || []).forEach((message) => {
        if (
          message.toModel === "Trainer" &&
          message.toUser?._id === me?._id &&
          message.fromModel === "User" &&
          message.fromUser
        ) {
          userMap.set(message.fromUser._id, message.fromUser);
        }
      });

      const uniqueUsers = Array.from(userMap.values());
      setUsers(uniqueUsers);

      if (uniqueUsers.length > 0 && !selectedUser) {
        setSelectedUser(uniqueUsers[0]);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
      setError("Failed to load users.");
    }
  }

  async function fetchMessages() {
    if (!selectedUser || !me) return;

    try {
      setError("");
      const data = await apiRequest("/api/messages", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const filtered = (data.messages || []).filter((message) => {
        const incomingFromSelectedUser =
          message.fromModel === "User" &&
          message.fromUser?._id === selectedUser._id &&
          message.toModel === "Trainer";

        const outgoingToSelectedUser =
          message.fromModel === "Trainer" &&
          message.toUser?._id === selectedUser._id &&
          message.toModel === "User";

        return incomingFromSelectedUser || outgoingToSelectedUser;
      });

      setMessages(filtered);
    } catch (err) {
      console.error("Fetch messages error:", err);
      setError("Failed to load messages.");
    }
  }

  async function fetchSelectedUserProfile() {
    if (!selectedUser?._id) return;

    try {
      setProfileLoading(true);
      setError("");

      const data = await apiRequest(`/api/trainers/users/${selectedUser._id}/profile`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedUserProfile(data.user);
      setProfileOpen(true);
    } catch (err) {
      console.error("Fetch selected user profile error:", err);
      setError("Failed to load selected user profile.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function sendReply() {
    if (!text.trim() || !selectedUser) return;

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
          toUser: selectedUser._id,
          text: text.trim(),
          toModel: "User",
        }),
      });

      setText("");
      await fetchMessages();
    } catch (err) {
      console.error("Send reply error:", err);
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  }

  function handleUserSelect(user) {
    setSelectedUser(user);
    setSelectedUserProfile(null);
    setProfileOpen(false);
  }

  function renderConcerns(concerns) {
    if (!Array.isArray(concerns) || concerns.length === 0) {
      return "No concerns saved yet";
    }

    return concerns.join(", ");
  }

  return (
    <div className="chat-page">
      <div className="chat-shell">
        <div className="chat-topbar">
          <div className="chat-topbar-copy">
            <h1>Trainer Chat</h1>
            <p>Reply to users and provide skincare support in one place.</p>
          </div>
          <div className="chat-badge">Trainer</div>
        </div>

        {error ? <div className="chat-error">{error}</div> : null}

        <div className="chat-layout">
          <aside className="chat-sidebar">
            <p className="chat-sidebar-title">Active Users</p>

            <select
              className="chat-select"
              value={selectedUser?._id || ""}
              onChange={(e) => {
                const pickedUser = users.find((user) => user._id === e.target.value);
                handleUserSelect(pickedUser || null);
              }}
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>

            <div className="chat-contact-list">
              {users.map((user) => (
                <button
                  key={user._id}
                  className={`chat-contact-button${
                    selectedUser?._id === user._id ? " active" : ""
                  }`}
                  onClick={() => handleUserSelect(user)}
                >
                  <span className="chat-contact-name">{user.name}</span>
                  <span className="chat-contact-sub">{user.email || "FaceCard User"}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="chat-main">
            <div className="chat-main-header">
              <div>
                <h2 className="chat-main-title">
                  {selectedUser ? `Chat with ${selectedUser.name}` : "Trainer Inbox"}
                </h2>
                <p className="chat-main-subtitle">
                  {selectedUser
                    ? "Respond to skincare questions and continue the conversation."
                    : "Select a user to view and send messages."}
                </p>
              </div>

              <div className="chat-header-actions">
                {selectedUser ? (
                  <button
                    className="chat-profile-btn"
                    onClick={fetchSelectedUserProfile}
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
              {!selectedUser ? (
                <div className="chat-empty">
                  Select a user from the left to start replying.
                </div>
              ) : messages.length === 0 ? (
                <div className="chat-empty">
                  No messages yet. Send the first reply below.
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`chat-message-row ${
                      message.fromModel === "Trainer" ? "mine" : "theirs"
                    }`}
                  >
                    <div className="chat-message-group">
                      <div className="chat-bubble">
                        <div className="chat-message-text">
                          {message.fromModel !== "Trainer" && (
                            <span className="chat-username">
                              {message.fromUser?.name || "User"}:
                            </span>
                          )}{" "}
                          {message.text}
                        </div>
                      </div>
                      <span className="chat-time">{formatTime(message.createdAt)}</span>
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
                  placeholder="Type your reply here..."
                />
                <button
                  className="chat-send-btn"
                  onClick={sendReply}
                  disabled={!text.trim() || !selectedUser || sending}
                >
                  {sending ? "Sending..." : "Send Reply"}
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
            <h2>User Details</h2>
            <p>Trainer view of the selected user profile.</p>
          </div>

          <div className="chat-profile-grid">
            <div className="chat-profile-item">
              <span className="chat-profile-label">Name</span>
              <span className="chat-profile-value">
                {selectedUserProfile?.name || "Not available"}
              </span>
            </div>

            <div className="chat-profile-item">
              <span className="chat-profile-label">Age</span>
              <span className="chat-profile-value">
                {selectedUserProfile?.age ?? "Not available"}
              </span>
            </div>

            <div className="chat-profile-item">
              <span className="chat-profile-label">Gender</span>
              <span className="chat-profile-value">
                {selectedUserProfile?.gender || "Not available"}
              </span>
            </div>

            <div className="chat-profile-item">
              <span className="chat-profile-label">Skin Type</span>
              <span className="chat-profile-value">
                {selectedUserProfile?.skinType || "Not available"}
              </span>
            </div>

            <div className="chat-profile-item chat-profile-item-full">
              <span className="chat-profile-label">Concerns</span>
              <span className="chat-profile-value">
                {renderConcerns(selectedUserProfile?.concerns)}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}