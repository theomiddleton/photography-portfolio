export interface ThemePreset {
  name: string
  cssVariables: string
  description: string
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'Default Light',
    description: 'Clean and modern light theme',
    cssVariables: `
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}
`.trim(),
  },
  {
    name: 'Dark Mode',
    description: 'Sleek dark theme for low-light environments',
    cssVariables: `
:root {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 84% 4.9%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
  --radius: 0.5rem;
}
`.trim(),
  },
  {
    name: 'Forest Green',
    description: 'Calm and natural green theme',
    cssVariables: `
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 142.1 76.2% 36.3%;
  --primary-foreground: 355.7 100% 97.3%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 142.1 76.2% 36.3%;
  --radius: 0.5rem;
}
`.trim(),
  },
  {
    name: 'Ocean Blue',
    description: 'Professional blue theme',
    cssVariables: `
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 200.4 98% 39.4%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 200.4 98% 39.4%;
  --radius: 0.5rem;
}
`.trim(),
  },
  {
    name: 'Sunset Orange',
    description: 'Warm and energetic orange theme',
    cssVariables: `
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 24.6 95% 53.1%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 24.6 95% 53.1%;
  --radius: 0.5rem;
}
`.trim(),
  },
  {
    name: 'Royal Purple',
    description: 'Elegant purple theme',
    cssVariables: `
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 262.1 83.3% 57.8%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 262.1 83.3% 57.8%;
  --radius: 0.5rem;
}
`.trim(),
  },
  {
    name: 'Rose Gold',
    description: 'Soft and sophisticated rose theme',
    cssVariables: `
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 346.8 77.2% 49.8%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 346.8 77.2% 49.8%;
  --radius: 0.5rem;
}
`.trim(),
  },
  {
    name: 'Neutral Gray',
    description: 'Minimalist gray theme',
    cssVariables: `
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 10%;
  --radius: 0.5rem;
}
`.trim(),
  },
  {
    name: 'Midnight Blue',
    description: 'Deep blue dark theme',
    cssVariables: `
:root {
  --background: 224 71.4% 4.1%;
  --foreground: 210 20% 98%;
  --card: 224 71.4% 4.1%;
  --card-foreground: 210 20% 98%;
  --popover: 224 71.4% 4.1%;
  --popover-foreground: 210 20% 98%;
  --primary: 210 20% 98%;
  --primary-foreground: 220.9 39.3% 11%;
  --secondary: 215 27.9% 16.9%;
  --secondary-foreground: 210 20% 98%;
  --muted: 215 27.9% 16.9%;
  --muted-foreground: 217.9 10.6% 64.9%;
  --accent: 215 27.9% 16.9%;
  --accent-foreground: 210 20% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 20% 98%;
  --border: 215 27.9% 16.9%;
  --input: 215 27.9% 16.9%;
  --ring: 216 12.2% 83.9%;
  --radius: 0.5rem;
}
`.trim(),
  },
  {
    name: 'Emerald Green',
    description: 'Rich emerald theme',
    cssVariables: `
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 160.1 84.1% 39.4%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 160.1 84.1% 39.4%;
  --radius: 0.5rem;
}
`.trim(),
  },
  {
    name: 'Tailwind v4 Green',
    description: 'Modern green theme with enhanced Tailwind v4 variables',
    cssVariables: `
:root {
  --background: hsl(150.0000 8.3333% 95.2941%);
  --foreground: hsl(240 5.2632% 26.0784%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(240 5.2632% 26.0784%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(240 5.2632% 26.0784%);
  --primary: hsl(142.1 76.2% 36.3%);
  --primary-foreground: hsl(355.7 100% 97.3%);
  --secondary: hsl(240 4.7619% 95.8824%);
  --secondary-foreground: hsl(240 5.2632% 26.0784%);
  --muted: hsl(240 4.7619% 95.8824%);
  --muted-foreground: hsl(240 3.8298% 46.0784%);
  --accent: hsl(142.1 70% 45%);
  --accent-foreground: hsl(150.0000 8.3333% 95.2941%);
  --destructive: hsl(0 72.2222% 50.5882%);
  --destructive-foreground: hsl(150.0000 8.3333% 95.2941%);
  --border: hsl(240 4.8780% 83.9216%);
  --input: hsl(150.0000 8.3333% 95.2941%);
  --ring: hsl(142.1 70% 45%);
  --chart-1: hsl(142.1 76.2% 36.3%);
  --chart-2: hsl(142.1 70% 45%);
  --chart-3: hsl(142.1 65% 55%);
  --chart-4: hsl(142.1 60% 65%);
  --chart-5: hsl(150.0000 8.3333% 95.2941%);
  --sidebar: hsl(0 0% 97.2549%);
  --sidebar-foreground: hsl(240 5.2632% 26.0784%);
  --sidebar-primary: hsl(142.1 76.2% 36.3%);
  --sidebar-primary-foreground: hsl(355.7 100% 97.3%);
  --sidebar-accent: hsl(142.1 70% 45%);
  --sidebar-accent-foreground: hsl(150.0000 8.3333% 95.2941%);
  --sidebar-border: hsl(240 4.8780% 83.9216%);
  --sidebar-ring: hsl(142.1 70% 45%);
  --font-sans: Inter, sans-serif;
  --font-serif: Lora, serif;
  --font-mono: Menlo, monospace;
  --radius: 0.5rem;
  --shadow-2xs: 0.125rem 0.25rem 0.75rem 0rem hsl(0 0% 0% / 0.05);
  --shadow-xs: 0.125rem 0.25rem 0.75rem 0rem hsl(0 0% 0% / 0.05);
  --shadow-sm: 0.125rem 0.25rem 0.75rem 0rem hsl(0 0% 0% / 0.10), 0.125rem 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow: 0.125rem 0.25rem 0.75rem 0rem hsl(0 0% 0% / 0.10), 0.125rem 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow-md: 0.125rem 0.25rem 0.75rem 0rem hsl(0 0% 0% / 0.10), 0.125rem 2px 4px -1px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0.125rem 0.25rem 0.75rem 0rem hsl(0 0% 0% / 0.10), 0.125rem 4px 6px -1px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0.125rem 0.25rem 0.75rem 0rem hsl(0 0% 0% / 0.10), 0.125rem 8px 10px -1px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0.125rem 0.25rem 0.75rem 0rem hsl(0 0% 0% / 0.25);
}

.dark {
  --background: hsl(240 10.0000% 3.9216%);
  --foreground: hsl(214.2857 31.8182% 91.3725%);
  --card: hsl(240 9.0909% 12.9412%);
  --card-foreground: hsl(214.2857 31.8182% 91.3725%);
  --popover: hsl(240 9.0909% 12.9412%);
  --popover-foreground: hsl(214.2857 31.8182% 91.3725%);
  --primary: hsl(142.1 76.2% 36.3%);
  --primary-foreground: hsl(355.7 100% 97.3%);
  --secondary: hsl(240 5.2023% 33.9216%);
  --secondary-foreground: hsl(214.2857 31.8182% 91.3725%);
  --muted: hsl(240 3.7037% 15.8824%);
  --muted-foreground: hsl(240 5.0279% 64.9020%);
  --accent: hsl(142.1 70% 45%);
  --accent-foreground: hsl(240 10.0000% 3.9216%);
  --destructive: hsl(0 84.2365% 60.1961%);
  --destructive-foreground: hsl(240 10.0000% 3.9216%);
  --border: hsl(240 5.2632% 26.0784%);
  --input: hsl(240 9.0909% 12.9412%);
  --ring: hsl(142.1 70% 45%);
  --chart-1: hsl(142.1 76.2% 36.3%);
  --chart-2: hsl(142.1 70% 45%);
  --chart-3: hsl(142.1 65% 55%);
  --chart-4: hsl(142.1 60% 65%);
  --chart-5: hsl(150.0000 8.3333% 95.2941%);
  --sidebar: hsl(240 8.6957% 9.0196%);
  --sidebar-foreground: hsl(214.2857 31.8182% 91.3725%);
  --sidebar-primary: hsl(142.1 76.2% 36.3%);
  --sidebar-primary-foreground: hsl(355.7 100% 97.3%);
  --sidebar-accent: hsl(142.1 70% 45%);
  --sidebar-accent-foreground: hsl(240 10.0000% 3.9216%);
  --sidebar-border: hsl(240 5.2632% 26.0784%);
  --sidebar-ring: hsl(142.1 70% 45%);
  --font-sans: Inter, sans-serif;
  --font-serif: Lora, serif;
  --font-mono: Menlo, monospace;
  --radius: 0.5rem;
  --shadow-2xs: 0.125rem 0.25rem 0.75rem 0rem hsl(0 0% 0% / 0.05);
  --shadow-xs: 0.125rem 0.25rem 0.75rem 0rem hsl(0 0% 0% / 0.05);
  --shadow-sm: 0.125rem 0.25rem 0.75rem 0rem hsl(0 0% 0% / 0.10), 0.125rem 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow: 0.125rem 0.25rem 0.75rem 0rem hsl(0 0% 0% / 0.10), 0.125rem 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow-md: 0.125rem 0.25rem 0.75rem 0rem hsl(0 0% 0% / 0.10), 0.125rem 2px 4px -1px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0.125rem 0.25rem 0.75rem 0rem hsl(0 0% 0% / 0.10), 0.125rem 4px 6px -1px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0.125rem 0.25rem 0.75rem 0rem hsl(0 0% 0% / 0.10), 0.125rem 8px 10px -1px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0.125rem 0.25rem 0.75rem 0rem hsl(0 0% 0% / 0.25);
}
`.trim(),
  },
]

/**
 * Get preset theme by name
 */
export function getPresetByName(name: string): ThemePreset | undefined {
  return THEME_PRESETS.find((preset) => preset.name === name)
}

/**
 * Check if a theme name is a preset
 */
export function isPresetTheme(name: string): boolean {
  return THEME_PRESETS.some((preset) => preset.name === name)
}
