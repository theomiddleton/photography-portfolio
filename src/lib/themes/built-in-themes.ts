// Built-in shadcn/ui themes with complete CSS
export const BUILT_IN_THEMES = [
  {
    name: 'Default',
    slug: 'default',
    description: 'The default shadcn/ui theme with clean, modern styling',
    previewColors: {
      primary: '#0f172a',
      secondary: '#f1f5f9',
      accent: '#f1f5f9',
      background: '#ffffff',
      foreground: '#0f172a',
    },
    cssContent: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
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
    --ring: 240 10% 3.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`,
  },
  {
    name: 'Slate',
    slug: 'slate',
    description: 'Cool, professional theme with slate blue tones',
    previewColors: {
      primary: '#334155',
      secondary: '#f1f5f9',
      accent: '#e2e8f0',
      background: '#ffffff',
      foreground: '#0f172a',
    },
    cssContent: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 212 84% 4%;
    --card: 0 0% 100%;
    --card-foreground: 212 84% 4%;
    --popover: 0 0% 100%;
    --popover-foreground: 212 84% 4%;
    --primary: 215 28% 17%;
    --primary-foreground: 210 20% 98%;
    --secondary: 210 40% 98%;
    --secondary-foreground: 215 28% 17%;
    --muted: 210 40% 98%;
    --muted-foreground: 215 16% 47%;
    --accent: 210 40% 98%;
    --accent-foreground: 215 28% 17%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 212 84% 4%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 212 84% 4%;
    --foreground: 210 20% 98%;
    --card: 212 84% 4%;
    --card-foreground: 210 20% 98%;
    --popover: 212 84% 4%;
    --popover-foreground: 210 20% 98%;
    --primary: 210 20% 98%;
    --primary-foreground: 215 28% 17%;
    --secondary: 217 33% 17%;
    --secondary-foreground: 210 20% 98%;
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    --accent: 217 33% 17%;
    --accent-foreground: 210 20% 98%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 217 33% 17%;
    --input: 217 33% 17%;
    --ring: 212 84% 4%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`,
  },
  {
    name: 'Rose',
    slug: 'rose',
    description: 'Warm, elegant theme with rose and pink accents',
    previewColors: {
      primary: '#e11d48',
      secondary: '#fdf2f8',
      accent: '#fce7f3',
      background: '#ffffff',
      foreground: '#881337',
    },
    cssContent: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 340 82% 52%;
    --card: 0 0% 100%;
    --card-foreground: 340 82% 52%;
    --popover: 0 0% 100%;
    --popover-foreground: 340 82% 52%;
    --primary: 346 77% 50%;
    --primary-foreground: 355 100% 97%;
    --secondary: 330 100% 98%;
    --secondary-foreground: 346 77% 50%;
    --muted: 330 100% 98%;
    --muted-foreground: 340 35% 57%;
    --accent: 330 100% 98%;
    --accent-foreground: 346 77% 50%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 333 57% 91%;
    --input: 333 57% 91%;
    --ring: 340 82% 52%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 340 82% 52%;
    --foreground: 355 100% 97%;
    --card: 340 82% 52%;
    --card-foreground: 355 100% 97%;
    --popover: 340 82% 52%;
    --popover-foreground: 355 100% 97%;
    --primary: 355 100% 97%;
    --primary-foreground: 346 77% 50%;
    --secondary: 339 69% 20%;
    --secondary-foreground: 355 100% 97%;
    --muted: 339 69% 20%;
    --muted-foreground: 340 35% 70%;
    --accent: 339 69% 20%;
    --accent-foreground: 355 100% 97%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 339 69% 20%;
    --input: 339 69% 20%;
    --ring: 340 82% 52%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`,
  },
  {
    name: 'Blue',
    slug: 'blue',
    description: 'Vibrant blue theme perfect for modern applications',
    previewColors: {
      primary: '#3b82f6',
      secondary: '#eff6ff',
      accent: '#dbeafe',
      background: '#ffffff',
      foreground: '#1e40af',
    },
    cssContent: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 84% 5%;
    --card: 0 0% 100%;
    --card-foreground: 222 84% 5%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 84% 5%;
    --primary: 221 83% 53%;
    --primary-foreground: 210 20% 98%;
    --secondary: 214 100% 97%;
    --secondary-foreground: 221 83% 53%;
    --muted: 214 100% 97%;
    --muted-foreground: 215 16% 47%;
    --accent: 214 100% 97%;
    --accent-foreground: 221 83% 53%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 213 27% 84%;
    --input: 213 27% 84%;
    --ring: 222 84% 5%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222 84% 5%;
    --foreground: 210 20% 98%;
    --card: 222 84% 5%;
    --card-foreground: 210 20% 98%;
    --popover: 222 84% 5%;
    --popover-foreground: 210 20% 98%;
    --primary: 210 20% 98%;
    --primary-foreground: 221 83% 53%;
    --secondary: 217 33% 17%;
    --secondary-foreground: 210 20% 98%;
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    --accent: 217 33% 17%;
    --accent-foreground: 210 20% 98%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 217 33% 17%;
    --input: 217 33% 17%;
    --ring: 222 84% 5%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`,
  },
  {
    name: 'Green',
    slug: 'green',
    description: 'Fresh green theme inspired by nature',
    previewColors: {
      primary: '#16a34a',
      secondary: '#f0fdf4',
      accent: '#dcfce7',
      background: '#ffffff',
      foreground: '#14532d',
    },
    cssContent: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 132 84% 5%;
    --card: 0 0% 100%;
    --card-foreground: 132 84% 5%;
    --popover: 0 0% 100%;
    --popover-foreground: 132 84% 5%;
    --primary: 142 76% 36%;
    --primary-foreground: 355 100% 97%;
    --secondary: 138 76% 97%;
    --secondary-foreground: 142 76% 36%;
    --muted: 138 76% 97%;
    --muted-foreground: 140 35% 47%;
    --accent: 138 76% 97%;
    --accent-foreground: 142 76% 36%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 140 35% 84%;
    --input: 140 35% 84%;
    --ring: 132 84% 5%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 132 84% 5%;
    --foreground: 355 100% 97%;
    --card: 132 84% 5%;
    --card-foreground: 355 100% 97%;
    --popover: 132 84% 5%;
    --popover-foreground: 355 100% 97%;
    --primary: 355 100% 97%;
    --primary-foreground: 142 76% 36%;
    --secondary: 142 33% 17%;
    --secondary-foreground: 355 100% 97%;
    --muted: 142 33% 17%;
    --muted-foreground: 140 35% 70%;
    --accent: 142 33% 17%;
    --accent-foreground: 355 100% 97%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 142 33% 17%;
    --input: 142 33% 17%;
    --ring: 132 84% 5%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`,
  },
  {
    name: 'Orange',
    slug: 'orange',
    description: 'Energetic orange theme for bold, creative sites',
    previewColors: {
      primary: '#ea580c',
      secondary: '#fff7ed',
      accent: '#fed7aa',
      background: '#ffffff',
      foreground: '#9a3412',
    },
    cssContent: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 20 84% 5%;
    --card: 0 0% 100%;
    --card-foreground: 20 84% 5%;
    --popover: 0 0% 100%;
    --popover-foreground: 20 84% 5%;
    --primary: 20 91% 48%;
    --primary-foreground: 60 9% 98%;
    --secondary: 33 100% 96%;
    --secondary-foreground: 20 91% 48%;
    --muted: 33 100% 96%;
    --muted-foreground: 25 35% 47%;
    --accent: 33 100% 96%;
    --accent-foreground: 20 91% 48%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 25 35% 84%;
    --input: 25 35% 84%;
    --ring: 20 84% 5%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 20 84% 5%;
    --foreground: 60 9% 98%;
    --card: 20 84% 5%;
    --card-foreground: 60 9% 98%;
    --popover: 20 84% 5%;
    --popover-foreground: 60 9% 98%;
    --primary: 60 9% 98%;
    --primary-foreground: 20 91% 48%;
    --secondary: 25 33% 17%;
    --secondary-foreground: 60 9% 98%;
    --muted: 25 33% 17%;
    --muted-foreground: 25 35% 70%;
    --accent: 25 33% 17%;
    --accent-foreground: 60 9% 98%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 25 33% 17%;
    --input: 25 33% 17%;
    --ring: 20 84% 5%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`,
  },
]