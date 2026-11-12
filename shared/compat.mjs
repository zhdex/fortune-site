/**
 * 星阑文化 · 双人合盘引擎（前后端共用）
 * 输入两张已排好的命盘（computeBazi 的结果），输出：
 *   五行互补度 / 日主关系 / 生肖合冲 / 默契分 / 潜在冲突 / 相处建议 / 每条结论的依据
 *
 * 设计原则：**每个结论都带 evidence（依据）**，这是与"随口问问 AI"最大的区别。
 */

const SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const KE = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
const SHENG_OF = Object.fromEntries(Object.entries(SHENG).map(([a, b]) => [b, a]));

const LIUHE = { 子: '丑', 丑: '子', 寅: '亥', 亥: '寅', 卯: '戌', 戌: '卯', 辰: '酉', 酉: '辰', 巳: '申', 申: '巳', 午: '未', 未: '午' };
const CHONG = { 子: '午', 午: '子', 丑: '未', 未: '丑', 寅: '申', 申: '寅', 卯: '酉', 酉: '卯', 辰: '戌', 戌: '辰', 巳: '亥', 亥: '巳' };
const HAI = { 子: '未', 未: '子', 丑: '午', 午: '丑', 寅: '巳', 巳: '寅', 卯: '辰', 辰: '卯', 申: '亥', 亥: '申', 酉: '戌', 戌: '酉' };
const SANHE = [['申', '子', '辰'], ['巳', '酉', '丑'], ['寅', '午', '戌'], ['亥', '卯', '未']];

const ELEMENT_JOBS = {
  木: '教育、出版、文创、医药、纺织、农林',
  火: '传媒、互联网、能源、餐饮、演艺、营销',
  土: '地产、建筑、仓储、咨询、管理、农业',
  金: '金融、法律、机械、汽车、五金、审计',
  水: '物流、贸易、旅游、数据、传播、水产',
};

const REL_TEXT = {
  support: { label: '相生', score: 16, text: '一方不断给对方供能，关系里"被照顾"的那位会更松弛' },
  peer: { label: '同气', score: 10, text: '同频共振，聊得来、节奏像，但都缺一个"踩刹车"的人' },
  wealth: { label: '相制得用', score: 6, text: '一方推着另一方往前走，是"成长型"组合，但要注意别变成管束' },
  drain: { label: '相泄', score: 2, text: '相处久了容易互相消耗，需要各自留出独处时间' },
  pressure: { label: '相克', score: -8, text: '矛盾点多，但又容易彼此吸引，属于"要用心经营"的类型' },
};

/** 单张命盘最弱的两个五行 */
function weakOf(chart) {
  const els = [...(chart.elements || [])].sort((a, b) => a.count - b.count);
  return els.slice(0, 2).map((e) => e.element);
}

/** 单张命盘最旺的五行 */
function strongOf(chart) {
  const els = [...(chart.elements || [])].sort((a, b) => b.count - a.count);
  return els[0]?.element || chart.dayMaster?.wuxing || '土';
}

/**
 * @param {object} a 甲方命盘 computeBazi(...)
 * @param {object} b 乙方命盘
 */
