/**
 * 星阑文化 · 每日运势小测验（前后端共用）
 * 输入生日 → 生肖 + 星座 + 五行 → 今日能量分、幸运/忌用色、以及现代场景的宜忌
 * （签约、文书、考试、答辩、会谈、面试、约会、出行、购物…不再出现"动土修屋"这类旧黄历事项）
 *
 * 算法确定性、可解释：今日日干五行 × 你的日主五行（生克比和）+ 生肖与今日地支（合/冲）+ 稳定扰动。
 * 纯 JS，浏览器与 Node 通用。
 */
import pkg from 'lunar-javascript';
import { computeBazi } from './charts.mjs';

const { Solar } = pkg;

const GAN_WUXING = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' };
const SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const KE = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
const SHENG_OF = Object.fromEntries(Object.entries(SHENG).map(([a, b]) => [b, a]));

/** 六合 / 相冲 */
const LIUHE = { 子: '丑', 丑: '子', 寅: '亥', 亥: '寅', 卯: '戌', 戌: '卯', 辰: '酉', 酉: '辰', 巳: '申', 申: '巳', 午: '未', 未: '午' };
const CHONG = { 子: '午', 午: '子', 丑: '未', 未: '丑', 寅: '申', 申: '寅', 卯: '酉', 酉: '卯', 辰: '戌', 戌: '辰', 巳: '亥', 亥: '巳' };
const SANHE = [['申', '子', '辰'], ['巳', '酉', '丑'], ['寅', '午', '戌'], ['亥', '卯', '未']];

/** 五行 → 颜色（名称 + 色值，前端直接用于色块） */
const COLORS = {
  木: [
    { name: '竹青绿', hex: '#4aa87a' },
    { name: '苔藓绿', hex: '#6f8f4e' },
  ],
  火: [
    { name: '朱砂红', hex: '#cf4a4a' },
    { name: '暖橘', hex: '#e08a52' },
  ],
  土: [
    { name: '陶土黄', hex: '#c49a58' },
    { name: '米驼', hex: '#d9c39b' },
  ],
  金: [
    { name: '月白', hex: '#d8dde8' },
    { name: '香槟金', hex: '#d9bd82' },
  ],
  水: [
    { name: '藏青', hex: '#3a5c96' },
    { name: '墨黑', hex: '#2a2c3a' },
  ],
};

const SIGNS = [
  [1, 20, '摩羯座'], [2, 19, '水瓶座'], [3, 21, '双鱼座'], [4, 20, '白羊座'],
  [5, 21, '金牛座'], [6, 22, '双子座'], [7, 23, '巨蟹座'], [8, 23, '狮子座'],
  [9, 23, '处女座'], [10, 24, '天秤座'], [11, 23, '天蝎座'], [12, 22, '射手座'],
];

/** 星座（按公历月日） */
export function constellationOf(month, day) {
  const m = Number(month);
  const d = Number(day);
  const hit = SIGNS.find(([mm, dd]) => m === mm && d >= dd);
  if (hit) return hit[2];
  // 未到本月分界 → 上一个星座
  const prev = m === 1 ? SIGNS[11] : SIGNS[m - 2];
  return prev[2];
}

/**
 * 现代场景清单：need 为"可用分数阈值"，w 为对总分的影响力（用于个体化微调）
 * 旧黄历里的动土、修屋、安葬等一律不出现。
 */
export const QUIZ_ITEMS = [
  { key: 'contract', need: 60, w: 4 },
  { key: 'document', need: 54, w: 2 },
  { key: 'exam', need: 57, w: 3 },
  { key: 'defense', need: 60, w: 4 },
  { key: 'meeting', need: 52, w: 1 },
  { key: 'interview', need: 56, w: 3 },
  { key: 'date', need: 54, w: 2 },
  { key: 'travel', need: 49, w: 1 },
  { key: 'shopping', need: 46, w: 1 },
];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * @param {{year:number,month:number,day:number}} birth 公历生日
 * @param {string} dateStr 目标日期 YYYY-MM-DD（默认今天）
 */
