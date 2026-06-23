import { useEffect, useRef } from 'react';

export default function BlurText({ text, className, direction = 'top', duration = 0.8, styles = {} }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.filter = 'blur(12px)';
    el.style.opacity = '0';
    el.style.transform = direction === 'top' ? 'translateY(20px)' : 'translateY(-20px)';
    el.style.transition = `filter ${duration}s cubic-bezier(0.16,1,0.3,1), opacity ${duration}s cubic-bezier(0.16,1,0.3,1), transform ${duration}s cubic-bezier(0.16,1,0.3,1)`;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.filter = 'blur(0px)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  }, [duration, direction]);

  return <span ref={ref} className={className} style={styles}>{text}</span>;
}
