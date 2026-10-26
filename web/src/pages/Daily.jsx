import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Daily() {
  const [date, setDate] = useState(today());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async (d) => {
    setLoading(true);
    try {
      const res = await api.daily(d);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // 首次加载今天
  useEffect(() => { load(today()); }, []);

  const shiftDay = (n) => {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + n);
    const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setDate(str);
    load(str);
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <section className="hero" style={{ padding: '20px 0 28px' }}>
        <h1 className="hero-title" style={{ fontSize: 'clamp(24px, 4vw, 34px)' }}>每日运势 · 黄历新读</h1>
        <p className="hero-sub" style={{ fontSize: 15 }}>老黄历的宜忌，翻译成今天就能用的小提醒</p>
      </section>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => shiftDay(-1)}>‹ 前一天</button>
        <input
          type="date"
          value={date}
          min="1900-01-01"
          max="2100-12-31"
          onChange={(e) => { if (e.target.value) { setDate(e.target.value); load(e.target.value); } }}
          style={{
            padding: '9px 14px', borderRadius: 12, border: '1px solid var(--glass-border)',
            background: 'rgba(255,255,255,0.05)', color: 'var(--text-hi)', fontFamily: 'inherit', fontSize: 14,
            colorScheme: 'dark',
          }}
        />
        <button className="btn btn-ghost btn-sm" onClick={() => shiftDay(1)}>后一天 ›</button>
      </div>

      {loading && (
        <div className="glass section-block" style={{ textAlign: 'center' }}>
          <p className="typing-hint">正在翻看黄历<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></p>
        </div>
      )}

      {data && !loading && (
        <>
          <div className="glass daily-card">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span className="chip gold">{data.daily.date}</span>
              <span className="chip">农历 {data.daily.lunar}</span>
              <span className="chip">属{data.daily.zodiac}</span>
            </div>
            <div className="divider" />
            <p className="prose" style={{ fontSize: 16 }}>{data.text}</p>
            <div className="yiji">
              <div className="yiji-box yiji-yi">
                <div className="yiji-tag">✦ 宜</div>
                <div className="tag-row">{data.daily.yi.map((y) => <span key={y} className="chip" style={{ background: 'rgba(94,224,176,0.1)', borderColor: 'rgba(94,224,176,0.3)', color: '#9fe8c6' }}>{y}</span>)}</div>
              </div>
              <div className="yiji-box yiji-ji">
                <div className="yiji-tag">☾ 忌</div>
                <div className="tag-row">{data.daily.ji.map((j) => <span key={j} className="chip" style={{ background: 'rgba(255,154,165,0.08)', borderColor: 'rgba(255,154,165,0.28)', color: '#ffb3ba' }}>{j}</span>)}</div>
              </div>
            </div>
          </div>

          <div className="glass section-block" style={{ textAlign: 'center' }}>
            <p className="prose" style={{ fontSize: 13.5, color: 'var(--text-low)' }}>
              当日干支：{data.daily.dayGanzhi}
            </p>
          </div>
        </>
      )}

      <p className="disclaimer">每日运势完全免费 · 宜忌源自传统黄历，供生活参考与自省之乐</p>
    </div>
  );
}
