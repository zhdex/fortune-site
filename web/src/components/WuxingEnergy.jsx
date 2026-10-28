import React from 'react';
import { useI18n } from '../i18n/index.js';

const FALLBACK_GLYPH = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };

/**
 * 五行能量卡：把"四柱八字"翻译成人人能看懂的五个能量条。
 * 数据来自 computeBazi 的 elements（含每行数量、占比、是否为喜用）。
 */
export default function WuxingEnergy({ chart }) {
  const { t } = useI18n();
  const elements = chart?.elements || [];
  const wx = chart?.wuxing || {};
  const strengthKey = wx.strength || 'balanced';

  return (
    <section className="wuxing glass section-block">
      <div className="wuxing-head">
        <div>
          <h3 className="section-title">{t('fortune.elements')}</h3>
          <p className="wx-sub">{t('fortune.elementsSub')}</p>
        </div>
        <div className="wx-chips">
          <span className="chip gold">{t('fortune.dayMaster')}：{chart?.dayMaster?.gan} · {chart?.dayMaster?.wuxing}</span>
          <span className={`chip strength strength-${strengthKey}`}>{t(`fortune.strength.${strengthKey}`)}</span>
        </div>
      </div>

      <div className="wx-grid">
        {elements.map((el) => (
          <div key={el.key} className={`wx-card ${el.favored ? 'is-favored' : ''}`}>
            <span className="wx-icon">
              <img
                src={`${import.meta.env.BASE_URL}images/gen/wuxing-${el.key}.webp`}
                alt=""
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const s = e.currentTarget.nextElementSibling;
                  if (s) s.style.display = 'grid';
                }}
              />
              <span className="wx-glyph" style={{ display: 'none' }}>{FALLBACK_GLYPH[el.key]}</span>
            </span>
            <span className="wx-en">{el.en}</span>
            <span className="wx-cn">{el.element}</span>
            <span className="wx-keyword">{el.keyword}</span>
            <span className="wx-bars" aria-label={`${el.count}/8`}>
              {Array.from({ length: 8 }, (_, i) => (
                <i key={i} className={i < el.count ? 'on' : ''} />
              ))}
            </span>
            <span className="wx-count">{el.count} / 8</span>
            {el.favored && <span className="wx-favored">{t('fortune.favored')}</span>}
          </div>
        ))}
      </div>

      <p className="wx-advice">{wx.advice}</p>

      {wx.missing?.length > 0 && (
        <p className="wx-note">{t('fortune.missingNote')}：{wx.missing.join('、')}</p>
      )}
    </section>
  );
}