export function computeDailyQuiz(birth, dateStr) {
  const { year, month, day } = birth;
  const [ty, tm, td] = String(dateStr).split('-').map(Number);

  const chart = computeBazi({ year, month, day, hour: 12, minute: 0, gender: '男' });
  const userEl = chart.dayMaster.wuxing || '土';
  const userZhi = String(chart.pillars[0].zhi); // 年支 = 生肖地支
  const zodiac = chart.zodiac;
  const constellation = constellationOf(month, day);

  const solar = Solar.fromYmd(ty, tm, td);
  const lunar = solar.getLunar();
  const todayGz = String(lunar.getDayInGanZhi());
  const todayGan = todayGz.slice(0, 1);
  const todayZhi = todayGz.slice(1, 2);
  const todayEl = GAN_WUXING[todayGan] || '土';

  /* 五行关系 */
  let relation = 'peer';
  let relScore = 8;
  if (todayEl === userEl) { relation = 'peer'; relScore = 8; }
  else if (SHENG[todayEl] === userEl) { relation = 'support'; relScore = 14; }
  else if (SHENG[userEl] === todayEl) { relation = 'drain'; relScore = -1; }
  else if (KE[todayEl] === userEl) { relation = 'pressure'; relScore = -12; }
  else if (KE[userEl] === todayEl) { relation = 'wealth'; relScore = 6; }

  /* 生肖与今日地支 */
  let zodiacScore = 2;
  let zodiacRel = 'neutral';
  if (LIUHE[userZhi] === todayZhi) { zodiacScore = 10; zodiacRel = 'harmony'; }
  else if (CHONG[userZhi] === todayZhi) { zodiacScore = -13; zodiacRel = 'clash'; }
  else if (SANHE.some((g) => g.includes(userZhi) && g.includes(todayZhi))) { zodiacScore = 7; zodiacRel = 'trine'; }

  const jitter = (hash(`${dateStr}|${year}-${month}-${day}`) % 9) - 4;
  const score = clamp(62 + relScore + zodiacScore + jitter, 25, 96);

  /* 幸运色 = 生我（印）之色；忌用色 = 克我（官杀）之色 */
  const luckyEl = SHENG_OF[userEl] || userEl;
  const avoidEl = Object.keys(KE).find((k) => KE[k] === userEl) || '木';
  const luckyColor = COLORS[luckyEl][hash(dateStr + luckyEl) % 2];
  const avoidColor = COLORS[avoidEl][hash(dateStr + avoidEl) % 2];

  /* 场景判定 */
  const items = QUIZ_ITEMS.map((it) => {
    const local = score + (hash(`${dateStr}|${it.key}|${year}${month}${day}`) % 11) - 5;
    const verdict = local >= it.need + 2 ? 'good' : local >= it.need - 8 ? 'ok' : 'avoid';
    return { key: it.key, verdict, value: clamp(local, 0, 100) };
  });

  const headline = score >= 80
    ? '今日能量很足，适合把重要的事往前推一步'
    : score >= 65
      ? '今日平稳向好，按计划走就有收获'
      : score >= 50
        ? '今日节奏偏慢，宜稳不宜快'
        : '今日阻力明显，重要决定不妨缓一天';

  const oneTip = `穿${luckyColor.name}出场，少用${avoidColor.name}；今天是${todayEl}日，你的${userEl}气与之${relation === 'support' ? '相生得力' : relation === 'pressure' ? '受克承压' : relation === 'wealth' ? '相克得财' : relation === 'drain' ? '外泄耗神' : '同气相求'}。`;

  return {
    date: dateStr,
    user: {
      zodiac,
      constellation,
      element: userEl,
      dayMaster: chart.dayMaster.gan,
      strength: chart.wuxing.strength,
      zodiacBranch: userZhi,
    },
    today: {
      ganZhi: `${todayGz}日`,
      element: todayEl,
      lunar: `${lunar.getYearInChinese()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    },
    relation,
    zodiacRel,
    score,
    luckyColor: { ...luckyColor, element: luckyEl },
    avoidColor: { ...avoidColor, element: avoidEl },
    headline,
    oneTip,
    items,
    tips: [
      `幸运色 ${luckyColor.name}：外套、领带、围巾或一支笔，任选其一即可，不必全身换装。`,
      `忌用色 ${avoidColor.name}：大面积使用容易加重${avoidColor.element}的压力感，今天的重点场合避开它。`,
      score >= 70
        ? `今天适合主动：把最难的那封邮件、最不敢开的口，放在上午 10-12 点之间处理。`
        : `今天适合收口：整理资料、复盘进度、把没回的消息回完，比开新局更有价值。`,
    ],
  };
}

/** 未来 7 天一览（订阅用户可见） */
export function computeWeek(birth, startDate) {
  const [y, m, d] = String(startDate).split('-').map(Number);
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(Date.UTC(y, m - 1, d + i));
    const ds = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
    const q = computeDailyQuiz(birth, ds);
    return { date: ds, score: q.score, lucky: q.luckyColor.name, verdict: q.items.filter((x) => x.verdict === 'good').length };
  });
}
