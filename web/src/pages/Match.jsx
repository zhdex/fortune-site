import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import PayModal from '../components/PayModal.jsx';
import { scopeCovers } from '../../../shared/catalog.mjs';
import { takePending } from '../lib/consent.js';
import { useI18n } from '../i18n/index.js';
import { getEntitlements } from '../lib/api.js';

const YEARS = Array.from({ length: 101 }, (_, i) => 2026 - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const HOURS = [
  ['未知', -1], ['子时', 23], ['丑时', 1], ['寅时', 3], ['卯时', 5], ['辰时', 7],
  ['巳时', 9], ['午时', 11], ['未时', 13], ['申时', 15], ['酉时', 17], ['戌时', 19], ['亥时', 21],
];

function PersonForm({ label, value, onChange, t }) {
  const set = (k) => (e) => onChange({ ...value, [k]: k === 'hour' ? Number(e.target.value) : Number(e.target.value) || e.target.value });
  return (
    <div className="pair-card">
      <div className="pair-head">{label}</div>
      <div className="form-grid pair-grid">
        <div className="field">
          <label>{t('match.year')}</label>
          <select value={value.year} onChange={set('year')}>{YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</select>
        </div>
        <div className="field">
          <label>{t('match.month')}</label>
          <select value={value.month} onChange={set('month')}>{MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}</select>
        </div>
        <div className="field">
          <label>{t('match.day')}</label>
          <select value={value.day} onChange={set('day')}>{DAYS.map((d) => <option key={d} value={d}>{d}</option>)}</select>
        </div>
        <div className="field">
          <label>{t('match.hour')}</label>
          <select value={value.hour} onChange={set('hour')}>
            {HOURS.map(([lb, v]) => <option key={v} value={v}>{v < 0 ? t('fortune.hourUnknown') : lb}</option>)}
          </select>
        </div>
        <div className="field">
          <label>{t('match.gender')}</label>
          <select value={value.gender} onChange={(e) => onChange({ ...value, gender: e.target.value })}>
            <option value="女">{t('fortune.female')}</option>
            <option value="男">{t('fortune.male')}</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default function Match() {
  const { t } = useI18n();
  const [a, setA] = useState({ year: 1995, month: 8, day: 15, hour: -1, gender: '女' });
  const [b, setB] = useState({ year: 1993, month: 5, day: 20, hour: -1, gender: '男' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(null);

  useEffect(() => {
    const p = takePending();
    if (p?.product) setPaying(p.product);
  }, []);

  const toInput = (x) => ({ ...x, hour: x.hour < 0 ? 12 : x.hour });
  const run = async () => {
    setLoading(true);
    try {
      const r = await api.match({ a: toInput(a), b: toInput(b) });
      setResult(r);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const free = result && !result.entitled ? result.free : null;
  const data = result && result.entitled ? result.data : null;
  const open = (product) => setPaying(product);

  return (
    <div className="match-page container">
      <header className="page-head">
        <span className="kicker">LOVE &amp; COMPATIBILITY</span>
        <h1 className="page-title">{t('match.title')}</h1>
        <p className="page-sub">{t('match.sub')}</p>
      </header>

      <section className="glass section-block fortune-note">
        <h3>{t('match.introTitle')}</h3>
        <p className="lead">{t('match.introLead')}</p>
        <ul className="fortune-list">
          {['i1', 'i2', 'i3'].map((k, i) => (
            <li key={k}>
              <span className="mark">{i + 1}</span>
              <span><b>{t(`match.${k}t`)}</b>：{t(`match.${k}d`)}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="glass section-block">
        <div className="pair-forms">
          <PersonForm label={t('match.aLabel')} value={a} onChange={setA} t={t} />
          <PersonForm label={t('match.bLabel')} value={b} onChange={setB} t={t} />
        </div>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button className="btn btn-gold btn-lg" disabled={loading} onClick={run}>
            {loading ? t('match.running') : `✦ ${t('match.run')}`}
          </button>
        </div>
        <p className="disclaimer">{t('match.formNote')}</p>
      </div>

      {(free || data) && (
        <>
          <section className="glass section-block score-hero">
            <div className="score-ring tone-mid" style={{ '--pct': `${(free || data).score * 3.6}deg` }}>
              <div className="score-inner">
                <span className="score-num">{(free || data).score}</span>
                <span className="score-label">{t('match.score')}</span>
              </div>
            </div>
            <div className="score-copy">
              <div className="quiz-headline">{(free || data).headline}</div>
              <div className="pair-chips">
                <span className="chip gold">A：{(free || data).pair.a.gan}{(free || data).pair.a.element} · {t('match.zodiacTag')} {(free || data).pair.a.zodiac}</span>
                <span className="chip gold">B：{(free || data).pair.b.gan}{(free || data).pair.b.element} · {t('match.zodiacTag')} {(free || data).pair.b.zodiac}</span>
                <span className="chip">{(free || data).relation.label} · {(free || data).zodiac.text}</span>
              </div>
            </div>
          </section>

          <section className="glass section-block">
            <h3 className="section-title">{t('match.evidence')}</h3>
            <ul className="evidence-list">
              {((free || data).evidence || []).map((x) => <li key={x}>{x}</li>)}
            </ul>
            {free && (
              <p className="locked-line">
                🔒 {t('match.lockedNote').replace('{n}', free.locked.evidence)}
              </p>
            )}
          </section>

          {data && (
            <>
              <section className="glass section-block">
                <h3 className="section-title">{t('match.conflicts')}</h3>
                <ul className="evidence-list warn">
                  {data.conflicts.map((x) => <li key={x}>{x}</li>)}
                </ul>
              </section>
              <section className="glass section-block">
                <h3 className="section-title">{t('match.advice')}</h3>
                <ul className="tips-list">
                  {data.advice.map((x) => <li key={x}>{x}</li>)}
                </ul>
                {result?.deep && (
                  <div className="pair-chips" style={{ marginTop: 16 }}>
                    <span className="chip">A 适配行业：{data.jobs.a}</span>
                    <span className="chip">B 适配行业：{data.jobs.b}</span>
                  </div>
                )}
                {!result?.deep && (
                  <p className="locked-line">🔒 深度合盘另含全部 3 条相处对策与双方适配行业</p>
                )}
              </section>
            </>
          )}

          {free && (
            <section className="glass section-block">
              <h3 className="section-title">{t('match.plans')}</h3>
              <div className="plan-grid three">
                {(result?.prices || []).map((p) => (
                  <button key={p.key} className={`plan-card ${p.highlight ? 'is-highlight' : ''}`} onClick={() => open(p.key)}>
                    <span className="plan-name">{t(`match.plan.${p.key.split(':')[1]}`)}</span>
                    <span className="plan-price"><small>$</small>{Number(p.price).toFixed(2)}</span>
                    <span className="plan-note">{t(`match.planNote.${p.key.split(':')[1]}`)}</span>
                  </button>
                ))}
              </div>
              <p className="disclaimer">{t('match.freeNote')}</p>
            </section>
          )}
        </>
      )}

      {paying && (
        <PayModal
          product={paying}
          onClose={() => setPaying(null)}
          onPaid={() => { setPaying(null); run(); }}
        />
      )}
    </div>
  );
}
