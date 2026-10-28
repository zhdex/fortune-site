/**
 * 星阑文化 · 一日一卦（前后端共用）
 * 起卦法：梅花易数·时间起卦（农历年支序 + 月 + 日 → 上卦；再加时支序 → 下卦与动爻）
 * 输出：本卦、变卦、互卦，以及白话卦辞与行动建议。
 *
 * 纯 JS，浏览器与 Node 通用。
 */
import pkg from 'lunar-javascript';

const { Solar } = pkg;

/** 八卦（先天数）：lines 自下而上，1=阳爻，0=阴爻 */
export const TRIGRAMS = [
  { name: '乾', symbol: '☰', lines: [1, 1, 1], num: 1, element: '金', nature: '天' },
  { name: '兑', symbol: '☱', lines: [1, 1, 0], num: 2, element: '金', nature: '泽' },
  { name: '离', symbol: '☲', lines: [1, 0, 1], num: 3, element: '火', nature: '火' },
  { name: '震', symbol: '☳', lines: [1, 0, 0], num: 4, element: '木', nature: '雷' },
  { name: '巽', symbol: '☴', lines: [0, 1, 1], num: 5, element: '木', nature: '风' },
  { name: '坎', symbol: '☵', lines: [0, 1, 0], num: 6, element: '水', nature: '水' },
  { name: '艮', symbol: '☶', lines: [0, 0, 1], num: 7, element: '土', nature: '山' },
  { name: '坤', symbol: '☷', lines: [0, 0, 0], num: 8, element: '土', nature: '地' },
];

