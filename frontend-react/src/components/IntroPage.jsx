import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function IntroPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFiles().then(d => setFiles(Array.isArray(d) ? d : d.content || d.data || [])).catch(() => setFiles([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="view active">
      <div className="intro-page">
        <div className="intro-section">
          <h2>🏛️ 简介</h2>
          <div className="intro-content">
            <p>波比是一家综合性企业集团，致力于多领域的业务发展。集团秉承"创新、协作、共赢"的核心价值观，在行业内树立了良好的企业形象。</p>
            <p>集团汇聚了一批优秀的专业人才，建立了完善的内部管理体系，形成了独特的企业文化。我们注重团队建设，定期组织各类活动，增强团队凝聚力。</p>
            <p>集团业务涵盖多个领域，包括但不限于：文化传媒、科技服务、贸易物流、投资管理等。</p>
          </div>
        </div>

        <div className="intro-section">
          <h2>📁 集团文件资料</h2>
          <p className="intro-desc">以下为集团公开文件。</p>
          {loading ? <div className="loading"><div className="spinner"></div></div> : (
            <div className="file-list">
              {files.map(f => (
                <div className="file-item" key={f.id}>
                  <span className="file-icon">📄</span>
                  <div className="file-info">
                    <span className="file-name">{f.filename || f.name}</span>
                    <span className="file-meta">{f.size ? (f.size / 1024).toFixed(1) + ' KB' : ''}</span>
                  </div>
                  <div className="file-actions">
                    <button className="btn-view" onClick={() => window.open(api + '/files/' + f.id + '/view', '_blank')}>查看</button>
                    <button className="btn-download" onClick={() => window.open(api + '/files/' + f.id + '/download', '_blank')}>下载</button>
                  </div>
                </div>
              ))}
              {files.length === 0 && <div style={{ color: 'var(--ink-muted)', padding: 20, textAlign: 'center' }}>暂无文件</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
