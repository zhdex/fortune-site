/**
 * 星阑文化 · 浏览器本地引擎（静态托管模式）
 * GitHub Pages 等纯静态环境没有后端，排盘、解读、每日测验、起卦全部在浏览器内完成：
 * 复用仓库根目录 shared/ 下的同一份引擎，结果与服务器一致；权限用本地凭证仓判定。
 */
import { computeBazi, computeZiwei, computeDaily } from '../../../shared/charts.mjs';
import { mockInterpret, mockDailyText } from '../../../shared/interpret.mjs';
import { computeDailyQuiz, computeWeek } from '../../../shared/dailyQuiz.mjs';
import { castGua, guaHeadline, GUA_CATEGORIES } from '../../../shared/divination.mjs';
import { computeCompat } from '../../../shared/compat.mjs';
import { computeCareer } from '../../../shared/career.mjs';
import { PRODUCTS, scopeCovers, DAILY_PRODUCTS, MATCH_PRODUCTS, CAREER_PRODUCTS } from '../../../shared/catalog.mjs';

export const localBazi = (input) => computeBazi(input);
export const localZiwei = (input) => computeZiwei(input);

export const localDaily = (date) => {
  const daily = computeDaily(date);
  return { daily, text: mockDailyText(date, daily) };
};

export const localInterpret = (type, chart) => mockInterpret(type, chart);

/* --------------------- 双人合盘 --------------------- */

export function localMatch({ a, b, entitlements = [] }) {
  const chartA = computeBazi(a);
  const chartB = computeBazi(b);
  const compat = computeCompat(chartA, chartB);
  const entitled = scopeCovers(entitlements, 'match:duo');
  const deep = scopeCovers(entitlements, 'match:deep');
  const prices = MATCH_PRODUCTS.map((k) => ({ key: k, ...PRODUCTS[k] }));
  if (!entitled) {
    return {
      entitled: false,
      free: {
        score: compat.score,
        headline: compat.headline,
        pair: compat.pair,
        relation: compat.relation,
        zodiac: compat.zodiac,
        evidence: compat.evidence.slice(0, 2),
        locked: {
          evidence: Math.max(0, compat.evidence.length - 2),
          conflicts: compat.conflicts.length,
          advice: compat.advice.length,
        },
      },
      prices,
    };
  }
  return {
    entitled: true,
    deep,
    data: deep ? compat : { ...compat, advice: compat.advice.slice(0, 1) },
    prices,
  };
}

/* --------------------- 学业事业 --------------------- */

export function localCareer({ input, entitlements = [] }) {
  const chart = computeBazi(input);
  const career = computeCareer(chart);
  const entitled = scopeCovers(entitlements, 'career:path');
  const full = scopeCovers(entitlements, 'career:full');
  const prices = CAREER_PRODUCTS.map((k) => ({ key: k, ...PRODUCTS[k] }));
  if (!entitled) {
    return {
      entitled: false,
      free: {
        headline: career.headline,
        strongest: career.strongest,
        learningStyle: career.learning.style,
        strengths: career.strengths.slice(0, 1),
        counts: career.counts,
        evidence: career.evidence.slice(0, 1),
        locked: {
          strengths: 2,
          jobs: career.jobs.length,
          stages: career.stages.length,
          advice: career.advice.length,
        },
      },
      prices,
    };
  }
  return {
    entitled: true,
    full,
    data: full ? career : { ...career, stages: career.stages.slice(0, 1), advice: career.advice.slice(0, 1) },
    prices,
  };
}

/* --------------------- 每日运势小测验 --------------------- */

export function localQuiz({ birth, date, entitlements = [] }) {
  const quiz = computeDailyQuiz(birth, date);
  const entitled = scopeCovers(entitlements, 'daily');
  if (!entitled) {
    return {
      entitled: false,
      free: {
        user: quiz.user,
        today: quiz.today,
        date: quiz.date,
        score: quiz.score,
        headline: quiz.headline,
        oneTip: quiz.oneTip,
        luckyColor: quiz.luckyColor,
        avoidColor: quiz.avoidColor,
        sample: quiz.items.slice(0, 2),
        lockedCount: quiz.items.length - 2,
      },
      prices: DAILY_PRODUCTS.map((k) => ({ key: k, ...PRODUCTS[k] })),
    };
  }
  return { entitled: true, quiz, week: computeWeek(birth, date) };
}

