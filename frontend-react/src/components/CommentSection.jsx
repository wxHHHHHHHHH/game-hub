import { useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function CommentSection({ videoId, comments: initialComments }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!text.trim() || !user) return;
    setSending(true);
    try {
      const res = await api.addComment(videoId, text);
      setComments(prev => [...prev, res.comment || res]);
      setText('');
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const del = async (id) => {
    if (!confirm('确定删除此评论？')) return;
    try {
      await api.deleteComment(id);
      setComments(prev => prev.filter(c => c.id !== id));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="comments-section">
      <h2>评论 <span className="comment-count">({comments.length})</span></h2>

      {user && (
        <div className="comment-form">
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="写下你的评论..." onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), submit())} />
          <button className="btn-submit" onClick={submit} disabled={sending || !text.trim()}>
            发送
          </button>
        </div>
      )}

      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="no-comments">暂无评论</div>
        ) : (
          comments.map(c => (
            <div className="comment-item" key={c.id}>
              <div className="comment-header">
                <div className="comment-author">
                  <span className="comment-avatar">{c.author?.[0] || c.username?.[0] || '?'}</span>
                  {c.author || c.username || '匿名'}
                </div>
                <span className="comment-time">{c.createdAt ? new Date(c.createdAt).toLocaleString() : c.time || ''}</span>
              </div>
              <div className="comment-content">{c.content || c.text}</div>
              {(user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN') && (
                <button className="btn-delete-comment" onClick={() => del(c.id)}>删除</button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
