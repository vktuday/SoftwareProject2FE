const productImageMap = {
//OILY
  "La Roche-Posay Effaclar Purifying Foaming Gel": "/images/products/effaclar-gel.jpg",
  "Biore UV Aqua Rich Watery Essence": "/images/products/biore-uv.jpg",
  "Innisfree No Sebum Mineral Powder": "/images/products/innisfree-no-sebum.jpg",
  "Shiseido Waso Quick Matte Moisturizer": "/images/products/shiseido-waso-matte.jpg",
  "Caudalie Vinopure Purifying Gel Cleanser": "/images/products/caudalie-vinopure.jpg",
  "Bioderma Sébium Foaming Gel": "/images/products/bioderma-sebium.jpg",
  "COSRX Oil-Free Ultra-Moisturizing Lotion": "/images/products/cosrx-oil-free.jpg",
//DRY
  "La Roche-Posay Lipikar Baume AP+M": "/images/products/lipikar-baume.jpg",
  "Pond's Rejuveness Anti-Wrinkle Cream": "/images/products/ponds-rejuveness.jpg",
  "Beauty of Joseon Dynasty Cream": "/images/products/beauty-of-joseon-dynasty.jpg",
  "Shiseido Essential Energy Hydrating Cream": "/images/products/shiseido-essential-energy.jpg",
  "Caudalie Vinosource-Hydra Moisturizing Cream": "/images/products/caudalie-vinosource.jpg",
  "Hada Labo Gokujyun Hyaluronic Acid Lotion": "/images/products/hada-labo-gokujyun.jpg",
  "SK-II Skinpower Cream": "/images/products/skii-skinpower.jpg",
  "Laneige Water Bank Blue Hyaluronic Cream": "/images/products/laneige-water-bank.jpg",
//COMBINATION
  "Avène Cleanance Hydra Soothing Cream": "/images/products/avene-cleanance-hydra.jpg",
  "Innisfree Green Tea Seed Serum": "/images/products/innisfree-green-tea-seed.jpg",
  "Biore Deep Pore Charcoal Cleanser": "/images/products/biore-charcoal-cleanser.jpg",
  "Beauty of Joseon Glow Serum": "/images/products/beauty-of-joseon-glow.jpg",
  "Hada Labo Shirojyun Whitening Lotion": "/images/products/hada-labo-shirojyun.jpg",
  "SK-II Facial Treatment Essence": "/images/products/skii-facial-treatment.jpg",
  "Laneige Water Sleeping Mask": "/images/products/laneige-water-sleeping-mask.jpg",
//SENSITIVE
  "La Roche-Posay Toleriane Hydrating Gentle Cleanser": "/images/products/toleriane-cleanser.jpg",
  "Dr. Belmeur Daily Repair Moisturizer": "/images/products/dr-belmeur-daily-repair.jpg",
  "Avène Thermal Spring Water Spray": "/images/products/avene-thermal-spring.jpg",
  "Shiseido Ultimune Power Infusing Concentrate": "/images/products/shiseido-ultimune.jpg",
  "Bioderma Sensibio H2O Micellar Water": "/images/products/bioderma-sensibio-h2o.jpg",
  "COSRX Low pH Good Morning Gel Cleanser": "/images/products/cosrx-low-ph.jpg",
  "Etude House SoonJung 2x Barrier Intensive Cream": "/images/products/etude-soonjung-barrier.jpg",
};

export function getProductImage(productName) {
  return productImageMap[productName] || null;
}

export default productImageMap;