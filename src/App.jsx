import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import NavBar from "./components/NavBar";
import { apiRequest, getToken, clearToken } from "./api";
import TrainerDashboard from "./pages/TrainerDashboard";
import UserChat from "./pages/UserChat";
import TrainerChat from "./pages/TrainerChat";
import "./App.css";

function ProtectedRoute({ children, role }) {
  const token = getToken();
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;

  if (role && userRole !== role) {
    return userRole === "trainer" ? <Navigate to="/trainer-dashboard" replace /> : <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  const [me, setMe] = useState(null);
  const [isAuthed, setIsAuthed] = useState(!!getToken());

  async function refreshMe() {
  try {
    if (!getToken()) {
      setMe(null);
      setIsAuthed(false);
      return;
    }

    const role = localStorage.getItem("role");

    if (role === "trainer") {
      const data = await apiRequest("/api/trainers/me", { method: "GET" });
      setMe({ ...data.trainer, role: "trainer" }); // add role
    } else {
      const data = await apiRequest("/api/users/me", { method: "GET" });
      setMe({ ...data.user, role: "user" }); // add role
    }

    setIsAuthed(true);
  } catch {
    setMe(null);
    setIsAuthed(false);
    clearToken();
  }
}

  useEffect(() => {
    refreshMe();
    function onAuthChange() { refreshMe(); }
    window.addEventListener("authchange", onAuthChange);
    return () => window.removeEventListener("authchange", onAuthChange);
  }, []);

  function handleLogout() {
    clearToken();
    localStorage.removeItem("role");
    setMe(null);
    setIsAuthed(false);
  }

  return (
    <div>
      <NavBar isAuthed={isAuthed} me={me} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={
          <div style={{ maxWidth: 1200, margin: "80px auto", padding: "0 32px", textAlign: "center" }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 64, fontWeight: 900, letterSpacing: "-0.03em" }}>
              Face<em style={{ fontStyle: "italic", background: "linear-gradient(135deg,#E8003D,#FF4D8D,#C084FC)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Card</em>
            </h1>
            <p style={{ fontSize: 16, color: "#888", marginTop: 16 }}>Your personalized skincare companion.</p>
          </div>
        } />

        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="user">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Trainer Dashboard */}
        <Route
          path="/trainer-dashboard"
          element={
            <ProtectedRoute role="trainer">
              <TrainerDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/quiz" element={
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
        } />

        {/* Chat */}
        <Route
  path="/chat"
  element={
    <ProtectedRoute>
      {!me ? (
        <div>Loading...</div>
      ) : localStorage.getItem("role") === "trainer" ? (
        <TrainerChat />
      ) : (
        <UserChat />
      )}
    </ProtectedRoute>
  }
/>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}