import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useI18n } from '../i18n/index.js';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Daily() {
  const { t } = useI18n();
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

  useEffect(() => { load(today()); }, []);

  const shiftDay = (n) => {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + n);
    const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setDate(str);
    load(str);
  };

  return (
    <div className="daily-page container">
      <header className="page-head">
        <span
          className="page-head-sigil"
          aria-hidden="true"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/gen/sigil.webp)` }}
        />
        <span className="kicker">ALMANAC</span>
        <h1 className="page-title">{t('dailyPage.title')}</h1>
        <p className="page-sub">{t('dailyPage.sub')}</p>
      </header>

      <div className="daily-controls">
        <button className="btn btn-ghost btn-sm" onClick={() => shiftDay(-1)}>‹</button>
        <input
          type="date"
          className="date-input"
          value={date}
          min="1900-01-01"
          max="2100-12-31"
          onChange={(e) => { if (e.target.value) { setDate(e.target.value); load(e.target.value); } }}
        />
        <button className="btn btn-ghost btn-sm" onClick={() => shiftDay(1)}>›</button>
        <button className="btn btn-outline btn-sm" onClick={() => { setDate(today()); load(today()); }}>
          {t('dailyPage.today')}
        </button>
      </div>

      {loading && (
        <div className="glass section-block" style={{ textAlign: 'center' }}>
          <p className="typing-hint">{t('daily.title')}<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></p>
        </div>
      )}

      {data && !loading && (
        <>
          <div className="glass daily-card">
            <div className="daily-chips">
              <span className="chip gold">{data.daily.date}</span>
              <span className="chip">{data.daily.lunar}</span>
              <span className="chip">{data.daily.dayGanzhi}</span>
            </div>
            <div className="divider" />
            <p className="prose" style={{ fontSize: 16 }}>{data.text}</p>
            <div className="yiji">
              <div className="yiji-box yiji-yi">
                <div className="yiji-tag">✦ {t('daily.yi')}</div>
                <div className="yiji-words">
                  {data.daily.yi.map((y) => <span key={y} className="word word-yi">{y}</span>)}
                </div>
              </div>
              <div className="yiji-box yiji-ji">
                <div className="yiji-tag">☾ {t('daily.ji')}</div>
                <div className="yiji-words">
                  {data.daily.ji.map((j) => <span key={j} className="word word-ji">{j}</span>)}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <p className="disclaimer">{t('footer.disclaimer')}</p>
    </div>
  );
}