/** 六十四卦：键为通行本卦名 */
export const GUA = {
  乾: { seq: 1, level: 'great', judgement: '天行健。势头在你这边，主动出击比按兵不动更有利。', advice: '大胆推进，但给自己留一条退路。' },
  坤: { seq: 2, level: 'good', judgement: '地势坤。宜守成、宜配合，把基础打厚比个人冲锋更有效。', advice: '跟着对的人走，把功劳分出去一半。' },
  屯: { seq: 3, level: 'caution', judgement: '万物初生，前路有阻。开头难是常态，别急着要结果。', advice: '先立骨架，再谈扩张。' },
  蒙: { seq: 4, level: 'caution', judgement: '蒙昧求教之象。信息不足时，凭感觉下判断最容易出错。', advice: '先问明白，再决定。' },
  需: { seq: 5, level: 'good', judgement: '云上于天，等待本身就是策略。时机未到，蓄力比发力值钱。', advice: '把准备做足，机会自会到。' },
  讼: { seq: 6, level: 'bad', judgement: '天水讼。争执之象，赢了口舌可能输了关系。', advice: '退一步，走调解不走对抗。' },
  师: { seq: 7, level: 'neutral', judgement: '地水师。用众之象，需要组织、纪律与清楚的号令。', advice: '定好规矩和分工再动手。' },
  比: { seq: 8, level: 'good', judgement: '水地比。亲附之象，结盟、合作、靠近贵人正当时。', advice: '主动示好，别等别人来找你。' },
  小畜: { seq: 9, level: 'neutral', judgement: '风天小畜。力量尚小，宜积不宜发。', advice: '攒资源、攒口碑、攒作品。' },
  履: { seq: 10, level: 'caution', judgement: '天泽履，如踩虎尾。慎行则安，冒险则危。', advice: '规矩照做，细节别省。' },
  泰: { seq: 11, level: 'great', judgement: '地天泰。上下相交，事顺人和，是难得的通泰之局。', advice: '趁势把手上的事一次做透。' },
  否: { seq: 12, level: 'bad', judgement: '天地否。闭塞不通，勉强推进只会更耗。', advice: '停一停，先修内功再谈外事。' },
  同人: { seq: 13, level: 'good', judgement: '天火同人。找到同频的人，事就成了一半。', advice: '公开你的想法，让同路的人看见。' },
  大有: { seq: 14, level: 'great', judgement: '火天大有。收获在望，宜分享不宜独占。', advice: '该给的给出，格局换资源。' },
  谦: { seq: 15, level: 'great', judgement: '地山谦。越低头，路越宽。', advice: '把功劳分出去，把责任接下来。' },
  豫: { seq: 16, level: 'good', judgement: '雷地豫。气氛对了，事半功倍。', advice: '顺势造势，别扫兴。' },
  随: { seq: 17, level: 'good', judgement: '泽雷随。跟随趋势，比逆流省力。', advice: '看清方向再跟，别跟错人。' },
  蛊: { seq: 18, level: 'caution', judgement: '山风蛊。旧问题到了该清理的时候。', advice: '先修漏洞，再谈新的。' },
  临: { seq: 19, level: 'good', judgement: '地泽临。机会将至，宜主动迎接。', advice: '提前准备，别等到了门口才动。' },
  观: { seq: 20, level: 'neutral', judgement: '风地观。以静制动，先看后动。', advice: '多看多问，少表态。' },
  噬嗑: { seq: 21, level: 'caution', judgement: '火雷噬嗑。有障碍需硬碰，但要依法度。', advice: '讲证据、走流程，别情绪化。' },
  贲: { seq: 22, level: 'neutral', judgement: '山火贲。形式重要，但别只做门面。', advice: '把表达打磨好，实质别落下。' },
  剥: { seq: 23, level: 'bad', judgement: '山地剥。势在退，宜守不宜进。', advice: '止损、收缩、保住核心。' },
  复: { seq: 24, level: 'good', judgement: '地雷复。转机初现，宜重启搁置的旧事。', advice: '从最小的一步重新开始。' },
  无妄: { seq: 25, level: 'neutral', judgement: '天雷无妄。不妄求，则不生灾。', advice: '按本分做事，别投机。' },
  大畜: { seq: 26, level: 'good', judgement: '山天大畜。厚积薄发，宜学宜藏。', advice: '把时间投在能力上。' },
  颐: { seq: 27, level: 'neutral', judgement: '山雷颐。颐养之象，管好输入与口舌。', advice: '节制饮食与言语。' },
  大过: { seq: 28, level: 'caution', judgement: '泽风大过。担子过重，需减负。', advice: '先减掉不必要的事。' },
  坎: { seq: 29, level: 'bad', judgement: '坎为水。重险之象，险中有险。', advice: '不冒进、不借贷、不轻信。' },
  离: { seq: 30, level: 'good', judgement: '离为火。靠清晰与光亮取胜。', advice: '把话说清楚，把事做明白。' },
  咸: { seq: 31, level: 'good', judgement: '泽山咸。感应之象，真心换真心。', advice: '真诚表达，别试探。' },
  恒: { seq: 32, level: 'good', judgement: '雷风恒。坚持比花样更值钱。', advice: '把一件事做够一千天。' },
  遁: { seq: 33, level: 'caution', judgement: '天山遁。此时退，是智慧不是认输。', advice: '留白、留力、留退路。' },
  大壮: { seq: 34, level: 'good', judgement: '雷天大壮。力量足，但忌用力过猛。', advice: '有力也要有节。' },
  晋: { seq: 35, level: 'great', judgement: '火地晋。日出地上，宜见贵人。', advice: '主动争取曝光与被看见。' },
  明夷: { seq: 36, level: 'bad', judgement: '地火明夷。光被遮住，宜藏锋。', advice: '低调处理，保护好自己。' },
  家人: { seq: 37, level: 'good', judgement: '风火家人。内部理顺，外部才顺。', advice: '先安内，再对外。' },
  睽: { seq: 38, level: 'caution', judgement: '火泽睽。意见不合，宜求同存异。', advice: '把分歧写下来，逐条谈。' },
  蹇: { seq: 39, level: 'bad', judgement: '水山蹇。路阻且长，宜绕不宜硬闯。', advice: '换条路径，找帮手。' },
  解: { seq: 40, level: 'good', judgement: '雷水解。僵局将开，宜快刀斩乱麻。', advice: '趁势把积压的事清掉。' },
  损: { seq: 41, level: 'neutral', judgement: '山泽损。先舍后得。', advice: '该砍的成本就砍。' },
  益: { seq: 42, level: 'great', judgement: '风雷益。投入会有回报，宜进取。', advice: '加大投入，但要算清账。' },
  夬: { seq: 43, level: 'caution', judgement: '泽天夬。该断则断，但别撕破脸。', advice: '果断收尾，留体面。' },
  姤: { seq: 44, level: 'caution', judgement: '天风姤。来者不一定是贵人。', advice: '看清再靠近，别被热情冲昏。' },
  萃: { seq: 45, level: 'good', judgement: '泽地萃。人气聚拢，宜办大事。', advice: '把人聚起来，事就成一半。' },
  升: { seq: 46, level: 'great', judgement: '地风升。稳步向上，宜求进。', advice: '一步一级，别跳级。' },
  困: { seq: 47, level: 'bad', judgement: '泽水困。资源紧，宜守。', advice: '熬过去，别硬撑面子。' },
  井: { seq: 48, level: 'neutral', judgement: '水风井。修好根本，众人受益。', advice: '把基础设施做好。' },
  革: { seq: 49, level: 'good', judgement: '泽火革。该变了，且时机已到。', advice: '要改就改彻底，别半途。' },
  鼎: { seq: 50, level: 'great', judgement: '火风鼎。换新局、立新事。', advice: '把新框架搭稳再宣布。' },
  震: { seq: 51, level: 'caution', judgement: '震为雷。突发消息，先稳住心神。', advice: '先听清，再回应。' },
  艮: { seq: 52, level: 'neutral', judgement: '艮为山。该停就停，静能生慧。', advice: '慢下来，别再加码。' },
  渐: { seq: 53, level: 'good', judgement: '风山渐。循序渐进，稳步向好。', advice: '按计划一步一脚印。' },
  归妹: { seq: 54, level: 'caution', judgement: '雷泽归妹。名分未定，宜慎。', advice: '先把条件谈清楚。' },
  丰: { seq: 55, level: 'great', judgement: '雷火丰。正当盛时，宜把握当下。', advice: '趁热打铁，别拖。' },
  旅: { seq: 56, level: 'caution', judgement: '火山旅。身在客位，宜谦不宜争。', advice: '少惹事，多观察。' },
  巽: { seq: 57, level: 'good', judgement: '巽为风。以柔克刚，渗透得利。', advice: '用沟通推进，不用强硬。' },
  兑: { seq: 58, level: 'good', judgement: '兑为泽。口舌生财，宜谈笑。', advice: '多聊、多表达，机会在对话里。' },
  涣: { seq: 59, level: 'neutral', judgement: '风水涣。人心易散，宜聚不宜散。', advice: '把目标重新讲清楚。' },
  节: { seq: 60, level: 'good', judgement: '水泽节。有度则安。', advice: '定预算、定边界。' },
  中孚: { seq: 61, level: 'great', judgement: '风泽中孚。诚则通神，宜坦荡。', advice: '说实话，办到承诺的事。' },
  小过: { seq: 62, level: 'caution', judgement: '雷山小过。可做小事，不可图大。', advice: '守住小目标就好。' },
  既济: { seq: 63, level: 'good', judgement: '水火既济。事已成就，防盛极而衰。', advice: '收尾、复盘、别再加戏。' },
  未济: { seq: 64, level: 'neutral', judgement: '火水未济。差最后一步，别松劲。', advice: '补上最后一块短板。' },
};

