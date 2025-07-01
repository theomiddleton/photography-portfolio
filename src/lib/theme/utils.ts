// Utility to extract HSL color values from a CSS variable string
// Returns a string like 'hsl(240 100% 50%)' or fallback

export function extractHslColor(
  cssVariables: string,
  varName: string,
  fallback = '#000',
): string {
  const match = cssVariables.match(new RegExp(`${varName}:\\s*([^;]+)`, 'i'))
  return match ? `hsl(${match[1]!.trim()})` : fallback
}
