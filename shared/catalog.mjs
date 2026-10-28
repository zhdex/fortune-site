/**
 * 星阑文化 · 商品目录（前后端共用）
 * 价格单位：美元（USD）。前端展示与后端签发令牌都以本文件为准，保证两种模式同价同规则。
 */

export const CURRENCY = 'USD';

export const PRODUCTS = {
  /* —— 命盘解读：三段单卖 + 整体 —— */
  'chapter:summary': {
    title: '总运概览 · 完整版',
    titleEn: 'Overview · Full',
    price: 3.99,
    scope: ['ch:summary'],
    group: 'reading',
  },
  'chapter:love': {
    title: '爱情看这 · 完整版',
    titleEn: 'Love · Full',
    price: 3.99,
    scope: ['ch:love'],
    group: 'reading',
  },
  'chapter:career': {
    title: '事业看这 · 完整版',
    titleEn: 'Career · Full',
    price: 3.99,
    scope: ['ch:career'],
    group: 'reading',
  },
  'bundle:reading': {
    title: '三点整体解锁',
    titleEn: 'All three sections',
    price: 9.99,
    scope: ['ch:all'],
    group: 'reading',
    highlight: true,
  },

  /* —— 每日运势小测验：订阅 —— */
  'daily:day': {
    title: '今日运势 · 单日',
    titleEn: 'Daily · 1 day',
    price: 0.99,
    scope: ['daily'],
    group: 'daily',
    ttl: 24 * 60 * 60 * 1000,
  },
  'daily:month': {
    title: '今日运势 · 月卡',
    titleEn: 'Daily · 1 month',
    price: 11.99,
    scope: ['daily'],
    group: 'daily',
    ttl: 31 * 24 * 60 * 60 * 1000,
  },
  'daily:half': {
    title: '今日运势 · 半年卡',
    titleEn: 'Daily · 6 months',
    price: 29.99,
    scope: ['daily'],
    group: 'daily',
    ttl: 183 * 24 * 60 * 60 * 1000,
  },
  'daily:year': {
    title: '全年通 · 全部解锁',
    titleEn: 'Annual Pass · Everything',
    price: 49.99,
    scope: ['daily', 'ch:all', 'gua'],
    group: 'daily',
    ttl: 365 * 24 * 60 * 60 * 1000,
    highlight: true,
  },

  /* —— 一日一卦 —— */
  'gua:single': {
    title: '一日一卦 · 单次深度解读',
    titleEn: 'One Gua · single reading',
    price: 1.99,
    scope: ['gua'],
    group: 'gua',
    ttl: 24 * 60 * 60 * 1000,
  },
  'gua:month': {
    title: '一日一卦 · 包月',
    titleEn: 'One Gua · monthly',
    price: 19.99,
    scope: ['gua'],
    group: 'gua',
    ttl: 31 * 24 * 60 * 60 * 1000,
  },
  'gua:year': {
    title: '一日一卦 · 包年',
    titleEn: 'One Gua · yearly',
    price: 39.99,
    scope: ['gua'],
    group: 'gua',
    ttl: 365 * 24 * 60 * 60 * 1000,
    highlight: true,
  },
};

export const READING_PRODUCTS = ['chapter:summary', 'chapter:love', 'chapter:career', 'bundle:reading'];
export const DAILY_PRODUCTS = ['daily:day', 'daily:month', 'daily:half', 'daily:year'];
export const GUA_PRODUCTS = ['gua:single', 'gua:month', 'gua:year'];

/** 单个章节 → 对应的 scope */
export const SECTION_SCOPE = { summary: 'ch:summary', love: 'ch:love', career: 'ch:career' };

/** 一次解锁能覆盖的章节（整体解锁覆盖全部） */
export function scopeCovers(entitlements, needed) {
  if (entitlements.includes('ch:all') && needed.startsWith('ch:')) return true;
  return entitlements.includes(needed);
}

/** 价格格式化 */
export function priceText(price) {
  return `$${Number(price).toFixed(2)}`;
}

/** 命盘三段的解锁价（单独买合计 vs 整体） */
export function readingPrices() {
  return {
    single: PRODUCTS['chapter:summary'].price,
    bundle: PRODUCTS['bundle:reading'].price,
    saving: Number((PRODUCTS['chapter:summary'].price * 3 - PRODUCTS['bundle:reading'].price).toFixed(2)),
  };
}
