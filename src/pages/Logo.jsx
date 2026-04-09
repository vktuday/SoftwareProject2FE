import { Link } from "react-router-dom";
import "./Logo.css";


export default function Logo() {
  return (
    <div style={{ textAlign: "center", marginBottom: "20px" }}>
      <Link to="/">
        <img
          src="/logo-facecard.jpg"
          alt="FaceCard Logo"
          className="logo-img"
        />
      </Link>
    </div>
  );
}