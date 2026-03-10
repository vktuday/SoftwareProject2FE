import { Link, useLocation } from "react-router-dom";
import "./NavBar.css";
import Logo from "./Logo";

export default function NavBar({ isAuthed, me, onLogout }) {
  const location = useLocation();
  const path = location.pathname;

  return (
    <>
      {/* Scrolling promo ribbon */}
      <div className="navbar-ribbon">
        <span>
          Free shipping on orders over $50 &nbsp;·&nbsp; New arrivals every week &nbsp;·&nbsp;
          Take the skin quiz for personalized picks &nbsp;·&nbsp; Free shipping on orders over $50
          &nbsp;·&nbsp; New arrivals every week &nbsp;·&nbsp; Take the skin quiz for personalized picks
        </span>
      </div>

      <nav className="navbar">
        <div className="navbar-inner">
          {/* Left: brand + nav links */}
          <div className="nav-left">
            <Logo />
            <Link className={`nav-link${path === "/products" ? " nav-link-active" : ""}`} to="/products">
              Products
            </Link>
            {isAuthed && (
              <>
                <Link className={`nav-link${path === "/quiz" ? " nav-link-active" : ""}`} to="/quiz">
                  Skin Quiz
                </Link>
                <Link className={`nav-link${path === "/dashboard" ? " nav-link-active" : ""}`} to="/dashboard">
                  Dashboard
                </Link>
              </>
            )}
          </div>

          {/* Right: user info + auth buttons */}
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
                <Link className="btn" to="/login">Sign in</Link>
                <Link className="btn btn-primary" to="/register">Join now</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}