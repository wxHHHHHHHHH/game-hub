import { createContext, useContext, useState, useEffect } from 'react';

const PRESETS = [
  { bg:'#fafaf9', card:'#ffffff', accent:'#2d3748', accentSoft:'#4a5568', accentWarm:'#c44536', ink:'#1a1a18', border:'#e5e4e0', name:'石墨灰' },
  { bg:'#f8f8f7', card:'#ffffff', accent:'#1e3a5f', accentSoft:'#2e5a8f', accentWarm:'#c44536', ink:'#141c28', border:'#e0e4e8', name:'海军蓝' },
  { bg:'#faf9f7', card:'#ffffff', accent:'#7c2d12', accentSoft:'#9a4318', accentWarm:'#b45309', ink:'#1c0e04', border:'#e8e0d8', name:'赤陶' },
  { bg:'#f9faf8', card:'#ffffff', accent:'#0d4628', accentSoft:'#166534', accentWarm:'#b45309', ink:'#0c1c10', border:'#d8e8dc', name:'森林绿' },
  { bg:'#faf8f9', card:'#ffffff', accent:'#5b21b6', accentSoft:'#7c3aed', accentWarm:'#c026d3', ink:'#140c24', border:'#e4d8f0', name:'紫水晶' },
  { bg:'#fafaf8', card:'#ffffff', accent:'#b45309', accentSoft:'#d97706', accentWarm:'#dc2626', ink:'#1c0e02', border:'#e8dcc8', name:'琥珀棕' },
  { bg:'#f7f8fa', card:'#ffffff', accent:'#1e293b', accentSoft:'#334155', accentWarm:'#c44536', ink:'#0f1728', border:'#e0e4e8', name:'石板蓝' },
  { bg:'#faf7f6', card:'#ffffff', accent:'#991b1b', accentSoft:'#b91c1c', accentWarm:'#dc2626', ink:'#1c0606', border:'#e8d4d4', name:'朱砂' },
  { bg:'#f8f9f8', card:'#ffffff', accent:'#0f766e', accentSoft:'#0d9488', accentWarm:'#c2410c', ink:'#0c1c1a', border:'#d4e8e4', name:'青瓷' },
  { bg:'#111110', card:'#1c1c1a', accent:'#e5e5e0', accentSoft:'#a0a098', accentWarm:'#c44536', ink:'#e8e8e4', border:'#2e2e2a', name:'暗夜' },
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const saved = localStorage.getItem('bobi_theme');
  const init = saved ? JSON.parse(saved) : PRESETS[0];
  const [theme, setTheme] = useState(init);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg', theme.bg);
    root.style.setProperty('--surface', theme.card);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-soft', theme.accentSoft);
    root.style.setProperty('--accent-warm', theme.accentWarm);
    root.style.setProperty('--ink', theme.ink);
    root.style.setProperty('--ink-secondary', theme.ink + 'cc');
    root.style.setProperty('--border', theme.border);
    document.body.style.background = theme.bg;
  }, [theme]);

  const applyPreset = (p) => { setTheme(p); localStorage.setItem('bobi_theme', JSON.stringify(p)); };

  return (
    <ThemeContext.Provider value={{ theme, presets: PRESETS, applyPreset }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
