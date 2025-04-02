const getColor = (value, min, max) => {
  // Handle edge cases
  if (value <= min) return "rgb(34, 197, 94)"; // Tailwind green-500
  if (value >= max) return "rgb(239, 68, 68)"; // Tailwind red-500

  // Normalize value between 0 and 1
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));

  if (normalized <= 0.5) {
    // Green (low) to Orange (medium)
    const ratio = normalized / 0.5;
    return `rgb(${Math.round(34 + (249 - 34) * ratio)}, 
                ${Math.round(197 + (115 - 197) * ratio)}, 
                ${Math.round(94 + (22 - 94) * ratio)})`;
    // Interpolates from green-500 (rgb(34,197,94)) to orange-500 (rgb(249,115,22))
  } else {
    // Orange (medium) to Red (high)
    const ratio = (normalized - 0.5) / 0.5;
    return `rgb(${Math.round(249 + (239 - 249) * ratio)}, 
                ${Math.round(115 + (68 - 115) * ratio)}, 
                ${Math.round(22 + (68 - 22) * ratio)})`;
    // Interpolates from orange-500 (rgb(249,115,22)) to red-500 (rgb(239,68,68))
  }
};

export default getColor;
