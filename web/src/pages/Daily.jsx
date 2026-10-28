import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import PayModal from '../components/PayModal.jsx';
import { DAILY_PRODUCTS, PRODUCTS } from '../../../shared/catalog.mjs';
import { takePending } from '../lib/consent.js';
import { saveDraft, loadDraft } from '../lib/draft.js';
import { useI18n } from '../i18n/index.js';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const YEARS = Array.from({ length: 101 }, (_, i) => 2026 - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

function ScoreRing({ score }) {
  const { t } = useI18n();
  const pct = Math.max(0, Math.min(100, score));
  const tone = pct >= 75 ? 'high' : pct >= 55 ? 'mid' : 'low';
  return (
    <div className={`score-ring tone-${tone}`} style={{ '--pct': `${pct * 3.6}deg` }}>
      <div className="score-inner">
        <span className="score-num">{pct}</span>
        <span className="score-label">{t('quiz.score')}</span>
      </div>
    </div>
  );
}

function ColorDot({ color, label }) {
  return (
    <div className="color-chip">
      <span className="color-swatch" style={{ background: color.hex }} />
      <span className="color-meta">
        <b>{color.name}</b>
        <small>{label}</small>
      </span>
    </div>
  );
}

function PlanCards({ onBuy }) {
  const { t } = useI18n();
  return (
    <div className="plan-grid">
      {DAILY_PRODUCTS.map((key) => {
        const p = PRODUCTS[key];
        return (
          <button
            key={key}
            className={`plan-card ${p.highlight ? 'is-highlight' : ''}`}
            onClick={() => onBuy(key)}
          >
            {p.highlight && <span className="plan-badge">{t('quiz.bestValue')}</span>}
            <span className="plan-name">{t(`quiz.plan.${key.split(':')[1]}`)}</span>
            <span className="plan-price"><small>$</small>{Number(p.price).toFixed(2)}</span>
            <span className="plan-note">{t(`quiz.planNote.${key.split(':')[1]}`)}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function Daily() {
  const { t } = useI18n();
  const [birth, setBirth] = useState({ year: 1995, month: 8, day: 15 });
  const [date, setDate] = useState(today());
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(null);

  const run = async (nextDate = date, nextBirth = birth) => {
    setLoading(true);
    try {
      const r = await api.dailyQuiz({ birth: nextBirth, date: nextDate });
      setResult(r);
      saveDraft('daily', { birth: nextBirth, date: nextDate });
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // 首次加载：恢复草稿（若有）并重开待付款订单
  useEffect(() => {
    const draft = loadDraft('daily');
    if (draft?.birth) {
      setBirth(draft.birth);
      setDate(draft.date);
      run(draft.date, draft.birth);
    } else {
      run(today());
    }
    const p = takePending();
    if (p?.product) setPaying(p.product);
  }, []);

  const set = (k) => (e) => setBirth((b) => ({ ...b, [k]: Number(e.target.value) }));
  const free = result && !result.entitled ? result.free : null;
  const full = result && result.entitled ? result.quiz : null;

  return (
    <div className="daily-page container">
      <header className="page-head">
        <span
          className="page-head-sigil"
          aria-hidden="true"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/gen/sigil.webp)` }}
        />
        <span className="kicker">DAILY QUIZ</span>
        <h1 className="page-title">{t('quiz.title')}</h1>
        <p className="page-sub">{t('quiz.sub')}</p>
      </header>

      <div className="glass section-block quiz-form">
        <div className="form-grid quiz-birth">
          <div className="field">
            <label>{t('quiz.year')}</label>
            <select value={birth.year} onChange={set('year')}>{YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</select>
          </div>
          <div className="field">
            <label>{t('quiz.month')}</label>
            <select value={birth.month} onChange={set('month')}>{MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}</select>
          </div>
          <div className="field">
            <label>{t('quiz.day')}</label>
            <select value={birth.day} onChange={set('day')}>{DAYS.map((d) => <option key={d} value={d}>{d}</option>)}</select>
          </div>
          <div className="field">
            <label>{t('quiz.pickDate')}</label>
            <input
              type="date"
              className="date-input"
              value={date}
              min="1900-01-01"
              max="2100-12-31"
              onChange={(e) => { if (e.target.value) { setDate(e.target.value); run(e.target.value); } }}
            />
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 22 }}>
          <button className="btn btn-gold btn-lg" disabled={loading} onClick={() => run(date)}>
            {loading ? t('quiz.running') : `✦ ${t('quiz.run')}`}
          </button>
        </div>
        <p className="disclaimer">{t('quiz.freeNote')}</p>
      </div>

      {(free || full) && (
        <div className="quiz-result">
          {/* 免费区：谁 + 能量分 + 颜色 */}
          <div className="glass section-block quiz-hero">
            <div className="quiz-who">
              <div className="quiz-type">
                <span className="quiz-type-row">
                  <b>{t('quiz.zodiac')}</b>
                  <span className="quiz-type-val">{(full || free).user.zodiac}</span>
                </span>
                <span className="quiz-type-row">
                  <b>{t('quiz.constellation')}</b>
                  <span className="quiz-type-val">{(full || free).user.constellation}</span>
                </span>
                <span className="quiz-type-row">
                  <b>{t('quiz.element')}</b>
                  <span className="quiz-type-val">{(full || free).user.element}</span>
                </span>
                <span className="quiz-type-row">
                  <b>{t('quiz.todayGz')}</b>
                  <span className="quiz-type-val">{(full || free).today.ganZhi}</span>
                </span>
              </div>
              <div className="quiz-colors">
                <ColorDot color={(full || free).luckyColor} label={t('quiz.lucky')} />
                <ColorDot color={(full || free).avoidColor} label={t('quiz.avoid')} />
              </div>
            </div>
            <ScoreRing score={(full || free).score} />
          </div>

          <div className="glass section-block">
            <p className="quiz-headline">{(full || free).headline}</p>
            <p className="prose quiz-tip">{(full || free).oneTip}</p>
          </div>

          {/* 完整区（订阅）或锁定区 */}
          {full && (
            <>
              <section className="glass section-block">
                <h3 className="section-title">{t('quiz.items')}</h3>
                <div className="verdict-grid">
                  {full.items.map((it) => (
                    <div key={it.key} className={`verdict-card v-${it.verdict}`}>
                      <span className="verdict-icon">
                        <img
                          src={`${import.meta.env.BASE_URL}images/gen/scene-${it.key}.webp`}
                          alt=""
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </span>
                      <span className="verdict-name">{t(`quiz.item.${it.key}`)}</span>
                      <span className="verdict-tag">{t(`quiz.verdict.${it.verdict}`)}</span>
                      <span className="verdict-bar"><i style={{ width: `${it.value}%` }} /></span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="glass section-block">
                <h3 className="section-title">{t('quiz.tips')}</h3>
                <ul className="tips-list">
                  {full.tips.map((x) => <li key={x}>{x}</li>)}
                </ul>
              </section>

              {result.week && (
                <section className="glass section-block">
                  <h3 className="section-title">{t('quiz.week')}</h3>
                  <div className="week-list">
                    {result.week.map((w) => (
                      <div key={w.date} className="week-row">
                        <span className="week-date">{w.date.slice(5)}</span>
                        <span className="week-bar"><i style={{ width: `${w.score}%` }} /></span>
                        <span className="week-score">{w.score}</span>
                        <span className="week-lucky">{w.lucky}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {free && (
            <>
              <section className="glass section-block">
                <h3 className="section-title">{t('quiz.items')}</h3>
                <div className="verdict-grid">
                  {free.sample.map((it) => (
                    <div key={it.key} className={`verdict-card v-${it.verdict}`}>
                      <span className="verdict-icon">
                        <img
                          src={`${import.meta.env.BASE_URL}images/gen/scene-${it.key}.webp`}
                          alt=""
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </span>
                      <span className="verdict-name">{t(`quiz.item.${it.key}`)}</span>
                      <span className="verdict-tag">{t(`quiz.verdict.${it.verdict}`)}</span>
                    </div>
                  ))}
                  <div className="verdict-card v-locked">
                    <span className="verdict-lock">🔒</span>
                    <span className="verdict-name">
                      {t('quiz.locked').replace('{n}', free.lockedCount)}
                    </span>
                  </div>
                </div>
              </section>

              <section className="glass section-block">
                <h3 className="section-title">{t('quiz.plans')}</h3>
                <PlanCards onBuy={setPaying} />
                <p className="disclaimer">{t('quiz.yearNote')}</p>
              </section>
            </>
          )}
        </div>
      )}

      <p className="disclaimer">{t('quiz.disclaimer')}</p>

      {paying && (
        <PayModal
          product={paying}
          onClose={() => setPaying(null)}
          onPaid={() => { setPaying(null); run(date); }}
        />
      )}
    </div>
  );
}
