import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ColorPalette {
  id: number;
  name: string;
  displayName: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  ring: string;
}

interface ThemeContextType {
  currentPalette: ColorPalette | null;
  availablePalettes: ColorPalette[];
  changePalette: (paletteName: string) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentPalette, setCurrentPalette] = useState<ColorPalette | null>(null);
  const [availablePalettes, setAvailablePalettes] = useState<ColorPalette[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPalettes();
  }, []);

  const loadPalettes = async () => {
    try {
      const response = await fetch('/api/color-palettes');
      const palettes = await response.json();
      setAvailablePalettes(palettes);
      
      // Load user's saved palette or default to first one
      const savedPalette = localStorage.getItem('selectedPalette') || 'microsoft';
      const palette = palettes.find((p: ColorPalette) => p.name === savedPalette) || palettes[0];
      
      if (palette) {
        setCurrentPalette(palette);
        applyPalette(palette);
      }
    } catch (error) {
      console.error('Failed to load color palettes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyPalette = (palette: ColorPalette) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--color-primary', palette.primary);
    root.style.setProperty('--color-primary-hover', palette.primaryHover);
    root.style.setProperty('--color-secondary', palette.secondary);
    root.style.setProperty('--color-accent', palette.accent);
    root.style.setProperty('--color-background', palette.background);
    root.style.setProperty('--color-surface', palette.surface);
    root.style.setProperty('--color-text', palette.text);
    root.style.setProperty('--color-text-secondary', palette.textSecondary);
    root.style.setProperty('--color-border', palette.border);
    root.style.setProperty('--color-ring', palette.ring);
    
    // Apply background
    document.body.style.background = palette.background;
  };

  const changePalette = (paletteName: string) => {
    const palette = availablePalettes.find(p => p.name === paletteName);
    if (palette) {
      setCurrentPalette(palette);
      applyPalette(palette);
      localStorage.setItem('selectedPalette', paletteName);
    }
  };

  return (
    <ThemeContext.Provider value={{
      currentPalette,
      availablePalettes,
      changePalette,
      isLoading
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return a default context instead of throwing
    return {
      currentPalette: null,
      availablePalettes: [],
      changePalette: () => {},
      isLoading: true
    };
  }
  return context;
}