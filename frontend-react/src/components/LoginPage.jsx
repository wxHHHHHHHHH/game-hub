import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Aurora from '../effects/Aurora';
import BlurText from '../effects/BlurText';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAnim, setShowAnim] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError('请填写用户名和密码'); return; }
    setLoading(true); setError('');
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || '用户名或密码错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Aurora background */}
      <div className="login-aurora">
        <Aurora
          colorStops={['#2d3748', '#4a5568', '#fafaf9']}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      <div className="login-container">
        <div className="login-brand">
          <img src="/logo.png" alt="波比" className="login-logo-img"
            onLoad={() => setShowAnim(true)}
          />
          <div style={{ minHeight: 40 }}>
            {showAnim && (
              <BlurText text="波比" className="login-title"
                direction="top" duration={0.8}
                styles={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}
              />
            )}
          </div>
          <p className="login-sub">集团视频展示与文件管理平台</p>
        </div>

        <div className="login-card">
          <h2>登录</h2>
          {error && <div className="login-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>用户名</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="请输入用户名" autoComplete="username" />
            </div>
            <div className="form-group">
              <label>密码</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="请输入密码" autoComplete="current-password" />
            </div>
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
          <div className="login-hint">
            <strong>演示账号：</strong><br />
            👑 admin / admin123 — 管理员<br />
            🎮 player / player123 — 成员<br />
            👀 visitor / visitor123 — 游客
          </div>
        </div>
      </div>
    </div>
  );
}
