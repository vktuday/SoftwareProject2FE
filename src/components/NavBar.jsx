import { Link, useLocation } from "react-router-dom";
import "./NavBar.css";
import Logo from "./Logo";

export default function NavBar({ isAuthed, me, onLogout }) {
  const location = useLocation();
  const path = location.pathname;
  const role = me?.role || localStorage.getItem("role");

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="nav-left">
          <Logo />

          <Link
            className={`nav-link${path === "/products" ? " nav-link-active" : ""}`}
            to="/products"
          >
            Products
          </Link>

          {isAuthed && role === "user" && (
            <>
              <Link
                className={`nav-link${path === "/quiz" ? " nav-link-active" : ""}`}
                to="/quiz"
              >
                Skin Quiz
              </Link>

              <Link
                className={`nav-link${path === "/dashboard" ? " nav-link-active" : ""}`}
                to="/dashboard"
              >
                Dashboard
              </Link>

              <Link
                className={`nav-link${path === "/chat" ? " nav-link-active" : ""}`}
                to="/chat"
              >
                Chat
              </Link>
            </>
          )}

          {isAuthed && role === "trainer" && (
            <>
              <Link
                className={`nav-link${path === "/trainer-dashboard" ? " nav-link-active" : ""}`}
                to="/trainer-dashboard"
              >
                Dashboard
              </Link>

              <Link
                className={`nav-link${path === "/chat" ? " nav-link-active" : ""}`}
                to="/chat"
              >
                Chat
              </Link>
            </>
          )}
        </div>

        <div className="nav-right">
          {isAuthed && me ? (
            <>
              <div className="user-box">
                <span className="user-hello">{me.name}</span>
                <span className="user-sub">{me.email}</span>
              </div>

              <button className="btn" onClick={onLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="btn" to="/login">
                Sign in
              </Link>
              <Link className="btn btn-primary" to="/register">
                Join now
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}