import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function NewsDetail({ newsId, onBack }) {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNewsDetail(newsId).then(d => setNews(d)).catch(() => setNews(null)).finally(() => setLoading(false));
  }, [newsId]);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!news) return <div className="empty-state"><h3>新闻未找到</h3></div>;

  return (
    <div className="view active">
      <button className="btn-back" onClick={onBack}>← 返回新闻列表</button>
      <div className="news-detail-wrap">
        <h1>{news.title}</h1>
        <div className="news-detail-meta">
          <span>{news.category || '集团动态'}</span>
          <span>{news.createdAt ? new Date(news.createdAt).toLocaleDateString() : news.date}</span>
        </div>
        <div className="news-detail-body">{news.content}</div>
      </div>
    </div>
  );
}