export function computeCompat(a, b) {
  const elA = a.dayMaster?.wuxing || '土';
  const elB = b.dayMaster?.wuxing || '土';
  const zhiA = String(a.pillars?.[0]?.zhi || '子');
  const zhiB = String(b.pillars?.[0]?.zhi || '子');
  const evidence = [];

  /* ---- 1. 日主关系 ---- */
  let rel = 'peer';
  if (elA === elB) rel = 'peer';
  else if (SHENG[elA] === elB) rel = 'drain'; // A 生 B
  else if (SHENG[elB] === elA) rel = 'support'; // B 生 A
  else if (KE[elA] === elB) rel = 'wealth'; // A 克 B
  else if (KE[elB] === elA) rel = 'pressure'; // B 克 A
  const relInfo = REL_TEXT[rel];
  evidence.push(`日主：${a.dayMaster?.gan || ''}${elA} × ${b.dayMaster?.gan || ''}${elB} → ${relInfo.label}`);

  /* ---- 2. 五行互补：彼此缺的，是否正好是对方旺的 ---- */
  const weakA = weakOf(a);
  const weakB = weakOf(b);
  const strongA = strongOf(a);
  const strongB = strongOf(b);
  let complement = 0;
  if (weakA.includes(strongB)) complement += 12;
  if (weakB.includes(strongA)) complement += 12;
  if (weakA.includes(strongB) && weakB.includes(strongA)) {
    evidence.push(`互补：你缺${weakA.join('、')}，他旺${strongB}；他缺${weakB.join('、')}，你旺${strongA} —— 双向补位`);
  } else if (complement > 0) {
    evidence.push(`互补：${weakA.includes(strongB) ? `你缺的${strongB}正是他旺` : `他缺的${strongA}正是你旺`} —— 单向补位`);
  } else {
    evidence.push(`互补：双方所缺相近（你缺${weakA.join('、')}，他缺${weakB.join('、')}），同频但都缺同一块拼图`);
  }

  /* ---- 3. 生肖合冲 ---- */
  let zodiacScore = 0;
  let zodiacRel = 'neutral';
  let zodiacText = '生肖无直接合冲，属中性';
  if (LIUHE[zhiA] === zhiB) { zodiacScore = 10; zodiacRel = 'harmony'; zodiacText = '生肖六合，天然亲近'; }
  else if (SANHE.some((g) => g.includes(zhiA) && g.includes(zhiB))) { zodiacScore = 7; zodiacRel = 'trine'; zodiacText = '生肖三合，相处省力'; }
  else if (CHONG[zhiA] === zhiB) { zodiacScore = -10; zodiacRel = 'clash'; zodiacText = '生肖相冲，观点常相反'; }
  else if (HAI[zhiA] === zhiB) { zodiacScore = -5; zodiacRel = 'harm'; zodiacText = '生肖相害，容易话赶话'; }
  evidence.push(`生肖：${a.zodiac || zhiA}（${zhiA}）× ${b.zodiac || zhiB}（${zhiB}）→ ${zodiacText}`);

  /* ---- 4. 强弱结构 ---- */
  const sA = a.wuxing?.strength || 'balanced';
  const sB = b.wuxing?.strength || 'balanced';
  let structure = 0;
  let structureText = '';
  if (sA === sB) {
    structure = sA === 'balanced' ? 6 : -4;
    structureText = sA === 'balanced' ? '两人都属中和，节奏一致，日子稳' : '两人都偏极端，撞起来会很硬，需要第三方缓冲';
  } else {
    structure = 8;
    structureText = '一强一弱，强弱互补：一个冲、一个稳，配合得当反而稳';
  }
  evidence.push(`结构：${sA === 'strong' ? '偏旺' : sA === 'weak' ? '偏弱' : '中和'} × ${sB === 'strong' ? '偏旺' : sB === 'weak' ? '偏弱' : '中和'} → ${structureText}`);

  /* ---- 5. 汇总 ---- */
  const raw = 55 + relInfo.score + complement + zodiacScore + structure;
  const score = Math.max(20, Math.min(96, Math.round(raw)));

  const conflicts = [];
  if (rel === 'pressure') conflicts.push('日主相克：容易"我说东他偏说西"，争执时先复述对方观点再回应。');
  if (zodiacRel === 'clash') conflicts.push('生肖相冲：节奏与价值观差异大，重大决定别在同一天敲定。');
  if (sA === 'strong' && sB === 'strong') conflicts.push('双方都偏旺：都想主导，建议提前约定"谁的事谁拍板"。');
  if (complement === 0) conflicts.push('互补不足：两人缺同一块能力，财务或家务这类事务最好外包或制度化。');
  if (!conflicts.length) conflicts.push('结构性冲突不明显，主要靠日常沟通维护，别把小情绪攒成大账。');

  const advice = [
    `金钱与家务：${complement > 0 ? '分工按各自所长，钱账公开' : '尽量 AA 或制度化，避免"凭感觉"分摊'}。`,
    `争执处理：${rel === 'pressure' ? '设"冷静 30 分钟"规则，再回来只谈事不谈人' : '允许对方慢半拍，别用沉默惩罚'}。`,
    `长期节奏：${sA === sB ? '两人节奏相近，建议每年定一个共同目标，防止一起原地打转' : '强的一方负责推进，弱的一方负责把关细节'}。`,
  ];

  return {
    score,
    pair: {
      a: { name: a.birth?.solar || '', zodiac: a.zodiac, element: elA, gan: a.dayMaster?.gan, strength: sA, strong: strongA, weak: weakA },
      b: { name: b.birth?.solar || '', zodiac: b.zodiac, element: elB, gan: b.dayMaster?.gan, strength: sB, strong: strongB, weak: weakB },
    },
    relation: { key: rel, ...relInfo },
    zodiac: { key: zodiacRel, text: zodiacText, score: zodiacScore },
    complement: { score: complement, weakA, weakB, strongA, strongB },
    structure: { score: structure, text: structureText },
    headline: score >= 80
      ? '结构互补，是"越过越顺"的组合'
      : score >= 65
        ? '整体顺手，个别地方需要磨合'
        : score >= 50
          ? '有吸引力，也有明确的相处功课'
          : '差异较大，能不能走下去看沟通方式',
    conflicts,
    advice,
    evidence,
    jobs: { a: ELEMENT_JOBS[strongA], b: ELEMENT_JOBS[strongB] },
  };
}
