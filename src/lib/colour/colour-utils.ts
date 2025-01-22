// Types for RGB and HSL colour representations
export interface RGBColour {
  r: number  // Red component (0-255)
  g: number  // Green component (0-255)
  b: number  // Blue component (0-255)
}

export interface HSLColour {
  h: number  // Hue (0-360 degrees)
  s: number  // Saturation (0-100%)
  l: number  // Lightness (0-100%)
}

/**
 * Converts an RGB colour to HSL (Hue, Saturation, Lightness) colour space
 * This conversion is useful for sorting colours in a more perceptually meaningful way
 * 
 * @param rgb - The RGB colour to convert
 * @returns The colour in HSL format
 * 
 * The conversion process:
 * 1. Normalize RGB values to 0-1 range
 * 2. Find the maximum and minimum values to determine lightness
 * 3. Calculate saturation based on lightness
 * 4. Calculate hue based on which RGB component is dominant
 * 5. Convert the results to standard HSL ranges (H: 0-360, S: 0-100, L: 0-100)
 */
export function rgbToHsl(rgb: RGBColour): HSLColour {
  // Normalize RGB values to 0-1 range
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  // Find the maximum and minimum values to determine lightness
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  // Lightness is the average of max and min
  const l = (max + min) / 2

  // Only calculate saturation and hue if the colour isn't grey (where max equals min)
  if (max !== min) {
    // Calculate saturation
    const d = max - min
    // Saturation calculation depends on lightness
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    // Calculate hue based on which RGB component is dominant
    switch (max) {
      case r:
        // Red is dominant - calculate between green and blue
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        // Green is dominant - calculate between blue and red
        h = (b - r) / d + 2
        break
      case b:
        // Blue is dominant - calculate between red and green
        h = (r - g) / d + 4
        break
    }
    // Convert hue to 0-1 range
    h /= 6
  }

  // Convert to standard HSL ranges:
  // Hue: 0-360 degrees
  // Saturation: 0-100%
  // Lightness: 0-100%
  return { 
    h: h * 360,  // Convert hue to degrees
    s: s * 100,  // Convert saturation to percentage
    l: l * 100   // Convert lightness to percentage
  }
}

