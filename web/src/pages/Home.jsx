import React, { useEffect, useState } from 'react';
import Mandala from '../components/Mandala.jsx';
import { CARD_ICONS } from '../components/Icons.jsx';
import { useI18n } from '../i18n/index.js';
import { api } from '../lib/api.js';

const CardKeys = ['self', 'career', 'love', 'fortune', 'gua'];

function todayStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function Hero() {
  const { t } = useI18n();
  const go = (h) => () => { window.location.hash = h; };
  return (
    <section className="hero full-bleed">
      <div className="hero-bg" aria-hidden="true">
        {/* 背景统一由 App 的全站固定底图提供，这里只负责文字侧的压暗与氛围 */}
        <div className="hero-veil" />
      </div>

      <div className="hero-inner container-wide">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            <span>{t('hero.eyebrow')}</span>
          </div>

          <h1 className="hero-title">{t('hero.title')}</h1>
          <p className="hero-sub">{t('hero.sub')}</p>

          <div className="hero-actions">
            <button className="btn btn-gold btn-lg" onClick={go('#/fortune')}>
              {t('hero.cta')}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M2 8h11M9 4l4 4-4 4" />
              </svg>
            </button>
            <button className="btn btn-ghost btn-lg" onClick={go('#/daily')}>{t('hero.secondary')}</button>
          </div>

          <ul className="hero-badges">
            {['hero.badge1', 'hero.badge2', 'hero.badge3'].map((k) => (
              <li key={k}><span className="tick">✦</span>{t(k)}</li>
            ))}
          </ul>
        </div>

        <div className="hero-vertical" aria-hidden="true">{t('hero.vertical')}</div>
      </div>
    </section>
  );
}

function CardMedallion({ k }) {
  const [broken, setBroken] = useState(false);
  const Icon = CARD_ICONS[k];
  const file = k === 'gua' ? 'gua-taiji' : `icon-${k}`;
  return (
    <span className="medallion-icon">
      {broken || !Icon
        ? <span className="medallion-fallback">☯</span>
        : (
          <img
            src={`${import.meta.env.BASE_URL}images/gen/${file}.webp`}
            alt=""
            loading="lazy"
            onError={() => setBroken(true)}
          />
        )}
    </span>
  );
}

const CARD_LINK = { fortune: '#/daily', gua: '#/gua' };

function ServiceCards() {
  const { t } = useI18n();
  return (
    <section className="services container-wide">
      <div className="cards-grid">
        {CardKeys.map((k, i) => (
          <button
            key={k}
            className="service-card"
            style={{ animationDelay: `${i * 90}ms` }}
            onClick={() => { window.location.hash = CARD_LINK[k] || '#/fortune'; }}
          >
            <span className="card-ornament tl" />
            <span className="card-ornament tr" />
            <span className="card-ornament bl" />
            <span className="card-ornament br" />

            <span className="card-medallion">
              <span className="medallion-ring" />
              <CardMedallion k={k} />
            </span>

            <span className="card-body">
              <h3 className="card-title">{t(`cards.${k}.title`)}</h3>
              <p className="card-desc">{t(`cards.${k}.desc`)}</p>
              <span className="card-tag">{t(`cards.${k}.tag`)}</span>
            </span>

            <span className="card-arrow" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 8h11M9 4l4 4-4 4" />
              </svg>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useI18n();
  return (
    <section className="how container">
      <header className="section-head">
        <span className="kicker">PROCESS</span>
        <h2 className="section-h2">{t('how.title')}</h2>
        <p className="section-sub">{t('how.sub')}</p>
      </header>
      <ol className="steps">
        {['s1', 's2', 's3'].map((s, i) => (
          <li key={s} className="step">
            <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
            <h4>{t(`how.${s}.t`)}</h4>
            <p>{t(`how.${s}.d`)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function DailyStrip() {
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    api.daily(todayStr())
      .then((r) => { if (alive) setData(r); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, []);

  return (
    <section className="daily-strip container">
      <div className="daily-inner">
        <div className="daily-left">
          <span className="kicker">DAILY QUIZ</span>
          <h2 className="section-h2">{t('quiz.title')}</h2>
          <p className="section-sub">{t('quiz.sub')}</p>
          {data?.daily && (
            <div className="daily-meta">
              <span className="chip gold">{data.daily.dayGanzhi}</span>
              <span className="chip">{data.daily.lunar}</span>
            </div>
          )}
        </div>

        <div className="daily-right">
          {!data && !failed && <div className="daily-skeleton"><span /><span /><span /></div>}
          {data?.daily && (
            <ul className="quiz-points">
              <li><span className="dot-mark">◆</span>{t('quiz.items')}</li>
              <li><span className="dot-mark">◆</span>{t('quiz.lucky')}</li>
              <li><span className="dot-mark">◆</span>{t('quiz.week')}</li>
            </ul>
          )}
          <button className="btn btn-gold btn-sm daily-cta" onClick={() => { window.location.hash = '#/daily'; }}>
            {t('quiz.run')}
          </button>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const { t } = useI18n();
  return (
    <section className="pricing container">
      <div className="pricing-card glass-strong">
        <div className="pricing-art" aria-hidden="true"><Mandala size={360} /></div>
        <div className="pricing-copy">
          <span className="kicker">REPORT</span>
          <h2 className="section-h2">{t('pricing.title')}</h2>
          <p className="section-sub">{t('pricing.sub')}</p>
          <ul className="feature-list">
            {['f1', 'f2', 'f3', 'f4', 'f5', 'f6'].map((f) => (
              <li key={f}>
                <span className="check">✓</span>
                {t(`pricing.${f}`)}
              </li>
            ))}
          </ul>
        </div>

        <div className="pricing-buy">
          <div className="price-tag">
            <span className="currency">¥</span>
            <span className="amount">{t('pricing.price')}</span>
          </div>
          <div className="price-unit">{t('pricing.unit')}</div>
          <button className="btn btn-gold btn-lg btn-block" onClick={() => { window.location.hash = '#/fortune'; }}>
            {t('pricing.cta')}
          </button>
          <p className="price-note">{t('pricing.note')}</p>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const { t } = useI18n();
  return (
    <section className="faq container">
      <header className="section-head">
        <span className="kicker">FAQ</span>
        <h2 className="section-h2">{t('faq.title')}</h2>
      </header>
      <div className="faq-list">
        {[1, 2, 3, 4].map((i) => (
          <details key={i} className="faq-item">
            <summary>
              <span>{t(`faq.q${i}`)}</span>
              <span className="faq-plus" aria-hidden="true">+</span>
            </summary>
            <p>{t(`faq.a${i}`)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="home">
      <Hero />
      <ServiceCards />
      <HowItWorks />
      <DailyStrip />
      <Pricing />
      <Faq />
    </div>
  );
}
