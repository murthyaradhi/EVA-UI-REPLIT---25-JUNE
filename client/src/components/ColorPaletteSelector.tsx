import { useState } from 'react';
import { Palette, Check, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ColorPaletteSelectorProps {
  className?: string;
}

export default function ColorPaletteSelector({ className = '' }: ColorPaletteSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  let themeContext;
  try {
    themeContext = useTheme();
  } catch (error) {
    // If ThemeProvider is not available, render a fallback
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg h-10 w-48 ${className}`} />
    );
  }
  
  const { currentPalette, availablePalettes, changePalette, isLoading } = themeContext;

  if (isLoading || !currentPalette) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg h-10 w-48 ${className}`} />
    );
  }

  const ColorPreview = ({ palette }: { palette: any }) => (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        <div 
          className="w-3 h-3 rounded-full border border-gray-300" 
          style={{ backgroundColor: palette.primary }}
        />
        <div 
          className="w-3 h-3 rounded-full border border-gray-300" 
          style={{ backgroundColor: palette.secondary }}
        />
        <div 
          className="w-3 h-3 rounded-full border border-gray-300" 
          style={{ backgroundColor: palette.accent }}
        />
      </div>
      <span className="text-sm font-sf-medium text-gray-900">{palette.displayName}</span>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg px-4 py-2 hover:border-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl min-w-[200px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-gray-500" />
          <ColorPreview palette={currentPalette} />
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[9996]" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-[9997] max-h-80 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs font-sf-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                Choose Theme
              </div>
              {availablePalettes.map((palette) => (
                <button
                  key={palette.name}
                  onClick={() => {
                    changePalette(palette.name);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 ${
                    currentPalette.name === palette.name ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <ColorPreview palette={palette} />
                  {currentPalette.name === palette.name && (
                    <Check size={16} className="text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}