import { useEffect, useMemo, useState } from "react";
import { apiRequest, getToken } from "../api";
import { Link, useParams } from "react-router-dom";
import { getProductImage } from "../utils/productImageMap";
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
  const [me, setMe] = useState(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [error, setError] = useState("");
  const isAuthed = !!getToken();

  const isFavorite = useMemo(() => {
    if (!me?.favorites || !product?._id) return false;
    return me.favorites.some((favorite) => favorite._id === product._id);
  }, [me, product]);

  async function loadCurrentUser() {
    if (!isAuthed) {
      setMe(null);
      setRole("");
      return;
    }
  
    try {
      const data = await apiRequest("/api/users/me", { method: "GET" });
      setMe(data.user);
      setRole("user");
    } catch {
      try {
        const trainerData = await apiRequest("/api/trainers/me", { method: "GET" });
        if (trainerData?.trainer) {
          setMe(null);
          setRole("trainer");
        } else {
          setMe(null);
          setRole("");
        }
      } catch {
        setMe(null);
        setRole("");
      }
    }
  }

  async function loadProduct() {
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

  async function handleFavoriteClick() {
    if (!isAuthed) {
      setError("Please log in first to save favorites");
      return;
    }

    if (!product?._id) return;

    setFavoriteLoading(true);
    setError("");

    try {
      if (isFavorite) {
        await apiRequest(`/api/users/me/favorites/${product._id}`, {
          method: "DELETE",
        });
      } else {
        await apiRequest(`/api/users/me/favorites/${product._id}`, {
          method: "POST",
        });
      }

      await loadCurrentUser();
    } catch (err) {
      setError(err.message || "Failed to update favorites");
    } finally {
      setFavoriteLoading(false);
    }
  }

  useEffect(() => {
    loadProduct();
    loadCurrentUser();
  }, [id]);

  return (
    <div className="product-wrap">
      <Link className="product-back" to="/products">
        Back to products
      </Link>

      {loading && <p style={{ color: "#888" }}>Loading...</p>}

      {error && (
        <div
          style={{
            background: "#ffe5e5",
            border: "1px solid #ffb3b3",
            padding: "12px 16px",
            borderRadius: 10,
            color: "#c00",
            fontSize: 14,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {product && (
        <div className="product-card">
          <div className="product-inner">
            <div className="product-img-panel">
              <img
                className="product-img"
                src={getProductImage(product.name) || NO_IMAGE}
                alt={product.name}
              />
            </div>

            <div className="product-info">
              <p className="product-category">Skincare</p>
              <h1 className="product-name">{product.name}</h1>

              <div className="product-meta">
                <span className="badge badge-red">{product.brand}</span>
                <span className="badge badge-violet">{product.skinType}</span>
              </div>

              <div className="product-divider" />

              <div className="product-desc">{product.description}</div>

              {role === "user" && (
                <div className="product-cta">
                  <button
                    className="btn-add-to-bag"
                    onClick={handleFavoriteClick}
                    disabled={favoriteLoading}
                  >
                    {favoriteLoading
                      ? "Updating..."
                      : isFavorite
                      ? "Remove from favorites"
                      : "Add to favorites"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}