/** 8×8 卦名索引：行=上卦，列=下卦，顺序同 TRIGRAMS */
const TABLE = [
  ['乾', '履', '同人', '无妄', '姤', '讼', '遁', '否'],
  ['夬', '兑', '革', '随', '大过', '困', '咸', '萃'],
  ['大有', '睽', '离', '噬嗑', '鼎', '未济', '旅', '晋'],
  ['大壮', '归妹', '丰', '震', '恒', '解', '小过', '豫'],
  ['小畜', '中孚', '家人', '益', '巽', '涣', '渐', '观'],
  ['需', '节', '既济', '屯', '井', '坎', '蹇', '比'],
  ['大畜', '损', '贲', '颐', '蛊', '蒙', '艮', '剥'],
  ['泰', '临', '明夷', '复', '升', '师', '谦', '坤'],
];

const trigramByNum = (n) => TRIGRAMS.find((t) => t.num === n) || TRIGRAMS[0];
const trigramByLines = (lines) => TRIGRAMS.find((t) => t.lines.join('') === lines.join('')) || TRIGRAMS[0];
const trigramIdx = (name) => TRIGRAMS.findIndex((t) => t.name === name);

function buildGua(upper, lower) {
  const data = GUA[TABLE[trigramIdx(upper.name)][trigramIdx(lower.name)]];
  return {
    name: TABLE[trigramIdx(upper.name)][trigramIdx(lower.name)],
    seq: data.seq,
    level: data.level,
    judgement: data.judgement,
    advice: data.advice,
    upper: { name: upper.name, nature: upper.nature, symbol: upper.symbol, element: upper.element },
    lower: { name: lower.name, nature: lower.nature, symbol: lower.symbol, element: lower.element },
    lines: [...lower.lines, ...upper.lines],
  };
}

