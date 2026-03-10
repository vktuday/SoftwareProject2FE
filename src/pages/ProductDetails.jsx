import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { Link, useParams } from "react-router-dom";
import "./ProductDetails.css";

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

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setError("");
      setLoading(true);
      try {
        const data = await apiRequest(`/api/products/${id}`, { method: "GET" });
        setProduct(data.product);
      } catch (err) {
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <div className="product-wrap">
      <Link className="product-back" to="/products">
        Back to products
      </Link>

      {loading && <p style={{ color: "#888" }}>Loading...</p>}

      {error && (
        <div style={{ background: "#ffe5e5", border: "1px solid #ffb3b3", padding: "12px 16px", borderRadius: 10, color: "#c00", fontSize: 14 }}>
          {error}
        </div>
      )}

      {product && (
        <div className="product-card">
          <div className="product-inner">
            {/* Image panel */}
            <div className="product-img-panel">
              <img className="product-img" src={NO_IMAGE} alt="No product image" />
            </div>

            {/* Info panel */}
            <div className="product-info">
              <p className="product-category">Skincare</p>
              <h1 className="product-name">{product.name}</h1>

              <div className="product-meta">
                <span className="badge badge-red">{product.brand}</span>
                <span className="badge badge-violet">{product.skinType}</span>
              </div>

              <div className="product-divider" />

              <div className="product-desc">{product.description}</div>

              <div className="product-cta">
                <button className="btn-add-to-bag">Add to Bag</button>
                <button className="btn-wishlist">♡</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}