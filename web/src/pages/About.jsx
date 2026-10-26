import React from 'react';

export default function About() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <section className="hero" style={{ padding: '28px 0 30px' }}>
        <h1 className="hero-title" style={{ fontSize: 'clamp(24px, 4vw, 34px)' }}>关于星阑</h1>
        <p className="hero-sub" style={{ fontSize: 15 }}>
          星阑：星光将尽未尽之时。旧智慧与新语言，在此交接。
        </p>
      </section>

      <div className="glass section-block">
        <h3 className="section-title">我们做的事</h3>
        <p className="prose" style={{ fontSize: 14.5 }}>
          周易、八字、紫微斗数，是流传千年的符号系统，深奥、晦涩，常让人望而却步。
          星阑文化做的事很简单：<strong style={{ color: 'var(--text-mid)' }}>把深奥翻译成通俗</strong>。
          排盘交给精确的历法引擎——节气、时辰、安星，全部按传统规则本地计算；
          解读交给 AI——把「七杀坐命」「五行缺火」这样的术语，讲成你能会心一笑的白话。
        </p>
      </div>

      <div className="glass section-block">
        <h3 className="section-title">三个承诺</h3>
        <p className="prose" style={{ fontSize: 14.5 }}>
          <strong style={{ color: 'var(--gold)' }}>一、准确优先。</strong>排盘数据全部由引擎计算，AI 只负责翻译，不负责编造。<br />
          <strong style={{ color: 'var(--gold)' }}>二、免费真诚。</strong>每日运势永远免费；命盘的总评、爱情与事业精华，不花一分钱就能看到。<br />
          <strong style={{ color: 'var(--gold)' }}>三、绝恐绝焦。</strong>我们不渲染焦虑、不贩卖恐惧。命是底色，运是画笔，握笔的人始终是你。
        </p>
      </div>

      <div className="glass section-block">
        <h3 className="section-title">完整报告里有什么</h3>
        <p className="prose" style={{ fontSize: 14.5 }}>
          解锁后你将看到：性格底色、爱情婚姻详批、事业财运详批、健康提醒、2026 丙午流年提示，以及可执行的开运建议——
          六个章节，一次解锁（￥9.9），长期回看。
        </p>
      </div>

      <p className="disclaimer">
        星阑文化 · 注册筹建中 ｜ 本站所有内容为传统文化的现代演绎，仅供娱乐与自我观照，不构成任何专业建议 ｜ © 2026 星阑
      </p>
    </div>
  );
}
