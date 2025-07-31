-- Add the themes table to your database
-- This script creates the themes table with all necessary columns

CREATE TABLE IF NOT EXISTS pp_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  css_content TEXT NOT NULL,
  is_built_in BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN DEFAULT false NOT NULL,
  preview_colors JSONB,
  metadata JSONB,
  created_by INTEGER REFERENCES pp_users(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_themes_slug ON pp_themes(slug);
CREATE INDEX IF NOT EXISTS idx_themes_is_active ON pp_themes(is_active);
CREATE INDEX IF NOT EXISTS idx_themes_is_built_in ON pp_themes(is_built_in);

-- Insert default theme if it doesn't exist
INSERT INTO pp_themes (name, slug, description, css_content, is_built_in, is_active, preview_colors, metadata)
SELECT 
  'Default',
  'default',
  'The default shadcn/ui theme with clean, modern styling',
  '@tailwind base;
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
}',
  true,
  true,
  '{"primary": "#0f172a", "secondary": "#f1f5f9", "accent": "#f1f5f9", "background": "#ffffff", "foreground": "#0f172a"}',
  '{"shadcnCompatible": true, "supportsLightMode": true, "supportsDarkMode": true, "version": "1.0.0"}'
WHERE NOT EXISTS (SELECT 1 FROM pp_themes WHERE slug = 'default');