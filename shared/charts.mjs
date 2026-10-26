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
    dayMaster: { gan: pillars[2].gan, wuxing: GAN_WUXING[pillars[2].gan] || '?' },
    wuxing: { count, missing, weakest: `${weakest}偏弱`, strongest },
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
