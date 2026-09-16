import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontSizeLevel = 'normal' | 'large' | 'xl';

interface FontSizeContextType {
  fontSize: FontSizeLevel;
  setFontSize: (size: FontSizeLevel) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

const LEVELS: FontSizeLevel[] = ['normal', 'large', 'xl'];

// Root font sizes for each level (px applied to <html>)
const FONT_SIZE_MAP: Record<FontSizeLevel, string> = {
  normal: '16px',
  large:  '19px',
  xl:     '22px',
};

const DEFAULT_FONT_SIZE_CONTEXT: FontSizeContextType = {
  fontSize: 'normal',
  setFontSize: () => {},
  increaseFontSize: () => {},
  decreaseFontSize: () => {}
};

const FontSizeContext = createContext<FontSizeContextType>(DEFAULT_FONT_SIZE_CONTEXT);

export const FontSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSizeLevel>(() => {
    try {
      const saved = localStorage.getItem('novamart_fontsize') as FontSizeLevel;
      return LEVELS.includes(saved) ? saved : 'normal';
    } catch {
      return 'normal';
    }
  });

  // Apply to <html> root font-size so all rem units scale automatically
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = FONT_SIZE_MAP[fontSize];
    root.setAttribute('data-font-size', fontSize);
    try {
      localStorage.setItem('novamart_fontsize', fontSize);
    } catch {}
  }, [fontSize]);

  const setFontSize = (size: FontSizeLevel) => setFontSizeState(size);

  const increaseFontSize = () => {
    setFontSizeState(prev => {
      const idx = LEVELS.indexOf(prev);
      return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : prev;
    });
  };

  const decreaseFontSize = () => {
    setFontSizeState(prev => {
      const idx = LEVELS.indexOf(prev);
      return idx > 0 ? LEVELS[idx - 1] : prev;
    });
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize, increaseFontSize, decreaseFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => {
  const ctx = useContext(FontSizeContext);
  return ctx || DEFAULT_FONT_SIZE_CONTEXT;
};
