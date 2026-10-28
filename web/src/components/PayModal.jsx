import React, { useState } from 'react';
import { purchase } from '../lib/api.js';
import { PRODUCTS } from '../../../shared/catalog.mjs';
import { useI18n } from '../i18n/index.js';
import { hasConsent, setPending } from '../lib/consent.js';

/**
 * 模拟支付弹窗（占位）
 * props.product 为 shared/catalog.mjs 里的商品键
 * 付款前必须勾选同意《退款政策》；点「查看完整条款」会跳到条款页，同意后自动回到本商品付款。
 */
export default function PayModal({ product, onClose, onPaid }) {
  const { t } = useI18n();
  const p = PRODUCTS[product];
  const [step, setStep] = useState('confirm');
  const [agreed, setAgreed] = useState(hasConsent());

  if (!p) return null;

  const pay = async () => {
    if (!agreed) return;
    setStep('paying');
    try {
      await purchase(product);
      setStep('done');
      setTimeout(() => onPaid?.(), 850);
    } catch {
      setStep('error');
    }
  };

  const openLegal = () => {
    setPending(product, window.location.hash || '#/');
    window.location.hash = '#/legal';
  };

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal glass-strong pay-modal" onClick={(e) => e.stopPropagation()}>
        {step === 'confirm' && (
          <>
            <h3>{t('pay.title')}</h3>
            <div className="pay-product">{p.title}</div>
            <div className="price"><small>$</small>{Number(p.price).toFixed(2)}</div>

            <div className="refund-box">
              <div className="refund-head">
                <span className="refund-title">📄 {t('pay.refundTitle')}</span>
                <button type="button" className="refund-link" onClick={openLegal}>{t('pay.viewFull')}</button>
              </div>
              <p className="refund-text">{t('pay.refundShort')}</p>
            </div>

            <label className={`agree-row ${agreed ? 'is-on' : ''}`}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span className="agree-text">
                {t('pay.agreePrefix')}
                <button type="button" className="agree-link" onClick={openLegal}>{t('pay.refundLink')}</button>
                {t('pay.agreeTail')}
              </span>
            </label>

            <div className="actions">
              <button className="btn btn-gold" disabled={!agreed} onClick={pay}>
                {t('pay.confirm')}
              </button>
              {!agreed && <p className="agree-hint">{t('pay.needAgree')}</p>}
              <button className="btn btn-ghost btn-sm" onClick={onClose}>{t('pay.cancel')}</button>
            </div>

            <p className="pay-demo">{t('pay.demo')}</p>
          </>
        )}

        {step === 'paying' && (
          <div style={{ padding: '30px 0' }}>
            <div style={{ fontSize: 42, marginBottom: 16 }}>🔮</div>
            <p className="typing-hint">{t('pay.paying')}<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></p>
          </div>
        )}

        {step === 'done' && (
          <div style={{ padding: '18px 0' }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>🌟</div>
            <h3>{t('pay.done')}</h3>
            <p className="desc" style={{ marginTop: 10 }}>{t('pay.doneNote')}</p>
          </div>
        )}

        {step === 'error' && (
          <div style={{ padding: '18px 0' }}>
            <div style={{ fontSize: 38, marginBottom: 12 }}>⚠️</div>
            <h3>{t('pay.error')}</h3>
            <div className="actions" style={{ marginTop: 16 }}>
              <button className="btn btn-gold" onClick={pay}>{t('pay.retry')}</button>
              <button className="btn btn-ghost btn-sm" onClick={onClose}>{t('pay.cancel')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
