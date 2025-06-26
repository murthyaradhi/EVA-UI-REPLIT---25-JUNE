import React from 'react';
import CreateTripForm from './components/CreateTripForm';
import ColorPaletteSelector from './components/ColorPaletteSelector';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen" style={{ background: 'var(--color-background, linear-gradient(135deg, rgb(251, 191, 36) 0%, rgb(249, 115, 22) 50%, rgb(234, 179, 8) 100%))' }}>
        <div className="w-[70%] mx-auto px-6 py-6">
          {/* Simple Header */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-sf-bold leading-tight tracking-sf-tight" style={{ color: 'var(--color-text, rgb(17, 24, 39))' }}>Create New Trip</h1>
              <p className="mt-1 text-sm font-sf-medium" style={{ color: 'var(--color-text-secondary, rgb(107, 114, 128))' }}>Plan and manage your business trips efficiently</p>
            </div>
            
            <ColorPaletteSelector />
          </div>
          
          <CreateTripForm onClose={() => {}} />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;