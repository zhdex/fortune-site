import React, { useEffect, useRef, useState } from 'react';
import { streamInterpret, getTokens, ensureMode, onModeChange } from '../lib/api.js';
import PayModal from '../components/PayModal.jsx';
import { useI18n } from '../i18n/index.js';

const YEARS = Array.from({ length: 101 }, (_, i) => 2026 - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const HOURS = [
  ['未知', -1], ['子时 23-01', 23], ['丑时 01-03', 1], ['寅时 03-05', 3], ['卯时 05-07', 5],
  ['辰时 07-09', 7], ['巳时 09-11', 9], ['午时 11-13', 11], ['未时 13-15', 13],
  ['申时 15-17', 15], ['酉时 17-19', 17], ['戌时 19-21', 19], ['亥时 21-23', 21],
];

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

/* ------------------------- 排盘展示 ------------------------- */
function ChartCard({ chart, mode }) {
  if (mode === 'bazi') {
    return (
      <div className="glass section-block">
        <h3 className="section-title">八字排盘</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <span className="chip">公历 {chart.birth?.solar?.slice(0, 10)}</span>
          <span className="chip">{chart.birth?.shichen}</span>
          <span className="chip">农历 {chart.lunar}</span>
          <span className="chip gold">属{chart.zodiac}</span>
        </div>
        <div className="pillars">
          {chart.pillars.map((p) => (
            <div key={p.label} className="pillar">
              <div className="label">{p.label}</div>
              <div className="gan-zhi">{p.gan}{p.zhi}</div>
              <div className="meta">{p.wuxing}<br />{p.nayin}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <span className="chip gold">日主：{chart.dayMaster.gan} · {chart.dayMaster.wuxing}</span>
          <span className="chip">五行最旺：{chart.wuxing.strongest}</span>
          <span className="chip">五行最弱：{chart.wuxing.weakest}</span>
          {chart.wuxing.missing.length > 0 && <span className="chip">五行缺：{chart.wuxing.missing.join('、')}</span>}
        </div>
        {chart.dayun?.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <p style={{ color: 'var(--text-low)', fontSize: 13, letterSpacing: 2, marginBottom: 6 }}>大运节律</p>
            <div className="tag-row">
              {chart.dayun.slice(0, 8).map((d) => (
                <span key={d.ganzhi + d.startAge} className="chip">{d.startAge}-{d.endAge}岁 {d.ganzhi}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="glass section-block">
      <h3 className="section-title">紫微命盘</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <span className="chip gold">命主：{chart.soul}</span>
        <span className="chip">身宫：{chart.body}</span>
        <span className="chip">{chart.fiveElementsClass}</span>
        <span className="chip">{chart.shichen}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 10 }}>
        {chart.palaces.map((p) => (
          <div key={p.name + p.branch} className="pillar" style={p.name === '命宫' ? { borderColor: 'rgba(245,215,142,0.45)' } : undefined}>
            <div className="label">
              {p.name}{p.isBody ? ' · 身' : ''}（{p.branch}{p.stem}）
            </div>
            <div className="meta" style={{ fontSize: 13.5, color: 'var(--text-mid)', marginTop: 6 }}>
              {p.majorStars.length
                ? p.majorStars.map((s) => `${s.name}${s.brightness}${s.mutagen ? '·化' + s.mutagen : ''}`).join('　')
                : <span style={{ color: 'var(--text-low)' }}>无主星，借对宫</span>}
              {p.minorStars.length > 0 && <span style={{ color: 'var(--text-low)', fontSize: 12 }}>　{p.minorStars.join('、')}</span>}
            </div>
            {p.decadal && <div style={{ color: 'var(--text-low)', fontSize: 11, marginTop: 6 }}>{p.decadal[0]}-{p.decadal[1]} 大限</div>}
          </div>
        ))}
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
  const [freeText, setFreeText] = useState({ summary: '', love: '', career: '' });
  const [premium, setPremium] = useState([]);
  const [locked, setLocked] = useState(null);
  const [done, setDone] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [engine, setEngine] = useState('unknown'); // server=连后端真实AI | static=浏览器本地演示
  const abortRef = useRef(null);
  const reportRef = useRef(null);
  const lastInputRef = useRef(null);

  useEffect(() => {
    const off = onModeChange(setEngine);
    ensureMode();
    return off;
  }, []);

  const start = ({ mode: m, ...input }) => {
    setMode(m);
    setLoading(true);
    setStarted(true);
    setChart(null); setHeadline(''); setFreeText({ summary: '', love: '', career: '' });
    setPremium([]); setLocked(null); setDone(false);
    const payload = {
      year: Number(input.year),
      month: Number(input.month),
      day: Number(input.day),
      hour: Number(input.hour) < 0 ? 12 : Number(input.hour), // 时辰未知按午时排
      gender: input.gender,
    };
    lastInputRef.current = { mode: m, ...payload };
    const token = getTokens()[m] || '';
    abortRef.current?.();
    abortRef.current = streamInterpret({
      type: m,
      input: payload,
      token,
      handlers: {
        onChart: (d) => { setChart(d.chart); setLoading(false); setTimeout(() => reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150); },
        onHeadline: setHeadline,
        onDelta: (d) => setFreeText((prev) => ({ ...prev, [d.section]: (prev[d.section] || '') + d.text })),
        onPremium: (s) => setPremium((prev) => [...prev, s]),
        onLocked: (d) => setLocked(d),
        onDone: () => setDone(true),
        onError: () => setLoading(false),
      },
    });
  };

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

      {engine === 'static' && (
        <div className="glass static-note">✦ {t('fortune.staticTip')}</div>
      )}

      <BirthForm onSubmit={start} loading={loading} />

      {started && chart && (
        <div ref={reportRef}>
          <ChartCard chart={chart} mode={mode} />

          <div className="glass section-block" style={{ textAlign: 'center' }}>
            {headline ? (
              <div className="headline">{headline}</div>
            ) : (
              <p className="typing-hint">{t('fortune.waiting')}<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></p>
            )}
          </div>

          {[
            ['summary', '🌙 总运概览'],
            ['love', '💞 爱情看这'],
            ['career', '🏔 事业看这'],
          ].map(([key, title]) => (
            freeText[key] && (
              <div key={key} className="glass section-block">
                <h3 className="section-title">{title}</h3>
                <p className={`prose ${done ? '' : 'caret'}`}>{freeText[key]}</p>
              </div>
            )
          ))}

          {premium.map((s) => (
            <div key={s.title} className="premium-card">
              <div className="premium-title">♛ {s.title}</div>
              <p className="prose" style={{ marginTop: 10 }}>{s.content}</p>
            </div>
          ))}

          {locked && (
            <div className="premium-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 30, marginBottom: 10 }}>🔒</div>
              <div className="premium-title" style={{ fontSize: 17 }}>
                {t('fortune.lockedTitle').replace('{n}', locked.count)}
              </div>
              <div className="blur-locked" aria-hidden="true">
                <p className="prose" style={{ marginTop: 10 }}>
                  {locked.titles.map((x) => `${x}：…`).join('　')}
                </p>
              </div>
              <p className="disclaimer" style={{ marginTop: 14 }}>{locked.titles.join(' · ')}</p>
              <button className="btn btn-gold" style={{ marginTop: 16 }} onClick={() => setShowPay(true)}>
                ♛ ￥9.9 {t('fortune.unlock')}
              </button>
            </div>
          )}
        </div>
      )}

      {started && loading && !chart && (
        <div className="glass section-block" style={{ textAlign: 'center' }}>
          <p className="typing-hint">{t('fortune.waiting')}<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></p>
        </div>
      )}

      {showPay && (
        <PayModal
          type={mode}
          onClose={() => setShowPay(false)}
          onPaid={() => {
            setShowPay(false);
            if (lastInputRef.current) start(lastInputRef.current); // 凭新令牌重放，带出付费章节
          }}
        />
      )}
    </div>
  );
}
