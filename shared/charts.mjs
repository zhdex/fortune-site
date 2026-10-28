/**
 * 星阑文化 · 排盘引擎（前后端共用）
 * 八字：lunar-javascript（含节气定月柱、生肖、大运、纳音）
 * 紫微斗数：iztro（安星 + 十二宫）
 * 黄历：每日干支与宜忌
 *
 * 本文件为纯 JS，无任何 Node 专有 API，可同时被 server 与浏览器（Vite 打包）引用。
 */
import pkg from 'lunar-javascript';
import { astro } from 'iztro';

const { Solar, LunarUtil } = pkg;

const GAN_WUXING = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' };
const ZHI_WUXING = { 子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水' };
const WUXING_LIST = ['金', '木', '水', '火', '土'];

/** 五行展示顺序：木火土金水（与视觉排布一致） */
export const WUXING_ORDER = ['木', '火', '土', '金', '水'];

/** 相生：X 生 SHENG[X]；相克：X 克 KE[X] */
const SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const KE = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
const SHENG_OF = Object.fromEntries(Object.entries(SHENG).map(([a, b]) => [b, a])); // 生我者
const KE_OF = Object.fromEntries(Object.entries(KE).map(([a, b]) => [b, a])); // 克我者

/** 每个五行对应的英文名与关键词（供前端直接渲染，避免再查表） */
export const WUXING_META = {
  木: { key: 'wood', en: 'Wood', keyword: '成长 · 生机' },
  火: { key: 'fire', en: 'Fire', keyword: '热情 · 行动' },
  土: { key: 'earth', en: 'Earth', keyword: '稳定 · 滋养' },
  金: { key: 'metal', en: 'Metal', keyword: '清明 · 专注' },
  水: { key: 'water', en: 'Water', keyword: '流动 · 丰盈' },
};

/** 时辰索引：0=早子时 … 11=亥时（iztro 约定） */
export function timeIndexOf(hour) {
  return Math.floor((Number(hour) + 1) / 2) % 12;
}

const SHICHEN_NAME = ['子时 23:00-00:59', '丑时 01:00-02:59', '寅时 03:00-04:59', '卯时 05:00-06:59', '辰时 07:00-08:59', '巳时 09:00-10:59', '午时 11:00-12:59', '未时 13:00-14:59', '申时 15:00-16:59', '酉时 17:00-18:59', '戌时 19:00-20:59', '亥时 21:00-22:59'];

function nayin(gz) {
  try { return LunarUtil?.NAYIN?.[gz] || ''; } catch { return ''; }
}

/** 五行计数（按四柱八个字的主气） */
function wuxingCount(pillars) {
  const count = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
  for (const p of pillars) {
    if (GAN_WUXING[p.gan]) count[GAN_WUXING[p.gan]]++;
    if (ZHI_WUXING[p.zhi]) count[ZHI_WUXING[p.zhi]]++;
  }
  return count;
}

/** 八字排盘 */
export function computeBazi({ year, month, day, hour, minute, gender }) {
  const solar = Solar.fromYmdHms(year, month, day, hour, minute || 0, 0);
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();

  const pillars = [
    { label: '年柱', gan: String(ec.getYear()).slice(0, 1), zhi: String(ec.getYear()).slice(1, 2) },
    { label: '月柱', gan: String(ec.getMonth()).slice(0, 1), zhi: String(ec.getMonth()).slice(1, 2) },
    { label: '日柱', gan: String(ec.getDay()).slice(0, 1), zhi: String(ec.getDay()).slice(1, 2) },
    { label: '时柱', gan: String(ec.getTime()).slice(0, 1), zhi: String(ec.getTime()).slice(1, 2) },
  ].map((p) => ({ ...p, wuxing: `${GAN_WUXING[p.gan] || '?'}/${ZHI_WUXING[p.zhi] || '?'}`, nayin: nayin(p.gan + p.zhi) }));

  const count = wuxingCount(pillars);
  const strongest = WUXING_LIST.reduce((a, b) => (count[b] > count[a] ? b : a));
  const weakest = WUXING_LIST.reduce((a, b) => (count[b] < count[a] ? b : a));
  const missing = WUXING_LIST.filter((w) => count[w] === 0);

  /* ---- 日主强弱与喜用（通俗版）---- */
  const dmWx = GAN_WUXING[pillars[2].gan] || '土';
  const shengMe = SHENG_OF[dmWx]; // 生我者（印）
  const keMe = KE_OF[dmWx]; // 克我者（官杀）
  const iSheng = SHENG[dmWx]; // 我生者（食伤）
  const iKe = KE[dmWx]; // 我克者（财）
  const support = (count[dmWx] || 0) + (count[shengMe] || 0);
  const drain = (count[iSheng] || 0) + (count[iKe] || 0) + (count[keMe] || 0);
  const supportRatio = Number((support / 8).toFixed(3));
  const strength = supportRatio >= 0.5 ? 'strong' : supportRatio >= 0.375 ? 'balanced' : 'weak';
  const favor = strength === 'strong' ? [iSheng, iKe] : [dmWx, shengMe]; // 身强宜泄耗，身弱宜生扶
  const avoid = strength === 'strong' ? [keMe] : [keMe];
  const elementAdvice = strength === 'strong'
    ? `你的${dmWx}气偏旺（生扶 ${support}/8），能量不缺，缺的是出口：宜用${iSheng}的创造力与${iKe}的务实把劲儿使出去，忌再往${keMe}上硬顶。`
    : strength === 'balanced'
      ? `你的${dmWx}气中和（生扶 ${support}/8），属于"怎么走都行"的底子：顺境别飘，逆境别弃，节奏感是你的护身符。`
      : `你的${dmWx}气偏弱（生扶仅 ${support}/8），需要有人托一把：多借${shengMe}的资源、${dmWx}的同类伙伴，先蓄力再出手，别硬刚${keMe}。`;

  const elements = WUXING_ORDER.map((w) => ({
    ...WUXING_META[w],
    element: w,
    count: count[w] || 0,
    ratio: Number(((count[w] || 0) / 8).toFixed(3)),
    favored: favor.includes(w),
  }));

  // 大运
  let dayun = [];
  try {
    const yun = ec.getYun(gender === '女' ? 1 : 0);
    const list = typeof yun.getDaYun === 'function' ? yun.getDaYun() : [];
    dayun = list.slice(0, 9).map((d) => ({
      ganzhi: d.getGanZhi ? String(d.getGanZhi()) : '',
      startAge: d.getStartAge ? d.getStartAge() : null,
      endAge: d.getEndAge ? d.getEndAge() : null,
    })).filter((d) => d.ganzhi);
  } catch { /* 忽略大运计算异常 */ }

  return {
    birth: { solar: solar.toYmdHms().slice(0, 16), shichen: SHICHEN_NAME[timeIndexOf(hour)] },
    lunar: `${lunar.getYearInChinese()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    zodiac: lunar.getYearShengXiao(),
    pillars,
    dayMaster: { gan: pillars[2].gan, wuxing: dmWx },
    wuxing: {
      count,
      missing,
      weakest: `${weakest}偏弱`,
      strongest,
      total: 8,
      support,
      drain,
      supportRatio,
      strength,
      shengMe,
      keMe,
      iSheng,
      iKe,
      favor,
      avoid,
      advice: elementAdvice,
    },
    elements,
    dayun,
  };
}

/** 紫微排盘 */
export function computeZiwei({ year, month, day, hour, gender }) {
  const ti = timeIndexOf(hour);
  const astrolabe = astro.bySolar(
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    ti,
    gender === '女' ? '女' : '男',
    true,
    'zh-CN'
  );
  return {
    soul: astrolabe.soul,
    body: astrolabe.body,
    fiveElementsClass: astrolabe.fiveElementsClass,
    zodiac: astrolabe.zodiac,
    sign: astrolabe.sign,
    shichen: astrolabe.time + ' ' + astrolabe.timeRange,
    palaces: astrolabe.palaces.map((p) => ({
      name: p.name,
      branch: p.earthlyBranch,
      stem: p.heavenlyStem,
      isBody: !!p.isBodyPalace,
      majorStars: p.majorStars.map((s) => ({
        name: s.name,
        brightness: s.brightness || '',
        mutagen: s.mutagen || '',
      })),
      minorStars: p.minorStars.map((s) => s.name),
      decadal: p.decadal ? p.decadal.range : null,
    })),
  };
}

/** 每日干支黄历 */
export function computeDaily(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const solar = Solar.fromYmd(y, m, d);
  const lunar = solar.getLunar();
  return {
    date: dateStr,
    lunar: `${lunar.getYearInChinese()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    dayGanzhi: String(lunar.getYearInGanZhi()) + '年 ' + String(lunar.getMonthInGanZhi()) + '月 ' + String(lunar.getDayInGanZhi()) + '日',
    zodiac: lunar.getYearShengXiao(),
    yi: lunar.getDayYi().slice(0, 6),
    ji: lunar.getDayJi().slice(0, 6),
  };
}
