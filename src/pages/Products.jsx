import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { Link } from "react-router-dom";
import { getProductImage } from "../utils/productImageMap";
import "./Products.css";

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

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [skinFilter, setSkinFilter] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");

  const filteredProducts = products.filter((p) => {
    const term = search.trim().toLowerCase();
    const name = (p.name || "").toLowerCase();
    const brand = (p.brand || "").toLowerCase();
    const skin = (p.skinType || "").toLowerCase();
    const matchesSearch = !term || name.includes(term) || brand.includes(term) || skin.includes(term);
    const matchesSkinFilter = !skinFilter || skin === skinFilter.toLowerCase();
    return matchesSearch && matchesSkinFilter;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const nameA = (a.name || "").toLowerCase();
    const nameB = (b.name || "").toLowerCase();
    const brandA = (a.brand || "").toLowerCase();
    const brandB = (b.brand || "").toLowerCase();
    const skinA = (a.skinType || "").toLowerCase();
    const skinB = (b.skinType || "").toLowerCase();
    if (sortBy === "name-asc") return nameA.localeCompare(nameB);
    if (sortBy === "name-desc") return nameB.localeCompare(nameA);
    if (sortBy === "brand-asc") return brandA.localeCompare(brandB);
    if (sortBy === "skin-asc") return skinA.localeCompare(skinB);
    return 0;
  });

  useEffect(() => {
    async function load() {
      setError("");
      setLoading(true);
      try {
        const data = await apiRequest("/api/products", { method: "GET" });
        setProducts(data.products || []);
      } catch (err) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="products-wrap">
      {/* Page header */}
      <div className="products-page-header">
        <div>
          <h1 className="products-page-title">Products</h1>
          <p className="products-page-subtitle">Curated for your skin type</p>
        </div>
      </div>

      <div className="products-card">
        {/* Card header */}
        <div className="products-header">
          <h2 className="products-title">All Products</h2>
          <span className="badge" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>
            {products.length} items
          </span>
        </div>

        {/* Controls */}
        <div className="products-controls">
          <input
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, brand, or skin type..."
          />
          <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name-asc">Name (A–Z)</option>
            <option value="name-desc">Name (Z–A)</option>
            <option value="brand-asc">Brand (A–Z)</option>
            <option value="skin-asc">Skin Type (A–Z)</option>
          </select>
          <select className="filter-select" value={skinFilter} onChange={(e) => setSkinFilter(e.target.value)}>
            <option value="">All Skin Types</option>
            <option value="Oily">Oily</option>
            <option value="Dry">Dry</option>
            <option value="Combination">Combination</option>
            <option value="Sensitive">Sensitive</option>
          </select>
          <span className="badge">{sortedProducts.length} shown</span>
        </div>

        {loading && <div style={{ padding: "20px 24px", color: "#888" }}>Loading products...</div>}

        {error && (
          <div style={{ padding: "16px 24px", background: "#ffe5e5", color: "#c00", fontSize: 14 }}>{error}</div>
        )}

        {!loading && !error && sortedProducts.length === 0 && (
          <div style={{ padding: "20px 24px", color: "#888" }}>
            No products found{search.trim() ? " for your search." : "."}
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="products-table">
            {/* Header */}
            <div className="products-row">
              <div className="products-cell products-head">Image</div>
              <div className="products-cell products-head">Name</div>
              <div className="products-cell products-head">Brand</div>
              <div className="products-cell products-head">Skin Type</div>
              <div className="products-cell products-head">Details</div>
            </div>

            {/* Rows */}
            {sortedProducts.map((p) => (
              <div className="products-row" key={p._id}>
                <div className="products-cell">
                  <img className="thumb" src={getProductImage(p.name) || NO_IMAGE} alt={p.name}/>
                </div>
                <div className="products-cell">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                  </div>
                </div>
                <div className="products-cell" style={{ fontSize: 14 }}>{p.brand}</div>
                <div className="products-cell">
                  <span className="badge">{p.skinType}</span>
                </div>
                <div className="products-cell">
                  <Link className="details-link" to={`/products/${p._id}`}>
                    View details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}