import { Link } from "react-router-dom";
import "./Logo.css";

export default function Logo() {
  return (
    <Link to="/" className="logo-text">
      Face<em>Card</em>
    </Link>
  );
}