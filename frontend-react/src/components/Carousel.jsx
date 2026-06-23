import { useState, useEffect } from 'react';

export default function Carousel({ slides }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  const prev = () => setIdx(i => (i - 1 + slides.length) % slides.length);
  const next = () => setIdx(i => (i + 1) % slides.length);

  return (
    <div className="carousel">
      <div className="carousel-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
        {slides.map((s, i) => (
          <div className="carousel-slide" key={i}>
            <img src={s.bg} alt="" loading={i === 0 ? 'eager' : 'lazy'} />
            <div className="carousel-info">
              <span className={`carousel-badge ${s.type}`}>{s.type === 'video' ? '视频' : '新闻'}</span>
              <h2>{s.title}</h2>
              <p>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="carousel-dots">
        {slides.map((_, i) => (
          <button key={i} className={`carousel-dot ${i === idx ? 'active' : ''}`} onClick={() => setIdx(i)} />
        ))}
      </div>
      <button className="carousel-btn prev" onClick={prev}>❮</button>
      <button className="carousel-btn next" onClick={next}>❯</button>
    </div>
  );
}
