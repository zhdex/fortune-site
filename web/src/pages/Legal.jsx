import React, { useState } from 'react';
import { useI18n } from '../i18n/index.js';
import { LEGAL } from '../i18n/legal.js';
import { setConsent, hasConsent, peekPending } from '../lib/consent.js';

function Doc({ doc }) {
  return (
    <article className="legal-doc">
      <h2 className="legal-h2">{doc.title}</h2>
      {doc.intro && <p className="legal-p legal-intro">{doc.intro}</p>}
      {doc.sections.map((s) => (
        <section key={s.h} className="legal-sec">
          <h3 className="legal-h3">{s.h}</h3>
          {s.p.map((txt) => <p key={txt.slice(0, 24)} className="legal-p">{txt}</p>)}
        </section>
      ))}
      {doc.footer && <p className="legal-note">{doc.footer}</p>}
    </article>
  );
}

export default function Legal() {
  const { t, lang } = useI18n();
  const legal = LEGAL[lang] || LEGAL['zh-CN'];
  const [status, setStatus] = useState(hasConsent() ? 'agreed' : '');

  const agree = () => {
    setConsent();
    setStatus('agreed');
    const pending = peekPending();
    if (pending?.from) {
      // 回到原页面：那边的挂载钩子会读取 pending 并重新打开付款弹窗
      window.location.hash = pending.from;
    }
  };

  const disagree = () => {
    setStatus('refused');
    window.location.hash = '#/';
  };

  return (
    <div className="legal-page container">
      <header className="page-head">
        <span className="kicker">LEGAL</span>
        <h1 className="page-title">{t('nav.legal')}</h1>
        <p className="page-sub">
          {t('legal.updated')} · {legal.updated}
        </p>
      </header>

      <div className="glass section-block legal-block">
        <Doc doc={legal.disclaimer} />
        <div className="legal-divider" />
        <Doc doc={legal.refund} />
      </div>

      <div className="consent-card">
        <h3 className="consent-title">{legal.consent.title}</h3>
        <p className="consent-lead">{legal.consent.lead}</p>

        <div className="consent-actions">
          <button className="btn btn-gold" onClick={agree}>{legal.consent.agree}</button>
          <button className="btn btn-ghost" onClick={disagree}>{legal.consent.disagree}</button>
        </div>

        {status === 'agreed' && <p className="consent-status ok">{legal.consent.agreed}</p>}
        {status === 'refused' && <p className="consent-status no">{legal.consent.refused}</p>}
      </div>
    </div>
  );
}
