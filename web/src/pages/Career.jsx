import React, { useEffect, useState } from 'react';
import { api, getEntitlements } from '../lib/api.js';
import PayModal from '../components/PayModal.jsx';
import { takePending } from '../lib/consent.js';
import { useI18n } from '../i18n/index.js';

const YEARS = Array.from({ length: 101 }, (_, i) => 2026 - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const HOURS = [
  ['未知', -1], ['子时', 23], ['丑时', 1], ['寅时', 3], ['卯时', 5], ['辰时', 7],
  ['巳时', 9], ['午时', 11], ['未时', 13], ['申时', 15], ['酉时', 17], ['戌时', 19], ['亥时', 21],
];

export default function Career() {
  const { t } = useI18n();
  const [form, setForm] = useState({ year: 1995, month: 8, day: 15, hour: -1, gender: '女' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(null);

  useEffect(() => {
    const p = takePending();
    if (p?.product) setPaying(p.product);
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: k === 'hour' ? Number(e.target.value) : Number(e.target.value) || e.target.value }));

  const run = async () => {
    setLoading(true);
    try {
      const input = { ...form, hour: form.hour < 0 ? 12 : form.hour };
      const r = await api.career({ input });
      setResult(r);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const free = result && !result.entitled ? result.free : null;
  const data = result && result.entitled ? result.data : null;

  return (
    <div className="career-page container">
      <header className="page-head">
        <span className="kicker">CAREER &amp; EDUCATION</span>
        <h1 className="page-title">{t('career.title')}</h1>
        <p className="page-sub">{t('career.sub')}</p>
      </header>

      <section className="glass section-block fortune-note">
        <h3>{t('career.introTitle')}</h3>
        <p className="lead">{t('career.introLead')}</p>
        <ul className="fortune-list">
          {['i1', 'i2', 'i3'].map((k, i) => (
            <li key={k}>
              <span className="mark">{i + 1}</span>
              <span><b>{t(`career.${k}t`)}</b>：{t(`career.${k}d`)}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="glass section-block form-card">
        <div className="form-grid">
          <div className="field">
            <label>{t('career.year')}</label>
            <select value={form.year} onChange={set('year')}>{YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</select>
          </div>
          <div className="field">
            <label>{t('career.month')}</label>
            <select value={form.month} onChange={set('month')}>{MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}</select>
          </div>
          <div className="field">
            <label>{t('career.day')}</label>
            <select value={form.day} onChange={set('day')}>{DAYS.map((d) => <option key={d} value={d}>{d}</option>)}</select>
          </div>
          <div className="field">
            <label>{t('career.hour')}</label>
            <select value={form.hour} onChange={set('hour')}>
              {HOURS.map(([lb, v]) => <option key={v} value={v}>{v < 0 ? t('fortune.hourUnknown') : lb}</option>)}
            </select>
          </div>
          <div className="field">
            <label>{t('career.gender')}</label>
            <select value={form.gender} onChange={set('gender')}>
              <option value="女">{t('fortune.female')}</option>
              <option value="男">{t('fortune.male')}</option>
            </select>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button className="btn btn-gold btn-lg" disabled={loading} onClick={run}>
            {loading ? t('career.running') : `✦ ${t('career.run')}`}
          </button>
        </div>
        <p className="disclaimer">{t('career.formNote')}</p>
      </div>

      {(free || data) && (
        <>
          <section className="glass section-block">
            <div className="quiz-headline">{(free || data).headline}</div>
            <div className="pair-chips" style={{ justifyContent: 'center', marginTop: 12 }}>
              <span className="chip gold">{t('career.strongest')}：{(free || data).strongest}</span>
              <span className="chip">{t('career.learning')}：{(free || data).learning?.style || (free || data).learningStyle}</span>
              {((free || data).counts || []).map((c) => (
                <span key={c.element} className="chip">{c.element} {c.count}</span>
              ))}
            </div>
          </section>

          <section className="glass section-block">
            <h3 className="section-title">{t('career.strengths')}</h3>
            <div className="strength-list">
              {((free || data).strengths || []).map((s) => (
                <div key={s.title} className="strength-item">
                  <h4>{s.title}</h4>
                  <p>{s.text}</p>
                  <span className="evidence-tag">{s.evidence}</span>
                </div>
              ))}
            </div>
            {free && <p className="locked-line">🔒 {t('career.lockedNote').replace('{n}', free.locked.strengths)}</p>}
          </section>

          {data && (
            <>
              <section className="glass section-block">
                <h3 className="section-title">{t('career.jobs')}</h3>
                <div className="job-tags">
                  {data.jobs.map((j) => <span key={j} className="job-tag">{j}</span>)}
                </div>
              </section>
              <section className="glass section-block">
                <h3 className="section-title">{t('career.stages')}</h3>
                <div className="stage-list">
                  {data.stages.map((s) => (
                    <div key={s.range} className="stage-row">
                      <span className="stage-range">{s.range}</span>
                      <span className="stage-theme">{s.theme}</span>
                      <span className="stage-advice">{s.advice}</span>
                    </div>
                  ))}
                </div>
              </section>
              <section className="glass section-block">
                <h3 className="section-title">{t('career.advice')}</h3>
                <ul className="tips-list">{data.advice.map((x) => <li key={x}>{x}</li>)}</ul>
                <ul className="evidence-list" style={{ marginTop: 16 }}>
                  {(data.evidence || []).map((x) => <li key={x}>{x}</li>)}
                </ul>
              </section>
            </>
          )}

          {free && (
            <section className="glass section-block">
              <h3 className="section-title">{t('career.plans')}</h3>
              <div className="plan-grid three">
                {(result?.prices || []).map((p) => (
                  <button key={p.key} className={`plan-card ${p.highlight ? 'is-highlight' : ''}`} onClick={() => setPaying(p.key)}>
                    <span className="plan-name">{t(`career.plan.${p.key.split(':')[1]}`)}</span>
                    <span className="plan-price"><small>$</small>{Number(p.price).toFixed(2)}</span>
                    <span className="plan-note">{t(`career.planNote.${p.key.split(':')[1]}`)}</span>
                  </button>
                ))}
              </div>
              <p className="disclaimer">{t('career.freeNote')}</p>
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
