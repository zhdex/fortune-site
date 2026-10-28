import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DICTS, LANGS } from './dict.js';
import { EXTRA } from './extra.js';

const STORAGE_KEY = 'xinglan_lang';

/** 深合并：extra 里的键覆盖 base，其余保留 */
function merge(base = {}, patch = {}) {
  const out = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    out[k] = v && typeof v === 'object' && !Array.isArray(v) ? merge(base[k] || {}, v) : v;
  }
  return out;
}

const FULL = Object.fromEntries(Object.keys(DICTS).map((code) => [code, merge(DICTS[code], EXTRA[code] || {})]));

function detectLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && FULL[saved]) return saved;
  } catch { /* 忽略 */ }
  const nav = (navigator.language || 'zh-CN').toLowerCase();
  if (nav.startsWith('en')) return 'en';
  if (nav.includes('tw') || nav.includes('hk') || nav.includes('mo') || nav.includes('hant')) return 'zh-TW';
  return 'zh-CN';
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectLang);

  const setLang = useCallback((next) => {
    if (!FULL[next]) return;
    setLangState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* 忽略 */ }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  /** t('hero.title') → 当前语言文案；缺失回退简中，再回退 key 本身 */
  const t = useCallback((path) => {
    const read = (dict) => path.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), dict);
    const hit = read(FULL[lang]);
    if (hit !== undefined) return hit;
    const fallback = read(FULL['zh-CN']);
    return fallback !== undefined ? fallback : path;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t, langs: LANGS, dict: FULL[lang] }), [lang, setLang, t]);

  // 该文件为 .js（无 JSX 语法），故用 createElement 提供 Context
  return React.createElement(I18nContext.Provider, { value }, children);
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
