export const FRAME_YELLOW = '#ffd500'

const CATEGORY_COLORS = {
  Geocaching: '#d01012',
  Education: '#0058a8',
  'Home Automation': '#1a8a3c',
}

export function hashHue(seed) {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return Math.abs(hash) % 360
}

export function categoryColor(category) {
  return CATEGORY_COLORS[category] ?? `hsl(${hashHue(category)}, 75%, 42%)`
}

export function seedGradient(seed) {
  const hue = hashHue(seed)
  return `linear-gradient(135deg, hsl(${hue}, 75%, 62%), hsl(${(hue + 40) % 360}, 75%, 48%))`
}
