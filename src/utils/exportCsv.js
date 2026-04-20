/**
 * Converts an array of objects to a CSV file and triggers download.
 * Usage: exportToCsv(leadsArray, 'leads')
 */
export function exportToCsv(data, filename = 'export') {
  if (!data || data.length === 0) {
    alert('No data to export.')
    return
  }

  // Flatten nested objects (e.g., lead_sources.name → source)
  const flatten = (obj, prefix = '') => {
    return Object.keys(obj).reduce((acc, key) => {
      const value = obj[key]
      const newKey = prefix ? `${prefix}_${key}` : key
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(acc, flatten(value, newKey))
      } else {
        acc[newKey] = value
      }
      return acc
    }, {})
  }

  const flat = data.map(row => flatten(row))
  const headers = Object.keys(flat[0])
  const csvRows = [
    headers.join(','),
    ...flat.map(row =>
      headers.map(h => {
        const val = row[h] ?? ''
        // Wrap in quotes if it contains comma or newline
        return String(val).includes(',') ? `"${val}"` : val
      }).join(',')
    )
  ]

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}