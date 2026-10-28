import React, { useEffect, useState } from 'react';
import StarField from './components/StarField.jsx';
import LangSwitcher from './components/LangSwitcher.jsx';
import Home from './pages/Home.jsx';
import Fortune from './pages/Fortune.jsx';
import Daily from './pages/Daily.jsx';
import Gua from './pages/Gua.jsx';
import About from './pages/About.jsx';
import { I18nProvider, useI18n } from './i18n/index.js';

const ROUTES = [
  { hash: '#/', key: 'nav.home', comp: Home },
  { hash: '#/fortune', key: 'nav.reading', comp: Fortune },
  { hash: '#/daily', key: 'nav.daily', comp: Daily },
  { hash: '#/gua', key: 'nav.gua', comp: Gua },
  { hash: '#/about', key: 'nav.about', comp: About },
];

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash || '#/');
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash || '#/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

function Hexagram({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <polygon points="24,5 40,33 8,33" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <polygon points="24,43 8,15 40,15" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="24" cy="24" r="3.4" fill="currentColor" opacity="0.85" />
      <circle cx="24" cy="24" r="15" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}

function Nav({ hash }) {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav-inner container-wide">
        <div className="logo" onClick={() => (window.location.hash = '#/')} role="button" tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') window.location.hash = '#/'; }}>
          <span className="logo-mark"><Hexagram /></span>
          <span className="logo-text">
            <strong>{t('nav.brand')}</strong>
            <small>XINGLAN CULTURE</small>
          </span>
        </div>

        <div className="nav-links">
          {ROUTES.map((r) => (
            <button
              key={r.hash}
              className={`nav-link ${hash === r.hash ? 'active' : ''}`}
              onClick={() => (window.location.hash = r.hash)}
            >
              {t(r.key)}
            </button>
          ))}
        </div>

        <div className="nav-right">
          <LangSwitcher />
          <button className="btn btn-outline btn-nav" onClick={() => (window.location.hash = '#/fortune')}>
            {t('nav.cta')}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 8h11M9 4l4 4-4 4" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-tagline">
          <span className="hairline" />
          <span className="tagline-text">{t('footer.tagline')}</span>
          <span className="hairline" />
        </div>
        <div className="footer-brand">
          <span className="footer-mark"><Hexagram size={22} /></span>
          {t('footer.desc')}
        </div>
        <p className="footer-disclaimer">{t('footer.disclaimer')}</p>
        <div className="footer-meta">
          <span>© 2026 星阑文化 / Xinglan Culture</span>
          <span className="dot-sep">·</span>
          <button className="link-quiet" onClick={() => (window.location.hash = '#/about')}>{t('nav.about')}</button>
          <span className="dot-sep">·</span>
          <button className="link-quiet" onClick={() => (window.location.hash = '#/daily')}>{t('nav.daily')}</button>
        </div>
      </div>
    </footer>
  );
}

function Shell() {
  const hash = useHashRoute();
  const current = ROUTES.find((r) => r.hash === hash) || ROUTES[0];
  const Page = current.comp;

  return (
    <>
      <StarField />
      <div className="app">
        <Nav hash={hash} />
        <main className="main">
          <div key={current.hash} className="page-enter">
            <Page />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <Shell />
    </I18nProvider>
  );
}
