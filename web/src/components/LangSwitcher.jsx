import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/index.js';

/** 语言切换：地球图标 + 当前语言，点开为下拉菜单 */
export default function LangSwitcher() {
  const { lang, setLang, langs } = useI18n();
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const current = langs.find((l) => l.code === lang) || langs[0];

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="lang" ref={boxRef}>
      <button
        type="button"
        className={`lang-trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
        </svg>
        <span className="lang-short">{current.short}</span>
        <svg className="chev" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3">
          <path d="M2 4l3 3 3-3" />
        </svg>
      </button>

      {open && (
        <ul className="lang-menu" role="listbox">
          {langs.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                className={`lang-item ${l.code === lang ? 'is-active' : ''}`}
                onClick={() => { setLang(l.code); setOpen(false); }}
              >
                <span>{l.name}</span>
                <span className="lang-item-short">{l.short}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