/* --------------------- 一日一卦 --------------------- */

export function localGua({ question, category, date, hour, entitlements = [] }) {
  const gua = castGua({ dateStr: date, hour: Number(hour), question, category });
  const entitled = scopeCovers(entitlements, 'gua');
  const cat = GUA_CATEGORIES[gua.category];
  const base = {
    date: gua.date,
    lunar: gua.lunar,
    hourRange: gua.hourRange,
    question: gua.question,
    category: gua.category,
    categoryLabel: cat.label,
    moving: gua.moving,
    headline: guaHeadline(gua),
    ben: gua.ben,
    numbers: gua.numbers,
  };
  if (!entitled) {
    return {
      entitled: false,
      free: { ...base, judgement: gua.ben.judgement },
      price: PRODUCTS['gua:single'].price,
    };
  }
  const timing = gua.moving <= 2
    ? '动爻在下三爻：事情在近期（一周内）会有明确信号，宜早作准备。'
    : gua.moving <= 4
      ? '动爻在中段：约三到四周见分晓，中间会有一到两次反复，属正常。'
      : '动爻在上三爻：结果偏慢，约一到两个月才明朗，急不得。';
  return {
    entitled: true,
    free: { ...base, judgement: gua.ben.judgement },
    deep: {
      lines: [
        `本卦「${gua.ben.name}」（${gua.ben.upper.nature}上${gua.ben.lower.nature}下）：${gua.ben.judgement}`,
        `动爻在第 ${gua.moving} 爻 —— 那是事情的转折点；爻动则变，事态会往「${gua.bian.name}」走。`,
        `变卦「${gua.bian.name}」：${gua.bian.judgement}`,
        `互卦「${gua.hu.name}」（事情的内在脉络）：${gua.hu.judgement}`,
        `落到你问的「${cat.label}」：${cat.focus}。${gua.ben.advice}`,
        timing,
      ],
      advice: gua.ben.advice,
      bian: gua.bian,
      hu: gua.hu,
    },
  };
}

/* --------------------- 分段付费解读（模拟流式） --------------------- */

const TEASER_CHARS = 88;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SECTION_LABEL = { summary: '总运概览', love: '爱情看这', career: '事业看这' };

export function localStream({ type, input, entitlements = [], handlers }) {
  let stopped = false;
  (async () => {
    try {
      const chart = type === 'bazi' ? computeBazi(input) : computeZiwei(input);
      if (stopped) return;
      handlers.onChart?.({ input, chart });

      const result = mockInterpret(type, chart);
      if (stopped) return;
      handlers.onHeadline?.(result.headline);

      for (const key of ['summary', 'love', 'career']) {
        const text = result.free?.[key];
        if (!text || stopped) continue;
        await sleep(180);
        const scope = `ch:${key}`;
        if (scopeCovers(entitlements, scope)) {
          handlers.onSection?.({ section: key, label: SECTION_LABEL[key], text, unlocked: true });
        } else {
          const teaserLen = Math.max(40, Math.min(TEASER_CHARS, Math.floor(text.length * 0.55)));
          handlers.onSection?.({
            section: key,
            label: SECTION_LABEL[key],
            teaser: text.slice(0, teaserLen),
            total: text.length,
            unlocked: false,
            price: PRODUCTS[`chapter:${key}`]?.price ?? 3.99,
            scope,
          });
        }
      }

      const chapters = result.premium || [];
      if (scopeCovers(entitlements, 'ch:all')) {
        for (const c of chapters) {
          if (stopped) return;
          await sleep(120);
          handlers.onChapter?.(c);
        }
      } else if (!stopped) {
        handlers.onChapterLock?.({
          count: chapters.length,
          titles: chapters.map((c) => c.title),
          scope: 'ch:all',
          price: PRODUCTS['bundle:reading'].price,
        });
      }

      if (!stopped) handlers.onDone?.({ entitlements, mock: true, static: true });
    } catch (err) {
      if (!stopped) handlers.onError?.(err);
    }
  })();
  return () => { stopped = true; };
}
