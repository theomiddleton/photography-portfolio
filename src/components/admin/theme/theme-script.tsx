'use client'

import { defaultLightThemeStyles, defaultDarkThemeStyles } from '~/lib/theme/default-themes'

export function ThemeScript() {
  const scriptContent = `
    (function() {
      const storageKey = "editor-storage";
      const root = document.documentElement;
      const defaultLightStyles = ${JSON.stringify(defaultLightThemeStyles)};
      const defaultDarkStyles = ${JSON.stringify(defaultDarkThemeStyles)};

      let themeState = null;
      try {
        const persistedStateJSON = localStorage.getItem(storageKey);
        if (persistedStateJSON) {
          themeState = JSON.parse(persistedStateJSON)?.state?.themeState;
        }
      } catch (e) {
        console.warn("Theme initialization: Failed to read/parse localStorage:", e);
      }

      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const mode = themeState?.currentMode ?? (prefersDark ? "dark" : "light");

      const activeStyles =
        mode === "dark"
          ? themeState?.styles?.dark || defaultDarkStyles
          : themeState?.styles?.light || defaultLightStyles;

      const stylesToApply = Object.keys(defaultLightStyles);

      for (const styleName of stylesToApply) {
        const value = activeStyles[styleName];
        if (value !== undefined) {
          root.style.setProperty(\`--\${styleName}\`, value);
        }
      }

      // Update theme class
      if (mode === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    })();
  `

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: scriptContent
      }}
    />
  )
}