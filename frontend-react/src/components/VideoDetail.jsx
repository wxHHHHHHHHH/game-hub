import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import CommentSection from './CommentSection';

export default function VideoDetail({ videoId, onBack }) {
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.getVideo(videoId).then(data => {
      setVideo(data);
      setLikes(data.likes || data.likeCount || 0);
    }).catch(console.error).finally(() => setLoading(false));
  }, [videoId]);

  const toggleLike = useCallback(async () => {
    if (!user) return;
    try {
      if (liked) { await api.unlikeVideo(videoId); setLikes(l => l - 1); }
      else { await api.likeVideo(videoId); setLikes(l => l + 1); }
      setLiked(!liked);
    } catch (e) { console.error(e); }
  }, [liked, user, videoId]);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!video) return <div className="empty-state"><h3>视频未找到</h3></div>;

  return (
    <div className="view active">
      <button className="btn-back" onClick={onBack}>← 返回列表</button>
      <div className="video-detail-wrap">
        <div className="video-player-wrapper">
          {video.source === 'BILIBILI' ? (
            <iframe src={`https://player.bilibili.com/player.html?bvid=${video.bv}&page=1&high_quality=1&as_wide=1&danmaku=0`}
              allowFullScreen title={video.title} />
          ) : (
            <video src={video.videoUrl || video.url} controls className="dplayer-container" />
          )}
        </div>
        <div className="video-info">
          <h1>{video.title}</h1>
          <div className="video-meta">
            <span className="game-tag">{video.game || video.category || '精彩视频'}</span>
            <span>👁 {video.views || video.viewCount || 0} 次观看</span>
            <span>{video.createdAt ? new Date(video.createdAt).toLocaleDateString() : ''}</span>
          </div>
          {video.description && <div className="video-description">{video.description}</div>}
          <div className="video-actions">
            <button className={`btn-like ${liked ? 'liked' : ''}`} onClick={toggleLike}>
              {liked ? '❤️' : '🤍'} <span className="like-count">{likes}</span>
            </button>
          </div>
        </div>
        <CommentSection videoId={videoId} comments={video.comments || []} />
      </div>
    </div>
  );
}
