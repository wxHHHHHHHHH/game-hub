import { useState } from 'react';
import { api } from '../utils/api';

export default function AddVideoModal({ onClose, onSuccess }) {
  const [type, setType] = useState('BILIBILI');
  const [bv, setBv] = useState('');
  const [title, setTitle] = useState('');
  const [game, setGame] = useState('');
  const [description, setDescription] = useState('');
  const [cover, setCover] = useState('');
  const [cloudUrl, setCloudUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [coverFile, setCoverFile] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);
    try {
      const data = { title, game, description, source: type };
      if (type === 'BILIBILI') data.bv = bv;
      else data.url = cloudUrl;

      // Upload cover if selected
      if (coverFile) {
        const fd = new FormData();
        fd.append('file', coverFile);
        const res = await api.uploadCover(fd);
        data.coverUrl = res.url || res.coverUrl;
      } else if (cover) data.coverUrl = cover;

      await api.createVideo(data);
      onSuccess();
      onClose();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay active" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>📹 发布新视频</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="modal-body" onSubmit={submit}>
          <div className="video-type-tabs">
            <button type="button" className={`vt-tab ${type === 'BILIBILI' ? 'active' : ''}`} onClick={() => setType('BILIBILI')}>📺 B站视频</button>
            <button type="button" className={`vt-tab ${type === 'LOCAL' ? 'active' : ''}`} onClick={() => setType('LOCAL')}>☁️ 云盘</button>
          </div>

          {type === 'BILIBILI' ? (
            <div className="form-group">
              <label>B站 BV 号 *</label>
              <input type="text" value={bv} onChange={e => setBv(e.target.value)} placeholder="例如：BV1xx411c7mD" />
              <small>在B站视频页面 URL 中复制 BV 号</small>
            </div>
          ) : (
            <div className="form-group">
              <label>云盘直链地址 *</label>
              <input type="text" value={cloudUrl} onChange={e => setCloudUrl(e.target.value)} placeholder="粘贴云盘的视频直链链接" />
            </div>
          )}

          <div className="form-group">
            <label>视频标题 *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="输入视频标题" required />
          </div>
          <div className="form-group">
            <label>分类/标签</label>
            <input type="text" value={game} onChange={e => setGame(e.target.value)} placeholder="如 集团活动、年会、团建..." />
          </div>
          <div className="form-group">
            <label>封面图片</label>
            <div className="cover-upload-row">
              <input type="text" value={cover} onChange={e => setCover(e.target.value)} placeholder="封面图片 URL（可选）" />
              <span style={{ color: 'var(--ink-muted)', fontSize: 13 }}>或</span>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => document.getElementById('cover-file-input')?.click()}>📷 上传</button>
              <input type="file" id="cover-file-input" accept="image/*" style={{ display: 'none' }} onChange={e => setCoverFile(e.target.files[0])} />
            </div>
          </div>
          <div className="form-group">
            <label>视频描述</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="介绍一下这个视频的内容..." />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-cancel" onClick={onClose}>取消</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '发布中...' : '发布视频'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
