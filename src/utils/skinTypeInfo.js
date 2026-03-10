// Maps a skin type to an image + short description
export function getSkinTypeInfo(skinType) {
  const normalized = (skinType || "").toLowerCase();

  if (normalized === "oily") {
    return {
      title: "Oily Skin",
      description: "Your skin produces more oil, especially in the T-zone. Lightweight, oil-free products can help.",
      image: "/images/oily-skin-female.jpg",
    };
  }

  if (normalized === "dry") {
    return {
      title: "Dry Skin",
      description: "Your skin may feel tight or flaky. Gentle cleansers and rich moisturizers can support hydration.",
      image: "/images/dry-skin-female.jpg",
    };
  }

  if (normalized === "sensitive") {
    return {
      title: "Sensitive Skin",
      description: "Your skin may react easily. Fragrance-free, soothing products and patch testing can help reduce irritation.",
      image: "/images/sensitive-skin-female.webp",
    };
  }

  // Default: Combination
  return {
    title: "Combination Skin",
    description: "Your skin can be oily in some areas and dry in others. Balanced routines and targeted products can help.",
    image: "/images/combination-skin-female.jpg",
  };
}