import React, { useEffect, useRef, useState } from 'react';
import { streamInterpret, ensureMode, onModeChange, getEntitlements } from '../lib/api.js';
import PayModal from '../components/PayModal.jsx';
import WuxingEnergy from '../components/WuxingEnergy.jsx';
import { PRODUCTS, readingPrices, scopeCovers } from '../../../shared/catalog.mjs';
import { takePending } from '../lib/consent.js';
import { saveDraft, loadDraft } from '../lib/draft.js';
import { useI18n } from '../i18n/index.js';

const YEARS = Array.from({ length: 101 }, (_, i) => 2026 - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const HOURS = [
  ['未知', -1], ['子时 23-01', 23], ['丑时 01-03', 1], ['寅时 03-05', 3], ['卯时 05-07', 5],
  ['辰时 07-09', 7], ['巳时 09-11', 9], ['午时 11-13', 11], ['未时 13-15', 13],
  ['申时 15-17', 15], ['酉时 17-19', 17], ['戌时 19-21', 19], ['亥时 21-23', 21],
];

const SECTIONS = ['summary', 'love', 'career'];

/* ------------------------- 生辰表单 ------------------------- */

function BirthForm({ onSubmit, loading }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ year: 1995, month: 8, day: 15, hour: -1, gender: '女', mode: 'bazi' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: k === 'hour' ? Number(e.target.value) : e.target.value }));

  return (
    <div className="glass section-block form-card" style={{ marginTop: 0 }}>
      <div className="form-grid">
        <div className="field">
          <label>{t('fortune.year')}</label>
          <select value={form.year} onChange={set('year')}>{YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</select>
        </div>
        <div className="field">
          <label>{t('fortune.month')}</label>
          <select value={form.month} onChange={set('month')}>{MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}</select>
        </div>
        <div className="field">
          <label>{t('fortune.day')}</label>
          <select value={form.day} onChange={set('day')}>{DAYS.map((d) => <option key={d} value={d}>{d}</option>)}</select>
        </div>
        <div className="field">
          <label>{t('fortune.hour')}</label>
          <select value={form.hour} onChange={set('hour')}>
            {HOURS.map(([label, v]) => <option key={v} value={v}>{v < 0 ? t('fortune.hourUnknown') : label}</option>)}
          </select>
        </div>
        <div className="field">
          <label>{t('fortune.gender')}</label>
          <select value={form.gender} onChange={set('gender')}>
            <option value="女">{t('fortune.female')}</option>
            <option value="男">{t('fortune.male')}</option>
          </select>
        </div>
        <div className="field">
          <label>{t('fortune.mode')}</label>
          <select value={form.mode} onChange={set('mode')}>
            <option value="bazi">{t('fortune.bazi')}</option>
            <option value="ziwei">{t('fortune.ziwei')}</option>
          </select>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 26 }}>
        <button className="btn btn-gold btn-lg" disabled={loading} onClick={() => onSubmit(form)}>
          {loading ? t('fortune.loading') : `✦ ${t('fortune.submit')}`}
        </button>
      </div>
      <p className="disclaimer">{t('fortune.formNote')}</p>
    </div>
  );
}

/* ------------------------- 三段（免费预览 + 上锁） ------------------------- */

function SectionCard({ data, onUnlock }) {
  const { t } = useI18n();
  const label = t(`fortune.sections.${data.section}`);

  if (data.unlocked) {
    return (
      <div className="glass section-block">
        <h3 className="section-title">{label}</h3>
        <p className="prose">{data.text}</p>
      </div>
    );
  }

  const rest = Math.max(0, (data.total || 0) - (data.teaser || '').length);
  return (
    <div className="glass section-block section-locked">
      <h3 className="section-title">{label}</h3>
      <p className="prose teaser">
        {data.teaser}
        <span className="teaser-fade" aria-hidden="true" />
      </p>
      <div className="lock-bar">
        <span className="lock-ico" aria-hidden="true">🔒</span>
        <span className="lock-text">
          {t('fortune.lockNote').replace('{n}', rest)}
        </span>
        <button className="btn btn-gold btn-sm" onClick={() => onUnlock(`chapter:${data.section}`)}>
          {t('fortune.unlockSection')} ${Number(data.price).toFixed(2)}
        </button>
      </div>
    </div>
  );
}

