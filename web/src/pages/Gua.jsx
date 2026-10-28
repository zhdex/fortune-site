import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import PayModal from '../components/PayModal.jsx';
import { PRODUCTS, GUA_PRODUCTS } from '../../../shared/catalog.mjs';
import { takePending } from '../lib/consent.js';
import { saveDraft, loadDraft } from '../lib/draft.js';
import { useI18n } from '../i18n/index.js';

const CATEGORIES = ['career', 'wealth', 'love', 'health', 'study', 'other'];
const LEVEL_TONE = { great: 'great', good: 'good', neutral: 'neutral', caution: 'caution', bad: 'bad' };

/** 六爻图：lines[0] 为初爻（下），显示时自上而下；动爻标在右侧并高亮 */
function Hexagram({ lines, moving }) {
  return (
    <div className="hex">
      {[...lines].reverse().map((v, i) => {
        const no = 6 - i;
        const isMoving = moving === no;
        return (
          <div key={no} className={`hex-line ${v ? 'yang' : 'yin'} ${isMoving ? 'moving' : ''}`}>
            <span className="hex-stroke">
              <span className="bar" />
              {!v && <span className="bar" />}
            </span>
            <span className="hex-no">{no}</span>
            <span className={`hex-mark ${isMoving ? '' : 'is-empty'}`}>{isMoving ? '动' : ''}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Gua() {
  const { t } = useI18n();
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('career');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(null);
  const [error, setError] = useState('');

  // 从条款页同意返回后：恢复草稿、自动重开付款并重新起卦
  useEffect(() => {
    const draft = loadDraft('gua');
    if (draft) {
      setQuestion(draft.question || '');
      setCategory(draft.category || 'career');
    }
    const p = takePending();
    if (p?.product) {
      setPaying(p.product);
      if (draft?.question) cast(draft.question, draft.category);
    }
  }, []);

  const cast = async (q = question, cat = category) => {
    if (!q.trim()) { setError(t('gua.empty')); return; }
    setError('');
    setLoading(true);
    try {
      const r = await api.gua({ question: q.trim(), category: cat, hour: new Date().getHours() });
      setResult(r);
      saveDraft('gua', { question: q, category: cat });
    } catch (e) {
      setError(e.message || '起卦失败');
    } finally {
      setLoading(false);
    }
  };

  const afterPay = () => { setPaying(null); cast(); };

  return (
    <div className="gua-page container">
      <header className="page-head">
        <span
          className="page-head-sigil"
          aria-hidden="true"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/gen/gua-taiji.webp)` }}
        />
        <span className="kicker">ONE GUA A DAY</span>
        <h1 className="page-title">{t('gua.title')}</h1>
        <p className="page-sub">{t('gua.sub')}</p>
      </header>

      <div className="glass section-block gua-form">
        <label className="gua-label">{t('gua.question')}</label>
        <textarea
          className="gua-input"
          rows={3}
          maxLength={120}
          value={question}
          placeholder={t('gua.placeholder')}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <div className="gua-cats">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`cat-chip ${category === c ? 'is-active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {t(`gua.cat.${c}`)}
            </button>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button className="btn btn-gold btn-lg" disabled={loading} onClick={() => cast()}>
            {loading ? t('gua.casting') : `✦ ${t('gua.cast')}`}
          </button>
        </div>
        {error && <p className="gua-error">⚠ {error}</p>}
        <p className="disclaimer">{t('gua.note')}</p>
      </div>

      {result && (
        <div className="gua-result">
          <div className="glass section-block gua-main">
            <div className="gua-figure">
              <Hexagram lines={result.free.ben.lines} moving={result.free.moving} />
            </div>
            <div className="gua-info">
              <div className={`gua-level tone-${LEVEL_TONE[result.free.ben.level] || 'neutral'}`}>
                {result.free.headline}
              </div>
              <div className="gua-pairs">
                <span className="chip gold">{t('gua.ben')}：{result.free.ben.name}</span>
                <span className="chip">{t('gua.upper')} {result.free.ben.upper.symbol} {result.free.ben.upper.name}</span>
                <span className="chip">{t('gua.lower')} {result.free.ben.lower.symbol} {result.free.ben.lower.name}</span>
                <span className="chip">{t('gua.moving')}：{result.free.moving}</span>
              </div>
              <p className="prose gua-judgement">{result.free.judgement}</p>
            </div>
          </div>

          {result.entitled && result.deep && (
            <>
              <div className="glass section-block">
                <h3 className="section-title">{t('gua.deep')}</h3>
                <ul className="gua-lines">
                  {result.deep.lines.map((x) => <li key={x}>{x}</li>)}
                </ul>
              </div>
              <div className="gua-secondary">
                <div className="glass section-block gua-mini">
                  <div className="gua-mini-head">{t('gua.bian')} · {result.deep.bian.name}</div>
                  <Hexagram lines={result.deep.bian.lines} moving={0} />
                  <p className="gua-mini-text">{result.deep.bian.judgement}</p>
                </div>
                <div className="glass section-block gua-mini">
                  <div className="gua-mini-head">{t('gua.hu')} · {result.deep.hu.name}</div>
                  <Hexagram lines={result.deep.hu.lines} moving={0} />
                  <p className="gua-mini-text">{result.deep.hu.judgement}</p>
                </div>
              </div>
            </>
          )}

          {!result.entitled && (
            <div className="glass-strong bundle-card gua-plans">
              <div className="bundle-info">
                <h4>{t('gua.locked')}</h4>
                <p>{t('gua.lockedSub')}</p>
              </div>
              <div className="gua-plan-row">
                {GUA_PRODUCTS.map((key) => {
                  const prod = PRODUCTS[key];
                  return (
                    <button
                      key={key}
                      className={`gua-plan ${prod.highlight ? 'is-highlight' : ''}`}
                      onClick={() => setPaying(key)}
                    >
                      <span className="gua-plan-name">{t(`gua.plan.${key.split(':')[1]}`)}</span>
                      <span className="gua-plan-price">${Number(prod.price).toFixed(2)}</span>
                      <span className="gua-plan-note">{t(`gua.planNote.${key.split(':')[1]}`)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {paying && (
        <PayModal product={paying} onClose={() => setPaying(null)} onPaid={afterPay} />
      )}
    </div>
  );
}
