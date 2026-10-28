import React, { useState } from 'react';
import { purchase } from '../lib/api.js';
import { PRODUCTS, priceText } from '../../../shared/catalog.mjs';
import { useI18n } from '../i18n/index.js';

/**
 * 模拟支付弹窗（占位）
 * props.product 为 shared/catalog.mjs 里的商品键，例如 'chapter:love' / 'daily:year' / 'bundle:reading'
 * 确认后：后端模式签发 HMAC 令牌，静态模式写入本地演示凭证；两种模式都落到同一个凭证仓。
 */
export default function PayModal({ product, onClose, onPaid }) {
  const { t } = useI18n();
  const p = PRODUCTS[product];
  const [step, setStep] = useState('confirm'); // confirm | paying | done | error

  if (!p) return null;

  const pay = async () => {
    setStep('paying');
    try {
      await purchase(product);
      setStep('done');
      setTimeout(() => onPaid?.(), 850);
    } catch {
      setStep('error');
    }
  };

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal glass-strong" onClick={(e) => e.stopPropagation()}>
        {step === 'confirm' && (
          <>
            <h3>{t('pay.title')}</h3>
            <div className="pay-product">{p.title}</div>
            <div className="price"><small>$</small>{Number(p.price).toFixed(2)}</div>
            <p className="desc">
              {t('pay.desc')}
              <br />
              {t('pay.demo')}
            </p>
            <div className="actions">
              <button className="btn btn-gold" onClick={pay}>{t('pay.confirm')}</button>
              <button className="btn btn-ghost btn-sm" onClick={onClose}>{t('pay.cancel')}</button>
            </div>
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