const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** 类别 → 解读侧重（用于把卦辞落到具体事上） */
export const GUA_CATEGORIES = {
  career: { label: '事业', focus: '看的是推进节奏与贵人位置' },
  wealth: { label: '财运', focus: '看的是进财方式与守财能力' },
  love: { label: '感情', focus: '看的是彼此位置与进退分寸' },
  health: { label: '健康', focus: '看的是身心节律与作息' },
  study: { label: '学业', focus: '看的是专注度与考核时机' },
  other: { label: '其他', focus: '看的是整体势能' },
};

/**
 * 时间起卦（梅花易数）
 * @param {{dateStr?:string, hour?:number, question?:string, category?:string}} opts
 */
export function castGua({ dateStr, hour = 12, question = '', category = 'other' } = {}) {
  const ds = dateStr || new Date().toISOString().slice(0, 10);
  const [y, m, d] = ds.split('-').map(Number);
  const lunar = Solar.fromYmd(y, m, d).getLunar();

  const yearZhi = String(lunar.getYearInGanZhi()).slice(1, 2);
  const yearNum = ZHI.indexOf(yearZhi) + 1 || 1;
  const monthNum = Math.abs(lunar.getMonth());
  const dayNum = lunar.getDay();
  const hourNum = (Math.floor(((hour + 1) % 24) / 2) + 1) || 1;

  const upperNum = ((yearNum + monthNum + dayNum) % 8) || 8;
  const lowerNum = ((yearNum + monthNum + dayNum + hourNum) % 8) || 8;
  const moving = ((yearNum + monthNum + dayNum + hourNum) % 6) || 6;

  const upper = trigramByNum(upperNum);
  const lower = trigramByNum(lowerNum);
  const ben = buildGua(upper, lower);

  // 变卦：动爻阴阳互换
  const bianLines = [...ben.lines];
  bianLines[moving - 1] = bianLines[moving - 1] ? 0 : 1;
  const bian = buildGua(trigramByLines(bianLines.slice(3, 6)), trigramByLines(bianLines.slice(0, 3)));

  // 互卦：二三四爻为下，三四五爻为上
  const hu = buildGua(
    trigramByLines(ben.lines.slice(2, 5)),
    trigramByLines(ben.lines.slice(1, 4)),
  );

  return {
    date: ds,
    lunar: `${lunar.getYearInChinese()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    hourRange: `${String(hour).padStart(2, '0')}:00`,
    question: String(question).slice(0, 120),
    category: GUA_CATEGORIES[category] ? category : 'other',
    numbers: { upper: upperNum, lower: lowerNum, moving, yearNum, monthNum, dayNum, hourNum },
    moving,
    ben,
    bian,
    hu,
  };
}

/** 一句话断语（免费可见） */
export function guaHeadline(gua) {
  const levelWord = { great: '大吉', good: '吉', neutral: '平', caution: '宜慎', bad: '凶' }[gua.ben.level];
  return `${gua.ben.name}卦 · ${levelWord}`;
}
