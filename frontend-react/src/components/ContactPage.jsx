export default function ContactPage() {
  return (
    <div className="view active">
      <div className="page-header">
        <h2>📞 联系我们</h2>
        <p>欢迎各界朋友来访洽谈</p>
      </div>
      <div className="contact-grid">
        {[
          { icon: '📍', title: '集团地址', desc: '北京市朝阳区建国路88号\n波比大厦' },
          { icon: '📞', title: '联系电话', desc: '总机：010-8888-6666\n传真：010-8888-6667' },
          { icon: '📧', title: '电子邮箱', desc: 'info@bobiquan.cn\nhr@bobiquan.cn' },
          { icon: '🕐', title: '工作时间', desc: '周一至周五 9:00-18:00\n周六 9:00-12:00' },
        ].map((c, i) => (
          <div className="contact-card" key={i}>
            <div className="contact-icon">{c.icon}</div>
            <div>
              <h3>{c.title}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="contact-map">
        <h3>🗺️ 地图导航</h3>
        <div className="map-placeholder">
          <iframe src="https://map.baidu.com/" width="100%" height="400" style={{ border: 0, borderRadius: 10 }} loading="lazy" title="地图"></iframe>
        </div>
      </div>
    </div>
  );
}
