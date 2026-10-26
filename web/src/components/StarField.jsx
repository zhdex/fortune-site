import React, { useEffect, useRef } from 'react';

/** 全屏星空画布：视差闪烁星星 + 缓慢流星 */
export default function StarField() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let raf;
    let stars = [];
    let meteors = [];
    let w, h;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.min(220, Math.floor((w * h) / 6500));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.3,
        base: Math.random() * 0.5 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.015 + 0.004,
        hue: Math.random() < 0.16 ? '255,214,142' : Math.random() < 0.5 ? '179,136,255' : '255,255,255',
      }));
    };

    const spawnMeteor = () => {
      if (Math.random() < 0.4) {
        meteors.push({
          x: Math.random() * w * 0.8 + w * 0.2,
          y: Math.random() * h * 0.3,
          vx: -(4 + Math.random() * 3),
          vy: 2.5 + Math.random() * 1.5,
          life: 1,
        });
      }
    };

    const tick = (t) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const tw = s.base + Math.sin(s.phase + t * s.speed) * 0.28;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.hue},${Math.max(0, tw)})`;
        ctx.fill();
      }
      meteors = meteors.filter((m) => m.life > 0);
      for (const m of meteors) {
        m.x += m.vx; m.y += m.vy; m.life -= 0.016;
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 14, m.y - m.vy * 14);
        grad.addColorStop(0, `rgba(255,255,255,${0.85 * m.life})`);
        grad.addColorStop(1, 'rgba(179,136,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 14, m.y - m.vy * 14);
        ctx.stroke();
      }
      raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener('resize', resize);
    const meteorTimer = setInterval(spawnMeteor, 3600);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(meteorTimer);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}
