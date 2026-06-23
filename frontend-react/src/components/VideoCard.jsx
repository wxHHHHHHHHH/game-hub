export default function VideoCard({ video, onClick }) {
  return (
    <div className="video-card" onClick={() => onClick(video.id)}>
      <div className="card-thumb">
        <img src={video.coverUrl || video.thumbnailUrl || video.cover || 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect fill="#f0f0f0" width="640" height="360"/><text fill="#999" x="320" y="180" text-anchor="middle" font-size="48">🎬</text></svg>')} alt={video.title} loading="lazy" />
        <div className="card-overlay">
          <div className="play-icon">▶</div>
        </div>
        {video.source === 'BILIBILI' && <span className="card-source bili">B站</span>}
        {video.source === 'LOCAL' && <span className="card-source cloud">云盘</span>}
        <span className="card-likes">👍 {video.likes || video.likeCount || 0}</span>
      </div>
      <div className="card-body">
        <div className="card-title">{video.title}</div>
        <div className="card-meta">
          <span className="card-game">{video.game || video.category || '精彩视频'}</span>
          <span className="card-time">{video.createdAt ? new Date(video.createdAt).toLocaleDateString() : ''}</span>
        </div>
      </div>
    </div>
  );
}
