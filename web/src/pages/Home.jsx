import React from 'react';

const FEATURES = [
  { icon: '🌙', title: '八字命盘', desc: '四柱排盘 · 五行格局 · 大运流年，一句话讲清你的天生底色' },
  { icon: '✨', title: '紫微斗数', desc: '十二宫安星 · 命宫主星 · 夫妻官禄，看懂你人生剧本的起承转合' },
  { icon: '🌅', title: '每日运势', desc: '黄历宜忌 + 通俗开运提示，每天清晨一条，温柔开启新一天' },
];

export default function Home() {
  return (
    <div>
      <section className="hero">
        <h1 className="hero-title">仰望星阑之处<br />遇见更懂自己的你</h1>
        <p className="hero-sub">
          八字 · 紫微斗数 · 每日运势 —— 深奥的古老智慧，被翻译成温柔的白话
        </p>
        <div className="hero-actions hero-actions-row" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => (window.location.hash = '#/fortune')}>
              ✦ 开始排盘
            </button>
            <button className="btn btn-ghost" onClick={() => (window.location.hash = '#/daily')}>
              今日运势
            </button>
          </div>
        </div>
      </section>

      <div className="divider" />

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
        {FEATURES.map((f) => (
          <div key={f.title} className="glass section-block" style={{ marginTop: 0, textAlign: 'center', transition: 'transform 450ms cubic-bezier(0.4,0,0.2,1)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{f.icon}</div>
            <h3 style={{ letterSpacing: 3, marginBottom: 10, color: 'var(--text-hi)' }}>{f.title}</h3>
            <p className="prose" style={{ fontSize: 14, color: 'var(--text-low)', lineHeight: 1.9 }}>{f.desc}</p>
          </div>
        ))}
      </section>

      <div className="glass section-block" style={{ textAlign: 'center' }}>
        <h3 className="section-title" style={{ justifyContent: 'center' }}>我们如何解读你的命盘</h3>
        <p className="prose" style={{ fontSize: 14.5 }}>
          排盘由传统历法引擎精准计算（节气、时辰、安星全部本地完成），
          再由 AI 把专业术语翻译成<strong style={{ color: 'var(--text-mid)' }}>人人能懂的温暖白话</strong>。
          免费呈现总评与爱情、事业精华；完整报告（性格底色 / 婚姻详批 / 财运 / 健康 / 流年 / 开运）
          一次解锁，长期可看。
        </p>
      </div>
    </div>
  );
}