/* ------------------------- 主页面 ------------------------- */

export default function Fortune() {
  const { t } = useI18n();
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('bazi');
  const [chart, setChart] = useState(null);
  const [headline, setHeadline] = useState('');
  const [sections, setSections] = useState({});
  const [chapters, setChapters] = useState([]);
  const [chapterLock, setChapterLock] = useState(null);
  const [done, setDone] = useState(false);
  const [engine, setEngine] = useState('unknown');
  const [paying, setPaying] = useState(null);
  const [error, setError] = useState('');
  const abortRef = useRef(null);
  const reportRef = useRef(null);
  const lastInputRef = useRef(null);

  useEffect(() => {
    const off = onModeChange(setEngine);
    ensureMode();
    return off;
  }, []);

  // 从条款页同意返回后：恢复上次的出生信息、自动重开付款并重新排盘
  useEffect(() => {
    const draft = loadDraft('fortune');
    const p = takePending();
    if (p?.product) setPaying(p.product);
    if (draft) start(draft);
  }, []);

  useEffect(() => () => abortRef.current?.(), []);

  const start = (payload) => {
    const { mode: m, ...rest } = payload;
    const input = {
      year: Number(rest.year),
      month: Number(rest.month),
      day: Number(rest.day),
      hour: Number(rest.hour) < 0 ? 12 : Number(rest.hour),
      gender: rest.gender,
    };
    setMode(m || 'bazi');
    setLoading(true);
    setStarted(true);
    setError('');
    setChart(null);
    setHeadline('');
    setSections({});
    setChapters([]);
    setChapterLock(null);
    setDone(false);
    lastInputRef.current = { mode: m || 'bazi', ...input };
    saveDraft('fortune', { mode: m || 'bazi', ...input });

    abortRef.current?.();
    abortRef.current = streamInterpret({
      type: m || 'bazi',
      input,
      handlers: {
        onChart: (d) => {
          setChart(d.chart);
          setLoading(false);
          setTimeout(() => reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 160);
        },
        onHeadline: setHeadline,
        onSection: (d) => setSections((prev) => ({ ...prev, [d.section]: d })),
        onChapter: (c) => setChapters((prev) => [...prev, c]),
        onChapterLock: setChapterLock,
        onDone: () => setDone(true),
        onError: (e) => { setLoading(false); setError(e.message || '解读失败'); },
      },
    });
  };

  const afterPay = () => {
    setPaying(null);
    if (lastInputRef.current) start(lastInputRef.current);
  };

  const anyLocked = SECTIONS.some((k) => sections[k] && !sections[k].unlocked);
  const prices = readingPrices();
  const bundleOwned = scopeCovers(getEntitlements(), 'ch:all');

  return (
    <div className="fortune-page container">
      <header className="page-head">
        <span
          className="page-head-sigil"
          aria-hidden="true"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/gen/sigil.webp)` }}
        />
        <span className="kicker">READING</span>
        <h1 className="page-title">{t('fortune.title')}</h1>
        <p className="page-sub">{t('fortune.sub')}</p>
      </header>

      <section className="glass section-block fortune-note">
        <h3>{t('fortune.introTitle')}</h3>
        <p className="lead">{t('fortune.introLead')}</p>
        <ul className="fortune-list">
          {['i1', 'i2', 'i3'].map((k, i) => (
            <li key={k}>
              <span className="mark">{i + 1}</span>
              <span><b>{t(`fortune.${k}t`)}</b>：{t(`fortune.${k}d`)}</span>
            </li>
          ))}
        </ul>
      </section>

      {engine === 'static' && <div className="glass static-note">✦ {t('fortune.staticTip')}</div>}

      <BirthForm onSubmit={start} loading={loading} />

      {started && loading && !chart && (
        <div className="glass section-block" style={{ textAlign: 'center' }}>
          <p className="typing-hint">{t('fortune.waiting')}<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></p>
        </div>
      )}

      {error && <div className="glass section-block static-note">⚠ {error}</div>}

      {chart && (
        <div ref={reportRef}>
          {/* 五行能量：替代原先难懂的四柱排盘 */}
          {mode === 'bazi'
            ? <WuxingEnergy chart={chart} />
            : <ZiweiSummary chart={chart} />}

          <div className="glass section-block" style={{ textAlign: 'center' }}>
            {headline
              ? <div className="headline">{headline}</div>
              : <p className="typing-hint">{t('fortune.waiting')}<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></p>}
          </div>

          {SECTIONS.map((k) => (sections[k] ? <SectionCard key={k} data={sections[k]} onUnlock={setPaying} /> : null))}

          <section className="glass section-block fortune-note">
            <h3>{t('fortune.howTitle')}</h3>
            <ul className="fortune-list">
              {['h1', 'h2', 'h3'].map((k, i) => (
                <li key={k}>
                  <span className="mark">{i + 1}</span>
                  <span>{t(`fortune.${k}`)}</span>
                </li>
              ))}
            </ul>
          </section>

          {anyLocked && !bundleOwned && (
            <div className="bundle-card glass-strong">
              <div className="bundle-info">
                <h4>{t('fortune.bundleTitle')}</h4>
                <p>{t('fortune.bundleSub').replace('{save}', prices.saving.toFixed(2))}</p>
              </div>
              <button className="btn btn-gold" onClick={() => setPaying('bundle:reading')}>
                {t('fortune.bundleCta')} ${Number(prices.bundle).toFixed(2)}
              </button>
            </div>
          )}

          {chapters.length > 0 && (
            <section className="chapters">
              <h3 className="section-title">{t('fortune.chapters')}</h3>
              {chapters.map((c) => (
                <div key={c.title} className="premium-card">
                  <div className="premium-title">♛ {c.title}</div>
                  <p className="prose" style={{ marginTop: 10 }}>{c.content}</p>
                </div>
              ))}
            </section>
          )}

          {chapters.length === 0 && chapterLock && (
            <div className="premium-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
              <div className="premium-title" style={{ fontSize: 16 }}>
                {t('fortune.chaptersLocked').replace('{n}', chapterLock.count)}
              </div>
              <div className="blur-locked" aria-hidden="true">
                <p className="prose" style={{ marginTop: 10 }}>{chapterLock.titles.join('　')}</p>
              </div>
              <button className="btn btn-gold" style={{ marginTop: 14 }} onClick={() => setPaying('bundle:reading')}>
                {t('fortune.bundleCta')} ${Number(prices.bundle).toFixed(2)}
              </button>
            </div>
          )}

          {done && (
            <div style={{ textAlign: 'center', marginTop: 22 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => lastInputRef.current && start(lastInputRef.current)}>
                ↻ {t('fortune.redo')}
              </button>
            </div>
          )}
        </div>
      )}

      {paying && <PayModal product={paying} onClose={() => setPaying(null)} onPaid={afterPay} />}
    </div>
  );
}

/* ------------------------- 紫微：只留易懂的部分 ------------------------- */

function ZiweiSummary({ chart }) {
  const { t } = useI18n();
  const life = chart?.palaces?.find((p) => p.name === '命宫');
  const stars = life?.majorStars?.map((s) => s.name) || [];
  return (
    <section className="wuxing glass section-block">
      <h3 className="section-title">{t('fortune.ziweiTitle')}</h3>
      <div className="wx-chips" style={{ marginBottom: 12 }}>
        <span className="chip gold">{t('fortune.soul')}：{chart?.soul}</span>
        <span className="chip">{chart?.fiveElementsClass}</span>
        <span className="chip">{chart?.shichen}</span>
      </div>
      <div className="ziwei-stars">
        {(stars.length ? stars : ['—']).map((s) => <span key={s} className="ziwei-star">{s}</span>)}
      </div>
      <p className="wx-advice">
        {stars.length
          ? `${t('fortune.ziweiNote')}：${stars.slice(0, 3).join('、')}`
          : t('fortune.ziweiEmpty')}
      </p>
    </section>
  );
}
