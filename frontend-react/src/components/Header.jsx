import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemePicker from './ThemePicker';

const NAV = [
  { id: 'home', label: '首页', icon: '⊡' },
  { id: 'news', label: '新闻', icon: '☰' },
  { id: 'intro', label: '简介', icon: '◉' },
  { id: 'contact', label: '联系', icon: '✉' },
  { id: 'gallery', label: '活动相册', icon: '▣' },
];

export default function Header({ currentView, onNavigate }) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTheme, setShowTheme] = useState(false);

  const go = (id) => { onNavigate(id); setMenuOpen(false); };

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <div className="logo" onClick={() => go('home')}>
            <img src="/logo.png" alt="波比" className="logo-img" />
            <span className="logo-text">波比</span>
            <span className="logo-pick-btn" onClick={e => { e.stopPropagation(); setShowTheme(true); }} title="配色">🎨</span>
          </div>

          <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="菜单">
            {menuOpen ? '✕' : '☰'}
          </button>

          <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
            {/* Mobile user area */}
            {user && (
              <div className="mobile-user-area">
                <span className="user-dot">{user.username?.[0]}</span>
                <span className="user-meta">
                  <span className="uname">{user.username}</span>
                  <span className="urole">{user.role}</span>
                </span>
                <button className="btn-exit" onClick={logout}>退出</button>
              </div>
            )}

            {NAV.map(n => (
              <a key={n.id} className={`nav-link ${currentView === n.id ? 'active' : ''}`}
                onClick={() => go(n.id)} href="#!">
                <span className="nav-icon">{n.icon}</span> {n.label}
              </a>
            ))}

            <button className="nav-link add-btn" onClick={() => go('add-video')}>
              + 发布视频
            </button>

            {(user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN') && (
              <>
                <button className="nav-link nav-admin" onClick={() => go('dashboard')}>📊 管理后台</button>
                <button className="nav-link nav-admin" onClick={() => go('admin')}>⚙️ 成员管理</button>
              </>
            )}

            {user && (
              <div className="user-area">
                <div className="user-badge">
                  <span className="user-avatar">{user.username?.[0]}</span>
                  <span className="user-name">{user.username}</span>
                  <span className={`user-role role-${user.role === 'ROLE_ADMIN' ? 'ADMIN' : user.role}`}>{user.role}</span>
                </div>
                <button className="btn-logout" onClick={logout}>退出</button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {showTheme && <ThemePicker onClose={() => setShowTheme(false)} />}
    </>
  );
}
