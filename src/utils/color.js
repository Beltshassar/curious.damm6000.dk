export const FRAME_YELLOW = '#ffd500'

const CATEGORY_COLORS = {
  Geocaching: '#d01012',
  Education: '#0058a8',
  'Home Automation': '#1a8a3c',
}

// Placeholder art cycles through the same brand variables defined in style.css,
// so "no photo yet" cards always read as part of the LEGO-brick scheme rather
// than an arbitrary hue.
const PLACEHOLDER_VARS = ['--red', '--blue', '--green']

function hashString(seed) {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return Math.abs(hash)
}

export function hashHue(seed) {
  return hashString(seed) % 360
}

export function categoryColor(category) {
  return CATEGORY_COLORS[category] ?? `hsl(${hashHue(category)}, 75%, 42%)`
}

export function seedGradient(seed) {
  const index = hashString(seed)
  const from = PLACEHOLDER_VARS[index % PLACEHOLDER_VARS.length]
  const to = PLACEHOLDER_VARS[(index + 1) % PLACEHOLDER_VARS.length]
  return `linear-gradient(135deg, var(${from}), var(${to}))`
}
