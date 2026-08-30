import { createContext, useContext, useState, useEffect } from 'react';

export const COLOR_THEMES = [
  {
    id: 'veo_onyx',
    name: 'Veo Onyx',
    desc: 'Default - charcoal & soft white',
    color: '#e4e4e7',
    primary: '#10a37f',
    accent: '#10a37f',
    hover: '#0e8b6d',
    subtle: 'rgba(16, 163, 127, 0.15)',
    gradient: 'linear-gradient(135deg, #10a37f, #059669)',
  },
  {
    id: 'ocean_blue',
    name: 'Ocean Blue',
    desc: 'Clear & confident',
    color: '#38bdf8',
    primary: '#0284c7',
    accent: '#38bdf8',
    hover: '#0369a1',
    subtle: 'rgba(56, 189, 248, 0.15)',
    gradient: 'linear-gradient(135deg, #38bdf8, #0284c7)',
  },
  {
    id: 'midnight_azure',
    name: 'Midnight Azure',
    desc: 'Deep blue & luminous',
    color: '#3b82f6',
    primary: '#2563eb',
    accent: '#60a5fa',
    hover: '#1d4ed8',
    subtle: 'rgba(59, 130, 246, 0.15)',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  },
  {
    id: 'graphite_studio',
    name: 'Graphite Studio',
    desc: 'Graphite & violet',
    color: '#a855f7',
    primary: '#8b5cf6',
    accent: '#c084fc',
    hover: '#7c3aed',
    subtle: 'rgba(168, 85, 247, 0.15)',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  },
  {
    id: 'copper_slate',
    name: 'Copper Slate',
    desc: 'Mineral gray & copper',
    color: '#ea580c',
    primary: '#ea580c',
    accent: '#f97316',
    hover: '#c2410c',
    subtle: 'rgba(234, 88, 12, 0.15)',
    gradient: 'linear-gradient(135deg, #ea580c, #c2410c)',
  },
  {
    id: 'ember_orange',
    name: 'Ember Orange',
    desc: 'Warm & focused',
    color: '#f97316',
    primary: '#f97316',
    accent: '#fb923c',
    hover: '#ea580c',
    subtle: 'rgba(249, 115, 22, 0.15)',
    gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
  },
  {
    id: 'sunlit_yellow',
    name: 'Sunlit Yellow',
    desc: 'Bright & optimistic',
    color: '#eab308',
    primary: '#eab308',
    accent: '#facc15',
    hover: '#ca8a04',
    subtle: 'rgba(234, 179, 8, 0.15)',
    gradient: 'linear-gradient(135deg, #eab308, #ca8a04)',
  },
  {
    id: 'grove_green',
    name: 'Grove Green',
    desc: 'Calm & grounded',
    color: '#10b981',
    primary: '#10b981',
    accent: '#34d399',
    hover: '#059669',
    subtle: 'rgba(16, 185, 129, 0.15)',
    gradient: 'linear-gradient(135deg, #10b981, #047857)',
  },
  {
    id: 'studio_rose',
    name: 'Studio Rose',
    desc: 'Expressive & warm',
    color: '#f43f5e',
    primary: '#f43f5e',
    accent: '#fb7185',
    hover: '#e11d48',
    subtle: 'rgba(244, 63, 94, 0.15)',
    gradient: 'linear-gradient(135deg, #f43f5e, #be123c)',
  },
  {
    id: 'signal_red',
    name: 'Signal Red',
    desc: 'Crisp & high-impact',
    color: '#ef4444',
    primary: '#ef4444',
    accent: '#f87171',
    hover: '#dc2626',
    subtle: 'rgba(239, 68, 68, 0.15)',
    gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)',
  },
  {
    id: 'barbie_pink',
    name: 'Barbie Pink',
    desc: 'Vibrant & playful',
    color: '#ec4899',
    primary: '#ec4899',
    accent: '#f472b6',
    hover: '#db2777',
    subtle: 'rgba(236, 72, 153, 0.15)',
    gradient: 'linear-gradient(135deg, #ec4899, #be185d)',
  },
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('finsolve_theme') || 'dark';
  });

  const [colorTheme, setColorTheme] = useState(() => {
    return localStorage.getItem('finsolve_color_theme') || 'veo_onyx';
  });

  useEffect(() => {
    localStorage.setItem('finsolve_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('finsolve_color_theme', colorTheme);
    document.documentElement.setAttribute('data-color-theme', colorTheme);
    const active = COLOR_THEMES.find((t) => t.id === colorTheme) || COLOR_THEMES[0];
    document.documentElement.style.setProperty('--theme-accent', active.primary);
    document.documentElement.style.setProperty('--theme-accent-color', active.color);
    document.documentElement.style.setProperty('--theme-accent-hover', active.hover);
    document.documentElement.style.setProperty('--theme-accent-subtle', active.subtle);
    document.documentElement.style.setProperty('--theme-accent-gradient', active.gradient);
  }, [colorTheme, theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  function setMode(mode) {
    if (mode === 'light' || mode === 'dark') {
      setTheme(mode);
    }
  }

  const activeColorTheme = COLOR_THEMES.find((t) => t.id === colorTheme) || COLOR_THEMES[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        setMode,
        colorTheme,
        setColorTheme,
        activeColorTheme,
        COLOR_THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
