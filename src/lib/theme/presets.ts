export interface ThemePreset {
  name: string
  cssVariables: string
  description: string
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'Default',
    description: 'Default theme',
    cssVariables: `
:root {
  --background: hsl(223.8136 -172.5242% 100.0000%);
  --foreground: hsl(223.8136 0.0000% 3.9388%);
  --card: hsl(223.8136 -172.5242% 100.0000%);
  --card-foreground: hsl(223.8136 0.0000% 3.9388%);
  --popover: hsl(223.8136 -172.5242% 100.0000%);
  --popover-foreground: hsl(223.8136 0.0000% 3.9388%);
  --primary: hsl(223.8136 0.0000% 9.0527%);
  --primary-foreground: hsl(223.8136 0.0004% 98.0256%);
  --secondary: hsl(223.8136 0.0002% 96.0587%);
  --secondary-foreground: hsl(223.8136 0.0000% 9.0527%);
  --muted: hsl(223.8136 0.0002% 96.0587%);
  --muted-foreground: hsl(223.8136 0.0000% 45.1519%);
  --accent: hsl(223.8136 0.0002% 96.0587%);
  --accent-foreground: hsl(223.8136 0.0000% 9.0527%);
  --destructive: hsl(351.7303 123.6748% 40.5257%);
  --destructive-foreground: hsl(223.8136 -172.5242% 100.0000%);
  --border: hsl(223.8136 0.0001% 89.8161%);
  --input: hsl(223.8136 0.0001% 89.8161%);
  --ring: hsl(223.8136 0.0000% 63.0163%);
  --chart-1: hsl(211.7880 101.9718% 78.6759%);
  --chart-2: hsl(217.4076 91.3672% 59.5787%);
  --chart-3: hsl(221.4336 86.3731% 54.0624%);
  --chart-4: hsl(223.6587 78.7180% 47.8635%);
  --chart-5: hsl(226.5426 70.0108% 39.9224%);
  --sidebar: hsl(223.8136 0.0004% 98.0256%);
  --sidebar-foreground: hsl(223.8136 0.0000% 3.9388%);
  --sidebar-primary: hsl(223.8136 0.0000% 9.0527%);
  --sidebar-primary-foreground: hsl(223.8136 0.0004% 98.0256%);
  --sidebar-accent: hsl(223.8136 0.0002% 96.0587%);
  --sidebar-accent-foreground: hsl(223.8136 0.0000% 9.0527%);
  --sidebar-border: hsl(223.8136 0.0001% 89.8161%);
  --sidebar-ring: hsl(223.8136 0.0000% 63.0163%);
  --radius: 0.625rem;
  --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
  --tracking-normal: 0em;
  --spacing: 0.25rem;
}

.dark {
  --background: hsl(223.8136 0.0000% 3.9388%);
  --foreground: hsl(223.8136 0.0004% 98.0256%);
  --card: hsl(223.8136 0.0000% 9.0527%);
  --card-foreground: hsl(223.8136 0.0004% 98.0256%);
  --popover: hsl(223.8136 0.0000% 14.9382%);
  --popover-foreground: hsl(223.8136 0.0004% 98.0256%);
  --primary: hsl(223.8136 0.0001% 89.8161%);
  --primary-foreground: hsl(223.8136 0.0000% 9.0527%);
  --secondary: hsl(223.8136 0.0000% 14.9382%);
  --secondary-foreground: hsl(223.8136 0.0004% 98.0256%);
  --muted: hsl(223.8136 0.0000% 14.9382%);
  --muted-foreground: hsl(223.8136 0.0000% 63.0163%);
  --accent: hsl(223.8136 0.0000% 25.0471%);
  --accent-foreground: hsl(223.8136 0.0004% 98.0256%);
  --destructive: hsl(358.7594 101.8439% 69.8357%);
  --destructive-foreground: hsl(223.8136 0.0004% 98.0256%);
  --border: hsl(223.8136 0.0000% 15.5096%);
  --input: hsl(223.8136 0.0000% 20.3885%);
  --ring: hsl(223.8136 0.0000% 45.1519%);
  --chart-1: hsl(211.7880 101.9718% 78.6759%);
  --chart-2: hsl(217.4076 91.3672% 59.5787%);
  --chart-3: hsl(221.4336 86.3731% 54.0624%);
  --chart-4: hsl(223.6587 78.7180% 47.8635%);
  --chart-5: hsl(226.5426 70.0108% 39.9224%);
  --sidebar: hsl(223.8136 0.0000% 9.0527%);
  --sidebar-foreground: hsl(223.8136 0.0004% 98.0256%);
  --sidebar-primary: hsl(225.3451 84.0953% 48.9841%);
  --sidebar-primary-foreground: hsl(223.8136 0.0004% 98.0256%);
  --sidebar-accent: hsl(223.8136 0.0000% 14.9382%);
  --sidebar-accent-foreground: hsl(223.8136 0.0004% 98.0256%);
  --sidebar-border: hsl(223.8136 0.0000% 15.5096%);
  --sidebar-ring: hsl(223.8136 0.0000% 32.1993%);
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  --radius: 0.625rem;
  --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
}
`.trim()
  },
  {
    name: 'Neutral',
    description: 'Neutral green/yellow theme',
    cssVariables: `
:root {
  --background: hsl(150.0000 8.3333% 95.2941%);
  --foreground: hsl(240 5.2632% 26.0784%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(240 5.2632% 26.0784%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(240 5.2632% 26.0784%);
  --primary: hsl(80.5714 23.8095% 71.1765%);
  --primary-foreground: hsl(240 10.0000% 3.9216%);
  --secondary: hsl(240 5.0279% 64.9020%);
  --secondary-foreground: hsl(240 5.2632% 26.0784%);
  --muted: hsl(240 4.7619% 95.8824%);
  --muted-foreground: hsl(240 3.8298% 46.0784%);
  --accent: hsl(81.5385 20.0000% 61.7647%);
  --accent-foreground: hsl(150.0000 8.3333% 95.2941%);
  --destructive: hsl(0 72.2222% 50.5882%);
  --destructive-foreground: hsl(150.0000 8.3333% 95.2941%);
  --border: hsl(240 4.8780% 83.9216%);
  --input: hsl(150.0000 8.3333% 95.2941%);
  --ring: hsl(81.5385 20.0000% 61.7647%);
  --chart-1: hsl(81.5385 20.0000% 61.7647%);
  --chart-2: hsl(80.5714 23.8095% 71.1765%);
  --chart-3: hsl(86.6667 19.1489% 81.5686%);
  --chart-4: hsl(87.6923 26.5306% 90.3922%);
  --chart-5: hsl(150.0000 8.3333% 95.2941%);
  --sidebar: hsl(0 0% 97.2549%);
  --sidebar-foreground: hsl(240 5.2632% 26.0784%);
  --sidebar-primary: hsl(80.5714 23.8095% 71.1765%);
  --sidebar-primary-foreground: hsl(240 10.0000% 3.9216%);
  --sidebar-accent: hsl(81.5385 20.0000% 61.7647%);
  --sidebar-accent-foreground: hsl(150.0000 8.3333% 95.2941%);
  --sidebar-border: hsl(240 4.8780% 83.9216%);
  --sidebar-ring: hsl(81.5385 20.0000% 61.7647%);
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
  --tracking-normal: 0.025em;
  --spacing: 0.25rem;
}

.dark {
  --background: hsl(240 10.0000% 3.9216%);
  --foreground: hsl(214.2857 31.8182% 91.3725%);
  --card: hsl(240 9.0909% 12.9412%);
  --card-foreground: hsl(214.2857 31.8182% 91.3725%);
  --popover: hsl(240 9.0909% 12.9412%);
  --popover-foreground: hsl(214.2857 31.8182% 91.3725%);
  --primary: hsl(80.5714 23.8095% 71.1765%);
  --primary-foreground: hsl(240 10.0000% 3.9216%);
  --secondary: hsl(240 5.2023% 33.9216%);
  --secondary-foreground: hsl(214.2857 31.8182% 91.3725%);
  --muted: hsl(240 3.7037% 15.8824%);
  --muted-foreground: hsl(240 5.0279% 64.9020%);
  --accent: hsl(81.5385 20.0000% 61.7647%);
  --accent-foreground: hsl(240 10.0000% 3.9216%);
  --destructive: hsl(0 84.2365% 60.1961%);
  --destructive-foreground: hsl(240 10.0000% 3.9216%);
  --border: hsl(240 5.2632% 26.0784%);
  --input: hsl(240 9.0909% 12.9412%);
  --ring: hsl(81.5385 20.0000% 61.7647%);
  --chart-1: hsl(81.5385 20.0000% 61.7647%);
  --chart-2: hsl(80.5714 23.8095% 71.1765%);
  --chart-3: hsl(86.6667 19.1489% 81.5686%);
  --chart-4: hsl(87.6923 26.5306% 90.3922%);
  --chart-5: hsl(150.0000 8.3333% 95.2941%);
  --sidebar: hsl(240 8.6957% 9.0196%);
  --sidebar-foreground: hsl(214.2857 31.8182% 91.3725%);
  --sidebar-primary: hsl(80.5714 23.8095% 71.1765%);
  --sidebar-primary-foreground: hsl(240 10.0000% 3.9216%);
  --sidebar-accent: hsl(81.5385 20.0000% 61.7647%);
  --sidebar-accent-foreground: hsl(240 10.0000% 3.9216%);
  --sidebar-border: hsl(240 5.2632% 26.0784%);
  --sidebar-ring: hsl(81.5385 20.0000% 61.7647%);
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
`.trim()
  },
  {
    name: 'Brutalist Mono',
    description: 'A monochrome brutalist theme',
    cssVariables: `
    :root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(0 0% 0%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(0 0% 0%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(0 0% 0%);
  --primary: hsl(0 0% 46.6667%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(0 0% 60%);
  --secondary-foreground: hsl(0 0% 0%);
  --muted: hsl(0 0% 83.1373%);
  --muted-foreground: hsl(0 0% 45.0980%);
  --accent: hsl(0 0% 54.1176%);
  --accent-foreground: hsl(0 0% 0%);
  --destructive: hsl(0 76.2557% 57.0588%);
  --destructive-foreground: hsl(0 0% 100%);
  --border: hsl(0 0% 78.4314%);
  --input: hsl(0 0% 83.1373%);
  --ring: hsl(0 0% 60%);
  --chart-1: hsl(255.1351 91.7355% 76.2745%);
  --chart-2: hsl(156.1983 71.5976% 66.8627%);
  --chart-3: hsl(43.2558 96.4126% 56.2745%);
  --chart-4: hsl(0 84.2365% 60.1961%);
  --chart-5: hsl(217.2193 91.2195% 59.8039%);
  --sidebar: hsl(0 0% 100%);
  --sidebar-foreground: hsl(0 0% 0%);
  --sidebar-primary: hsl(0 0% 46.6667%);
  --sidebar-primary-foreground: hsl(0 0% 100%);
  --sidebar-accent: hsl(0 0% 54.1176%);
  --sidebar-accent-foreground: hsl(0 0% 0%);
  --sidebar-border: hsl(0 0% 78.4314%);
  --sidebar-ring: hsl(0 0% 60%);
  --font-sans: Inter, sans-serif;
  --font-serif: Lora, serif;
  --font-mono: Menlo, monospace;
  --radius: 0rem;
  --shadow-2xs: 0px 2px 12px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0px 2px 12px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0px 2px 12px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow: 0px 2px 12px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow-md: 0px 2px 12px 0px hsl(0 0% 0% / 0.10), 0px 2px 4px -1px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0px 2px 12px 0px hsl(0 0% 0% / 0.10), 0px 4px 6px -1px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0px 2px 12px 0px hsl(0 0% 0% / 0.10), 0px 8px 10px -1px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0px 2px 12px 0px hsl(0 0% 0% / 0.25);
  --tracking-normal: 0.02em;
  --spacing: 0.25rem;
}

.dark {
  --background: hsl(0 0% 6.6667%);
  --foreground: hsl(0 0% 100%);
  --card: hsl(0 0% 13.3333%);
  --card-foreground: hsl(0 0% 100%);
  --popover: hsl(0 0% 13.3333%);
  --popover-foreground: hsl(0 0% 100%);
  --primary: hsl(0 0% 73.3333%);
  --primary-foreground: hsl(0 0% 0%);
  --secondary: hsl(0 0% 33.3333%);
  --secondary-foreground: hsl(0 0% 100%);
  --muted: hsl(0 0% 20%);
  --muted-foreground: hsl(0 0% 63.9216%);
  --accent: hsl(0 0% 54.1176%);
  --accent-foreground: hsl(0 0% 100%);
  --destructive: hsl(0 76.2557% 57.0588%);
  --destructive-foreground: hsl(0 0% 100%);
  --border: hsl(0 0% 20%);
  --input: hsl(0 0% 20%);
  --ring: hsl(0 0% 33.3333%);
  --chart-1: hsl(255.1351 91.7355% 76.2745%);
  --chart-2: hsl(156.1983 71.5976% 66.8627%);
  --chart-3: hsl(43.2558 96.4126% 56.2745%);
  --chart-4: hsl(0 84.2365% 60.1961%);
  --chart-5: hsl(217.2193 91.2195% 59.8039%);
  --sidebar: hsl(0 0% 13.3333%);
  --sidebar-foreground: hsl(0 0% 100%);
  --sidebar-primary: hsl(0 0% 73.3333%);
  --sidebar-primary-foreground: hsl(0 0% 0%);
  --sidebar-accent: hsl(0 0% 54.1176%);
  --sidebar-accent-foreground: hsl(0 0% 100%);
  --sidebar-border: hsl(0 0% 20%);
  --sidebar-ring: hsl(0 0% 33.3333%);
  --font-sans: Inter, sans-serif;
  --font-serif: Lora, serif;
  --font-mono: Menlo, monospace;
  --radius: 0rem;
  --shadow-2xs: 0px 2px 12px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0px 2px 12px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0px 2px 12px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow: 0px 2px 12px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow-md: 0px 2px 12px 0px hsl(0 0% 0% / 0.10), 0px 2px 4px -1px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0px 2px 12px 0px hsl(0 0% 0% / 0.10), 0px 4px 6px -1px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0px 2px 12px 0px hsl(0 0% 0% / 0.10), 0px 8px 10px -1px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0px 2px 12px 0px hsl(0 0% 0% / 0.25);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);

  --tracking-tighter: calc(var(--tracking-normal) - 0.05em);
  --tracking-tight: calc(var(--tracking-normal) - 0.025em);
  --tracking-normal: var(--tracking-normal);
  --tracking-wide: calc(var(--tracking-normal) + 0.025em);
  --tracking-wider: calc(var(--tracking-normal) + 0.05em);
  --tracking-widest: calc(var(--tracking-normal) + 0.1em);
}

body {
  letter-spacing: var(--tracking-normal);
}
  `.trim()
  },
  {
    name: 'Nature light',
    description: 'A light natural theme',
    cssVariables: `
    :root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(8.8889 27.8351% 19.0196%);
  --card: hsl(48.0000 45.4545% 97.8431%);
  --card-foreground: hsl(8.8889 27.8351% 19.0196%);
  --popover: hsl(37.5000 36.3636% 95.6863%);
  --popover-foreground: hsl(8.8889 27.8351% 19.0196%);
  --primary: hsl(123.0380 46.1988% 33.5294%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(124.6154 39.3939% 93.5294%);
  --secondary-foreground: hsl(124.4776 55.3719% 23.7255%);
  --muted: hsl(33.7500 34.7826% 90.9804%);
  --muted-foreground: hsl(15.0000 25.2874% 34.1176%);
  --accent: hsl(122 37.5000% 84.3137%);
  --accent-foreground: hsl(124.4776 55.3719% 23.7255%);
  --destructive: hsl(0 66.3866% 46.6667%);
  --destructive-foreground: hsl(0 0% 100%);
  --border: hsl(33.9130 27.0588% 83.3333%);
  --input: hsl(33.9130 27.0588% 83.3333%);
  --ring: hsl(123.0380 46.1988% 33.5294%);
  --chart-1: hsl(122.4242 39.4422% 49.2157%);
  --chart-2: hsl(122.7907 43.4343% 38.8235%);
  --chart-3: hsl(123.0380 46.1988% 33.5294%);
  --chart-4: hsl(124.4776 55.3719% 23.7255%);
  --chart-5: hsl(125.7143 51.2195% 8.0392%);
  --sidebar: hsl(33.7500 34.7826% 90.9804%);
  --sidebar-foreground: hsl(8.8889 27.8351% 19.0196%);
  --sidebar-primary: hsl(123.0380 46.1988% 33.5294%);
  --sidebar-primary-foreground: hsl(0 0% 100%);
  --sidebar-accent: hsl(122 37.5000% 84.3137%);
  --sidebar-accent-foreground: hsl(124.4776 55.3719% 23.7255%);
  --sidebar-border: hsl(33.9130 27.0588% 83.3333%);
  --sidebar-ring: hsl(123.0380 46.1988% 33.5294%);
  --font-sans: Montserrat, sans-serif;
  --font-serif: Merriweather, serif;
  --font-mono: Source Code Pro, monospace;
  --radius: 0.5rem;
  --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
  --tracking-normal: 0em;
  --spacing: 0.25rem;
}

.dark {
  --background: hsl(132.8571 20% 13.7255%);
  --foreground: hsl(32.7273 26.8293% 91.9608%);
  --card: hsl(124.6154 12.6214% 20.1961%);
  --card-foreground: hsl(32.7273 26.8293% 91.9608%);
  --popover: hsl(124.6154 12.6214% 20.1961%);
  --popover-foreground: hsl(32.7273 26.8293% 91.9608%);
  --primary: hsl(122.4242 39.4422% 49.2157%);
  --primary-foreground: hsl(125.7143 51.2195% 8.0392%);
  --secondary: hsl(115.3846 9.6296% 26.4706%);
  --secondary-foreground: hsl(114.0000 13.8889% 85.8824%);
  --muted: hsl(124.6154 12.6214% 20.1961%);
  --muted-foreground: hsl(34.7368 19.1919% 80.5882%);
  --accent: hsl(122.7907 43.4343% 38.8235%);
  --accent-foreground: hsl(32.7273 26.8293% 91.9608%);
  --destructive: hsl(0 66.3866% 46.6667%);
  --destructive-foreground: hsl(32.7273 26.8293% 91.9608%);
  --border: hsl(115.3846 9.6296% 26.4706%);
  --input: hsl(115.3846 9.6296% 26.4706%);
  --ring: hsl(122.4242 39.4422% 49.2157%);
  --chart-1: hsl(122.5714 38.4615% 64.3137%);
  --chart-2: hsl(122.8235 38.4615% 56.6667%);
  --chart-3: hsl(122.4242 39.4422% 49.2157%);
  --chart-4: hsl(122.5806 40.9692% 44.5098%);
  --chart-5: hsl(122.7907 43.4343% 38.8235%);
  --sidebar: hsl(132.8571 20% 13.7255%);
  --sidebar-foreground: hsl(32.7273 26.8293% 91.9608%);
  --sidebar-primary: hsl(122.4242 39.4422% 49.2157%);
  --sidebar-primary-foreground: hsl(125.7143 51.2195% 8.0392%);
  --sidebar-accent: hsl(122.7907 43.4343% 38.8235%);
  --sidebar-accent-foreground: hsl(32.7273 26.8293% 91.9608%);
  --sidebar-border: hsl(115.3846 9.6296% 26.4706%);
  --sidebar-ring: hsl(122.4242 39.4422% 49.2157%);
  --font-sans: Montserrat, sans-serif;
  --font-serif: Merriweather, serif;
  --font-mono: Source Code Pro, monospace;
  --radius: 0.5rem;
  --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);
}
    `.trim()
  },
  {
    name: 'Pastel',
    description: 'A soft violet theme',
    cssVariables: `
    :root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(240 10.0000% 3.9216%);
  --card: hsl(210 20.0000% 98.0392%);
  --card-foreground: hsl(240 10.0000% 3.9216%);
  --popover: hsl(210 20.0000% 98.0392%);
  --popover-foreground: hsl(240 10.0000% 3.9216%);
  --primary: hsl(252.5000 94.7368% 85.0980%);
  --primary-foreground: hsl(240 10.0000% 3.9216%);
  --secondary: hsl(240 4.7619% 95.8824%);
  --secondary-foreground: hsl(240 10.0000% 3.9216%);
  --muted: hsl(210 20.0000% 98.0392%);
  --muted-foreground: hsl(240 3.8298% 46.0784%);
  --accent: hsl(255.1351 91.7355% 76.2745%);
  --accent-foreground: hsl(240 4.7619% 95.8824%);
  --destructive: hsl(0 84.2365% 60.1961%);
  --destructive-foreground: hsl(240 4.7619% 95.8824%);
  --border: hsl(240 5.8824% 90%);
  --input: hsl(210 20.0000% 98.0392%);
  --ring: hsl(252.5000 94.7368% 85.0980%);
  --chart-1: hsl(255.1351 91.7355% 76.2745%);
  --chart-2: hsl(292.0313 91.4286% 72.5490%);
  --chart-3: hsl(198.4375 93.2039% 59.6078%);
  --chart-4: hsl(156.1983 71.5976% 66.8627%);
  --chart-5: hsl(43.2558 96.4126% 56.2745%);
  --sidebar: hsl(0 0% 100%);
  --sidebar-foreground: hsl(240 10.0000% 3.9216%);
  --sidebar-primary: hsl(252.5000 94.7368% 85.0980%);
  --sidebar-primary-foreground: hsl(240 4.7619% 95.8824%);
  --sidebar-accent: hsl(255.1351 91.7355% 76.2745%);
  --sidebar-accent-foreground: hsl(240 4.7619% 95.8824%);
  --sidebar-border: hsl(240 5.8824% 90%);
  --sidebar-ring: hsl(252.5000 94.7368% 85.0980%);
  --font-sans: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  --font-serif: ui-serif, Georgia, Cambria, Times New Roman, Times, serif;
  --font-mono: Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
  --radius: 0.5rem;
  --shadow-2xs: 0px 2px 12px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0px 2px 12px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0px 2px 12px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow: 0px 2px 12px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow-md: 0px 2px 12px 0px hsl(0 0% 0% / 0.10), 0px 2px 4px -1px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0px 2px 12px 0px hsl(0 0% 0% / 0.10), 0px 4px 6px -1px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0px 2px 12px 0px hsl(0 0% 0% / 0.10), 0px 8px 10px -1px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0px 2px 12px 0px hsl(0 0% 0% / 0.25);
  --tracking-normal: 0.025em;
  --spacing: 0.25rem;
}

.dark {
  --background: hsl(240 5.8824% 10%);
  --foreground: hsl(240 4.7619% 95.8824%);
  --card: hsl(240 3.7037% 15.8824%);
  --card-foreground: hsl(240 4.7619% 95.8824%);
  --popover: hsl(240 3.7037% 15.8824%);
  --popover-foreground: hsl(240 4.7619% 95.8824%);
  --primary: hsl(252.5000 94.7368% 85.0980%);
  --primary-foreground: hsl(240 10.0000% 3.9216%);
  --secondary: hsl(240 5.2023% 33.9216%);
  --secondary-foreground: hsl(240 4.7619% 95.8824%);
  --muted: hsl(240 3.7037% 15.8824%);
  --muted-foreground: hsl(240 5.0279% 64.9020%);
  --accent: hsl(255.1351 91.7355% 76.2745%);
  --accent-foreground: hsl(240 10.0000% 3.9216%);
  --destructive: hsl(0 84.2365% 60.1961%);
  --destructive-foreground: hsl(240 4.7619% 95.8824%);
  --border: hsl(240 5.2632% 26.0784%);
  --input: hsl(240 3.7037% 15.8824%);
  --ring: hsl(252.5000 94.7368% 85.0980%);
  --chart-1: hsl(255.1351 91.7355% 76.2745%);
  --chart-2: hsl(292.0313 91.4286% 72.5490%);
  --chart-3: hsl(198.4375 93.2039% 59.6078%);
  --chart-4: hsl(156.1983 71.5976% 66.8627%);
  --chart-5: hsl(43.2558 96.4126% 56.2745%);
  --sidebar: hsl(240 5.8824% 10%);
  --sidebar-foreground: hsl(240 4.7619% 95.8824%);
  --sidebar-primary: hsl(252.5000 94.7368% 85.0980%);
  --sidebar-primary-foreground: hsl(240 10.0000% 3.9216%);
  --sidebar-accent: hsl(255.1351 91.7355% 76.2745%);
  --sidebar-accent-foreground: hsl(240 10.0000% 3.9216%);
  --sidebar-border: hsl(240 5.2632% 26.0784%);
  --sidebar-ring: hsl(252.5000 94.7368% 85.0980%);
  --font-sans: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  --font-serif: ui-serif, Georgia, Cambria, Times New Roman, Times, serif;
  --font-mono: Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
  --radius: 0.5rem;
  --shadow-2xs: 0px 2px 12px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0px 2px 12px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0px 2px 12px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow: 0px 2px 12px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow-md: 0px 2px 12px 0px hsl(0 0% 0% / 0.10), 0px 2px 4px -1px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0px 2px 12px 0px hsl(0 0% 0% / 0.10), 0px 4px 6px -1px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0px 2px 12px 0px hsl(0 0% 0% / 0.10), 0px 8px 10px -1px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0px 2px 12px 0px hsl(0 0% 0% / 0.25);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);

  --tracking-tighter: calc(var(--tracking-normal) - 0.05em);
  --tracking-tight: calc(var(--tracking-normal) - 0.025em);
  --tracking-normal: var(--tracking-normal);
  --tracking-wide: calc(var(--tracking-normal) + 0.025em);
  --tracking-wider: calc(var(--tracking-normal) + 0.05em);
  --tracking-widest: calc(var(--tracking-normal) + 0.1em);
}

body {
  letter-spacing: var(--tracking-normal);
}
  `.trim()
  },
  {
    name: 'Brutalist Wine',
    description: '',
    cssVariables: `
:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(10 13.3333% 17.6471%);
  --card: hsl(0 25.0000% 96.8627%);
  --card-foreground: hsl(10 13.3333% 17.6471%);
  --popover: hsl(0 33.3333% 94.1176%);
  --popover-foreground: hsl(10 13.3333% 17.6471%);
  --primary: hsl(16.0465 39.8148% 42.3529%);
  --primary-foreground: hsl(0 33.3333% 97.0588%);
  --secondary: hsl(43.6364 20.0000% 78.4314%);
  --secondary-foreground: hsl(10 13.3333% 17.6471%);
  --muted: hsl(0 33.3333% 94.1176%);
  --muted-foreground: hsl(17.6471 8.2126% 40.5882%);
  --accent: hsl(9.0909 21.8543% 70.3922%);
  --accent-foreground: hsl(10 13.3333% 17.6471%);
  --destructive: hsl(0 84.2365% 60.1961%);
  --destructive-foreground: hsl(240 4.7619% 95.8824%);
  --border: hsl(28 40.5405% 7.2549%);
  --input: hsl(0 33.3333% 94.1176%);
  --ring: hsl(16.0465 39.8148% 42.3529%);
  --chart-1: hsl(255.1351 91.7355% 76.2745%);
  --chart-2: hsl(292.0313 91.4286% 72.5490%);
  --chart-3: hsl(198.4375 93.2039% 59.6078%);
  --chart-4: hsl(156.1983 71.5976% 66.8627%);
  --chart-5: hsl(43.2558 96.4126% 56.2745%);
  --sidebar: hsl(0 33.3333% 94.1176%);
  --sidebar-foreground: hsl(10 13.3333% 17.6471%);
  --sidebar-primary: hsl(16.0465 39.8148% 42.3529%);
  --sidebar-primary-foreground: hsl(0 33.3333% 94.1176%);
  --sidebar-accent: hsl(9.0909 21.8543% 70.3922%);
  --sidebar-accent-foreground: hsl(10 13.3333% 17.6471%);
  --sidebar-border: hsl(43.6364 20.0000% 78.4314%);
  --sidebar-ring: hsl(16.0465 39.8148% 42.3529%);
  --font-sans: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  --font-serif: ui-serif, Georgia, Cambria, Times New Roman, Times, serif;
  --font-mono: Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
  --radius: 0px;
  --shadow-2xs: 2px 2px 0px 0px hsl(28 40.5405% 7.2549% / 50.00);
  --shadow-xs: 2px 2px 0px 0px hsl(28 40.5405% 7.2549% / 50.00);
  --shadow-sm: 2px 2px 0px 0px hsl(28 40.5405% 7.2549% / 100.00), 2px 1px 2px -1px hsl(28 40.5405% 7.2549% / 100.00);
  --shadow: 2px 2px 0px 0px hsl(28 40.5405% 7.2549% / 100.00), 2px 1px 2px -1px hsl(28 40.5405% 7.2549% / 100.00);
  --shadow-md: 2px 2px 0px 0px hsl(28 40.5405% 7.2549% / 100.00), 2px 2px 4px -1px hsl(28 40.5405% 7.2549% / 100.00);
  --shadow-lg: 2px 2px 0px 0px hsl(28 40.5405% 7.2549% / 100.00), 2px 4px 6px -1px hsl(28 40.5405% 7.2549% / 100.00);
  --shadow-xl: 2px 2px 0px 0px hsl(28 40.5405% 7.2549% / 100.00), 2px 8px 10px -1px hsl(28 40.5405% 7.2549% / 100.00);
  --shadow-2xl: 2px 2px 0px 0px hsl(28 40.5405% 7.2549% / 250.00);
  --tracking-normal: 0.025em;
  --spacing: 0.25rem;
}

.dark {
  --background: hsl(28 40.5405% 7.2549%);
  --foreground: hsl(0 33.3333% 94.1176%);
  --card: hsl(24 14.2857% 13.7255%);
  --card-foreground: hsl(0 33.3333% 94.1176%);
  --popover: hsl(24 14.2857% 13.7255%);
  --popover-foreground: hsl(0 33.3333% 94.1176%);
  --primary: hsl(16.0465 39.8148% 42.3529%);
  --primary-foreground: hsl(0 33.3333% 94.1176%);
  --secondary: hsl(18.0000 6.8493% 28.6275%);
  --secondary-foreground: hsl(0 33.3333% 94.1176%);
  --muted: hsl(24 14.2857% 13.7255%);
  --muted-foreground: hsl(17.6471 8.4577% 60.5882%);
  --accent: hsl(9.0909 18.2320% 64.5098%);
  --accent-foreground: hsl(0 33.3333% 94.1176%);
  --destructive: hsl(0 84.2365% 60.1961%);
  --destructive-foreground: hsl(240 4.7619% 95.8824%);
  --border: hsl(0 33.3333% 94.1176%);
  --input: hsl(24 14.2857% 13.7255%);
  --ring: hsl(16.0465 39.8148% 42.3529%);
  --chart-1: hsl(255.1351 91.7355% 76.2745%);
  --chart-2: hsl(292.0313 91.4286% 72.5490%);
  --chart-3: hsl(198.4375 93.2039% 59.6078%);
  --chart-4: hsl(156.1983 71.5976% 66.8627%);
  --chart-5: hsl(43.2558 96.4126% 56.2745%);
  --sidebar: hsl(24 14.2857% 13.7255%);
  --sidebar-foreground: hsl(0 33.3333% 94.1176%);
  --sidebar-primary: hsl(16.0465 39.8148% 42.3529%);
  --sidebar-primary-foreground: hsl(0 33.3333% 94.1176%);
  --sidebar-accent: hsl(9.0909 18.2320% 64.5098%);
  --sidebar-accent-foreground: hsl(0 33.3333% 94.1176%);
  --sidebar-border: hsl(18.0000 6.8493% 28.6275%);
  --sidebar-ring: hsl(16.0465 39.8148% 42.3529%);
  --font-sans: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  --font-serif: ui-serif, Georgia, Cambria, Times New Roman, Times, serif;
  --font-mono: Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
  --radius: 0px;
  --shadow-2xs: 2px 2px 0px 0px hsl(0 33.3333% 94.1176% / 50.00);
  --shadow-xs: 2px 2px 0px 0px hsl(0 33.3333% 94.1176% / 50.00);
  --shadow-sm: 2px 2px 0px 0px hsl(0 33.3333% 94.1176% / 100.00), 2px 1px 2px -1px hsl(0 33.3333% 94.1176% / 100.00);
  --shadow: 2px 2px 0px 0px hsl(0 33.3333% 94.1176% / 100.00), 2px 1px 2px -1px hsl(0 33.3333% 94.1176% / 100.00);
  --shadow-md: 2px 2px 0px 0px hsl(0 33.3333% 94.1176% / 100.00), 2px 2px 4px -1px hsl(0 33.3333% 94.1176% / 100.00);
  --shadow-lg: 2px 2px 0px 0px hsl(0 33.3333% 94.1176% / 100.00), 2px 4px 6px -1px hsl(0 33.3333% 94.1176% / 100.00);
  --shadow-xl: 2px 2px 0px 0px hsl(0 33.3333% 94.1176% / 100.00), 2px 8px 10px -1px hsl(0 33.3333% 94.1176% / 100.00);
  --shadow-2xl: 2px 2px 0px 0px hsl(0 33.3333% 94.1176% / 250.00);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);

  --tracking-tighter: calc(var(--tracking-normal) - 0.05em);
  --tracking-tight: calc(var(--tracking-normal) - 0.025em);
  --tracking-normal: var(--tracking-normal);
  --tracking-wide: calc(var(--tracking-normal) + 0.025em);
  --tracking-wider: calc(var(--tracking-normal) + 0.05em);
  --tracking-widest: calc(var(--tracking-normal) + 0.1em);
}

body {
  letter-spacing: var(--tracking-normal);
}`.trim()
  }
]