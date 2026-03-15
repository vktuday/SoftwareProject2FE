
export function getSkinTypeInfo(skinType, gender = "Female") {

  const type = (skinType || "").toLowerCase();
  const g = (gender || "Female").toLowerCase();

  const isMale = g === "male";

  // OILY SKIN
  if (type === "oily") {
    return {
      title: "Oily Skin",
      description:
        "Your skin produces excess oil, especially in the T-zone. Lightweight and oil-free products are recommended.",
      image: isMale
        ? "/images/oily skin male.jpg"
        : "/images/oily-skin-female.jpg",
    };
  }

  // DRY SKIN
  if (type === "dry") {
    return {
      title: "Dry Skin",
      description:
        "Dry skin can feel tight or flaky. Hydrating cleansers and moisturizers work best.",
      image: isMale
        ? "/images/dry skin male.jpeg"
        : "/images/dry-skin-female.jpg",
    };
  }

  // SENSITIVE SKIN
  if (type === "sensitive") {
    return {
      title: "Sensitive Skin",
      description:
        "Sensitive skin reacts easily to products or environment. Gentle and fragrance-free skincare is recommended.",
      image: isMale
        ? "/images/sensitive skin male.jpg"
        : "/images/sensitive-skin-female.webp",
    };
  }

  // COMBINATION SKIN
  if (type === "combination") {
    return {
      title: "Combination Skin",
      description:
        "Combination skin has both oily and dry areas. Balanced skincare routines are ideal.",
      image: isMale
        ? "/images/combination skin male.jpg"
        : "/images/combination-skin-female.jpg",
    };
  }

  // NORMAL SKIN (fallback)
  return {
    title: "Normal Skin",
    description:
      "Your skin is well balanced — not too oily and not too dry.",
    image: "/images/normal-skin-female.png",
  };
}