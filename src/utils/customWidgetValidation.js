// ─── Reserved field labels (case-insensitive match) ────────────────────────────
export const RESERVED_LABELS = ['time', 'rating', 'notes', 'date']

/**
 * Check if all 3 fields are fully valid:
 * - Exactly 3 fields
 * - Non-empty trimmed label, 1-20 chars
 * - Labels unique within widget (case-insensitive)
 * - Labels do not collide with fixed fields ("time", "rating", "notes", "date")
 * - Choice fields have 2-6 unique options
 *
 * @param {Array} fields
 * @returns {boolean}
 */
export function validateFields(fields) {
  if (!fields || fields.length !== 3) return false
  const labels = []

  for (let i = 0; i < 3; i++) {
    const f = fields[i]
    if (!f) return false
    const label = (f.label || '').trim()
    if (label.length < 1 || label.length > 20) return false
    if (RESERVED_LABELS.includes(label.toLowerCase())) return false
    if (labels.includes(label.toLowerCase())) return false // duplicate
    labels.push(label.toLowerCase())
    if (!f.type) return false
    if (f.type === 'choice') {
      if (!f.options || f.options.length < 2 || f.options.length > 6) return false
      // check unique options
      const uniqueOpts = new Set(f.options.map(o => o.toLowerCase()))
      if (uniqueOpts.size !== f.options.length) return false
    }
  }
  return true
}

/**
 * Get per-field error messages (only for touched fields)
 */
export function getFieldError(field, index, allFields, touched) {
  if (!touched[index]) return null
  const label = (field.label || '').trim()
  if (!label) return 'Field name is required'
  if (label.length > 20) return 'Max 20 characters'
  if (RESERVED_LABELS.includes(label.toLowerCase())) return `"${label}" is a reserved name`
  // Check duplicates against other fields
  for (let i = 0; i < 3; i++) {
    if (i === index) continue
    const otherLabel = (allFields[i]?.label || '').trim()
    if (otherLabel && otherLabel.toLowerCase() === label.toLowerCase()) {
      return 'Duplicate field name'
    }
  }
  if (field.type === 'choice' && field.options) {
    if (field.options.length < 2) return 'At least 2 options required'
  }
  return null
}
