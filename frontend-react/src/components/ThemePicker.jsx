import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

export default function ThemePicker({ onClose }) {
  const { theme, presets, applyPreset } = useTheme();
  const [bg, setBg] = useState(theme.bg);
  const [card, setCard] = useState(theme.card);
  const [accent, setAccent] = useState(theme.accent);
  const [accentSoft, setAccentSoft] = useState(theme.accentSoft);
  const [accentWarm, setAccentWarm] = useState(theme.accentWarm);
  const [ink, setInk] = useState(theme.ink);

  const save = () => {
    applyPreset({ bg, card, accent, accentSoft, accentWarm, ink, border: theme.border, name: '自定义' });
    onClose();
  };

  return (
    <div className="modal-overlay active" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>🎨 配色方案</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p className="preset-label">点击色块切换：</p>
          <div className="preset-grid">
            {presets.map((p, i) => (
              <button key={i} className={`preset-dot ${theme.bg === p.bg ? 'active' : ''}`}
                style={{ background: p.accent, borderColor: p.accentSoft }}
                onClick={() => applyPreset(p)} title={p.name}
              />
            ))}
          </div>
          <div className="form-group"><label>背景色</label><input type="color" value={bg} onChange={e => setBg(e.target.value)} /></div>
          <div className="form-group"><label>卡片色</label><input type="color" value={card} onChange={e => setCard(e.target.value)} /></div>
          <div className="form-group"><label>主色</label><input type="color" value={accent} onChange={e => setAccent(e.target.value)} /></div>
          <div className="form-group"><label>辅色</label><input type="color" value={accentSoft} onChange={e => setAccentSoft(e.target.value)} /></div>
          <div className="form-group"><label>暖色</label><input type="color" value={accentWarm} onChange={e => setAccentWarm(e.target.value)} /></div>
          <div className="form-group"><label>文字色</label><input type="color" value={ink} onChange={e => setInk(e.target.value)} /></div>
          <div className="form-actions">
            <button className="btn btn-cancel" onClick={onClose}>取消</button>
            <button className="btn btn-primary" onClick={save}>保存</button>
          </div>
        </div>
      </div>
    </div>
  );
}
