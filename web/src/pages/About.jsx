import React from 'react';
import { useI18n } from '../i18n/index.js';

export default function About() {
  const { t } = useI18n();
  const values = ['v1', 'v2', 'v3'];

  return (
    <div className="about container">
      <header className="page-head">
        <span
          className="page-head-sigil"
          aria-hidden="true"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/gen/sigil.webp)` }}
        />
        <span className="kicker">ABOUT</span>
        <h1 className="page-title">{t('about.title')}</h1>
        <p className="page-sub">{t('about.p1')}</p>
      </header>

      <div className="about-body">
        <p className="prose">{t('about.p2')}</p>
        <p className="prose">{t('about.p3')}</p>
        <p className="prose about-quote">{t('about.p4')}</p>
      </div>

      <section className="values">
        <h2 className="section-h2">{t('about.values')}</h2>
        <div className="values-grid">
          {values.map((v, i) => (
            <div className="value-card" key={v}>
              <span className="value-index">{String(i + 1).padStart(2, '0')}</span>
              <h4>{t(`about.${v}.t`)}</h4>
              <p>{t(`about.${v}.d`)}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="disclaimer">{t('footer.disclaimer')}</p>
    </div>
  );
}
