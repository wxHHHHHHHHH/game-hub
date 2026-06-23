import { useEffect, useRef } from 'react';

export default function Aurora({ colorStops = ['#2d3748', '#4a5568', '#fafaf9'], blend = 0.5, amplitude = 1.0, speed = 0.5 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      t += 0.002 * speed;
      const w = canvas.width;
      const h = canvas.height;

      // Create flowing gradient with multiple points
      const gradient = ctx.createLinearGradient(
        w * (0.5 + Math.sin(t * 0.7) * amplitude * 0.3),
        0,
        w * (0.5 + Math.cos(t * 0.5) * amplitude * 0.3),
        h
      );

      colorStops.forEach((c, i) => {
        gradient.addColorStop(i / (colorStops.length - 1), c);
      });

      ctx.globalAlpha = blend;
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Add organic blobs
      for (let i = 0; i < 3; i++) {
        const cx = w * (0.3 + 0.4 * Math.sin(t * (0.3 + i * 0.2) + i));
        const cy = h * (0.3 + 0.4 * Math.cos(t * (0.25 + i * 0.15) + i));
        const r = Math.min(w, h) * (0.3 + 0.2 * Math.sin(t * 0.4 + i));

        const blob = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        blob.addColorStop(0, colorStops[i % colorStops.length] + '40');
        blob.addColorStop(1, 'transparent');
        ctx.fillStyle = blob;
        ctx.fillRect(0, 0, w, h);
      }

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [colorStops, blend, amplitude, speed]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}
