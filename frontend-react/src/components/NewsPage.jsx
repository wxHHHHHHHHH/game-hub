import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function NewsPage({ onViewNews }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNews().then(data => setNews(Array.isArray(data) ? data : data.content || data.data || [])).catch(() => setNews([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="view active">
      <div className="page-header">
        <h2>📰 新闻资讯</h2>
        <p>集团动态 · 行业资讯 · 政策文件</p>
      </div>
      {news.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📰</div><h3>暂无新闻</h3></div>
      ) : (
        <div className="news-grid">
          {news.map(n => (
            <div className="news-card" key={n.id} onClick={() => onViewNews(n.id)}>
              <span className={`news-cat ${n.pinned ? 'pinned' : ''}`}>{n.category || '集团动态'}</span>
              <h4>{n.title}</h4>
              <div className="news-summary">{n.summary || n.content?.substring(0, 100)}</div>
              <div className="news-date">{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : n.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
