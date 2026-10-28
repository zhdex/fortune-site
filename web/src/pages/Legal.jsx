import React, { useEffect, useRef } from 'react';
import { useI18n } from '../i18n/index.js';
import { LEGAL } from '../i18n/legal.js';
import { peekPending } from '../lib/consent.js';
import { PRODUCTS } from '../../../shared/catalog.mjs';

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
  const refundRef = useRef(null);
  const pending = peekPending();

  // 从付款弹窗跳来、且指向退款政策时，直接滚到退款政策那一段
  useEffect(() => {
    if (pending?.focus === 'refund' && refundRef.current) {
      refundRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const backToPay = () => {
    window.location.hash = pending?.from || '#/';
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
        <div ref={refundRef}>
          <Doc doc={legal.refund} />
        </div>
      </div>

      {pending?.product && PRODUCTS[pending.product] && (
        <div className="consent-card">
          <h3 className="consent-title">{t('legal.pendingTitle')}</h3>
          <p className="consent-lead">
            {t('legal.pendingNote')}
            <br />
            <strong>{PRODUCTS[pending.product].title}</strong> · ${Number(PRODUCTS[pending.product].price).toFixed(2)}
          </p>
          <div className="consent-actions">
            <button className="btn btn-gold" onClick={backToPay}>{t('legal.returnToPay')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
