import React, { useEffect, useState } from 'react';
import StarField from './components/StarField.jsx';
import Home from './pages/Home.jsx';
import Fortune from './pages/Fortune.jsx';
import Daily from './pages/Daily.jsx';
import About from './pages/About.jsx';

const ROUTES = [
  { hash: '#/', label: '首页', comp: Home },
  { hash: '#/fortune', label: '命盘解读', comp: Fortune },
  { hash: '#/daily', label: '每日运势', comp: Daily },
  { hash: '#/about', label: '关于星阑', comp: About },
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

export default function App() {
  const hash = useHashRoute();
  const current = ROUTES.find((r) => r.hash === hash) || ROUTES[0];
  const Page = current.comp;

  return (
    <>
      <StarField />
      <div className="app">
        <nav className="nav">
          <div className="nav-inner container">
            <div className="logo" onClick={() => (window.location.hash = '#/')}>
              <span className="star">✦</span> 星阑文化
            </div>
            <div className="nav-links">
              {ROUTES.map((r) => (
                <button
                  key={r.hash}
                  className={`nav-link ${hash === r.hash ? 'active' : ''}`}
                  onClick={() => (window.location.hash = r.hash)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </nav>
        <main className="main container">
          <div key={current.hash} className="page-enter">
            <Page />
          </div>
        </main>
        <footer className="footer">
          <div className="container">
            星阑文化 · 星盘与灯火，皆为懂你
            <br />
            本站内容为传统文化娱乐演绎，不构成医疗、法律、投资建议 · © 2026 星阑文化
          </div>
        </footer>
      </div>
    </>
  );
}
