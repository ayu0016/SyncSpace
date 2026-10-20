/**
 * Convert a hex color string to an rgba() CSS value.
 * Accepts 3-char (#abc) or 6-char (#aabbcc) hex, with or without #.
 *
 * @param {string} hex - e.g. "#4a9eed" or "4a9eed"
 * @param {number} alpha - 0-1 opacity
 * @returns {string} e.g. "rgba(74,158,237,0.2)"
 */
export function hexToRgba(hex, alpha = 1) {
  let h = hex.replace('#', '')
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  }
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
