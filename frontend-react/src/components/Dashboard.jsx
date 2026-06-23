import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const TABS = [
  { id: 'stats', label: '📈 数据看板' },
  { id: 'logs', label: '📋 操作日志' },
  { id: 'contact', label: '📞 联系方式' },
];

export default function Dashboard({ onBack }) {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (tab === 'stats') {
      api.getStats().then(d => setStats(d)).catch(() => setStats({})).finally(() => setLoading(false));
    } else if (tab === 'logs') {
      api.getLogs().then(d => setLogs(Array.isArray(d) ? d : d.content || d.data || [])).catch(() => setLogs([])).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [tab]);

  return (
    <div className="view active">
      <button className="btn-back" onClick={onBack}>← 返回</button>
      <div className="page-header"><h2>📊 管理后台</h2></div>

      <div className="dash-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`dash-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {loading ? <div className="loading"><div className="spinner"></div></div> : (
        <>
          {tab === 'stats' && stats && (
            <div className="stats-grid">
              {[
                { label: '视频总数', num: stats.videoCount || stats.videos || 0 },
                { label: '用户总数', num: stats.userCount || stats.users || 0 },
                { label: '评论总数', num: stats.commentCount || stats.comments || 0 },
                { label: '照片总数', num: stats.photoCount || stats.photos || 0 },
              ].map((s, i) => (
                <div className="stat-card" key={i}>
                  <div className="stat-num">{s.num}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'logs' && (
            <table className="log-table">
              <thead><tr><th>时间</th><th>操作</th><th>用户</th><th>详情</th></tr></thead>
              <tbody>
                {logs.slice(0, 50).map((l, i) => (
                  <tr key={i}>
                    <td>{l.createdAt ? new Date(l.createdAt).toLocaleString() : l.time}</td>
                    <td>{l.action || l.operation}</td>
                    <td>{l.username || l.user}</td>
                    <td>{l.detail || l.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'contact' && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-muted)' }}>
              联系方式已在"联系我们"页面展示
            </div>
          )}
        </>
      )}
    </div>
  );
}
