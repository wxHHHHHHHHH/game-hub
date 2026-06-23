import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function GalleryPage() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [date, setDate] = useState('');

  useEffect(() => {
    api.getPhotos().then(d => setPhotos(Array.isArray(d) ? d : d.content || d.data || [])).catch(() => setPhotos([])).finally(() => setLoading(false));
  }, []);

  // Group by date
  const grouped = {};
  photos.forEach(p => {
    const d = p.date || p.createdAt?.split('T')[0] || '未分类';
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(p);
  });
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="view active">
      <div className="gallery-hero">
        <h2>📷 活动相册</h2>
        <p>记录每一次旅途、每一张笑脸、每一段美好时光 ☀️</p>
      </div>

      {user && (
        <div className="gallery-upload-bar">
          <div className="upload-row">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <button className="btn-upload-photo">📤 上传照片</button>
          </div>
          <small style={{ display: 'block', marginTop: 8, color: 'var(--ink-muted)' }}>💡 先选日期再上传（可选），不选默认今天</small>
        </div>
      )}

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="timeline">
          {dates.map(d => (
            <div key={d}>
              <div className="timeline-date">{d}</div>
              <div className="timeline-row">
                {grouped[d].map((p, i) => (
                  <div className="timeline-item" key={i} onClick={() => setLightbox(p)}>
                    <img src={p.thumbnailUrl || p.thumb || p.url} alt={p.title || d} loading="lazy" />
                    <div className="gal-caption">{p.title || ''}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {dates.length === 0 && <div className="empty-state"><div className="empty-icon">📷</div><h3>暂无照片</h3></div>}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox active" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
          <img src={lightbox.url || lightbox.originalUrl} alt={lightbox.title} />
          <div id="lightbox-caption">{lightbox.title}</div>
        </div>
      )}
    </div>
  );
}
