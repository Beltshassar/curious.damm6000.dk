const CATEGORY_COLORS = {
  Geocaching: '#ff2bd6',
  Education: '#2bf0ff',
  'Home Automation': '#39ff84',
}

export function hashHue(seed) {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return Math.abs(hash) % 360
}

export function categoryColor(category) {
  return CATEGORY_COLORS[category] ?? `hsl(${hashHue(category)}, 85%, 60%)`
}

export function seedGradient(seed) {
  const hue = hashHue(seed)
  return `linear-gradient(135deg, hsl(${hue}, 70%, 22%), hsl(${(hue + 40) % 360}, 70%, 12%))`
}
