import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import VideoCard from './VideoCard';
import Carousel from './Carousel';
// VideoThumbnail effect handled via CSS hover

export default function HomePage({ onViewVideo, onViewNews }) {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [sort, setSort] = useState('latest');
  const [source, setSource] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const carouselSlides = [
    { type: 'video', title: '团队精彩时刻', sub: '记录每一次难忘的回忆', bg: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200' },
    { type: 'news', title: '波比 2026 年度盛典', sub: '全新升级，更多精彩内容即将上线', bg: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200' },
    { type: 'video', title: '季度团建回顾', sub: '团结协作，共创辉煌', bg: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200' },
  ];

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ sort });
    if (source !== 'all') params.set('source', source);
    if (search) params.set('search', search);
    api.getVideos('?' + params.toString())
      .then(data => setVideos(Array.isArray(data) ? data : data.content || data.data || []))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, [sort, source, search]);

  const filtered = videos.filter(v => !search || v.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="view active">
      <Carousel slides={carouselSlides} />

      <div className="hero">
        <div className="hero-badge">
          <img src="/logo.png" width="18" height="18" alt="" /> 波比
        </div>
        <h1>我们的<span>精彩时刻</span></h1>
        <p>记录每一次活动、每一个瞬间、每一段难忘的时光</p>

        <div className="search-bar">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 搜索视频..." />
          {search && <button className="clear-search" onClick={() => setSearch('')}>✕</button>}
        </div>

        <div className="sort-buttons">
          <button className={`source-btn ${source === 'all' ? 'active' : ''}`} onClick={() => setSource('all')}>📋 全部</button>
          <button className={`source-btn ${source === 'BILIBILI' ? 'active' : ''}`} onClick={() => setSource('BILIBILI')}>📺 B站</button>
          <button className={`source-btn ${source === 'LOCAL' ? 'active' : ''}`} onClick={() => setSource('LOCAL')}>☁️ 云盘</button>
        </div>
        <div className="sort-buttons">
          <button className={`sort-btn ${sort === 'latest' ? 'active' : ''}`} onClick={() => setSort('latest')}>🕐 最新</button>
          <button className={`sort-btn ${sort === 'hot' ? 'active' : ''}`} onClick={() => setSort('hot')}>🔥 最热</button>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📹</div>
          <h3>还没有视频</h3>
          <p>点击右上角「+ 发布视频」来发布第一个视频吧！</p>
        </div>
      ) : (
        <div className="video-grid">
          {filtered.map(v => (
            <VideoCard key={v.id} video={v} onClick={() => onViewVideo(v.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
