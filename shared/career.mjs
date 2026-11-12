/**
 * 星阑文化 · 学业事业分析引擎（前后端共用）
 * 从一张命盘推出：核心优势 / 学习风格 / 职业倾向 / 阶段规划 / 行动建议，每条附依据。
 */

const ELEMENT_JOBS = {
  木: ['教育培训', '出版内容', '品牌文创', '医药健康', '农林食品'],
  火: ['互联网产品', '传媒广告', '新能源', '餐饮连锁', '演艺直播'],
  土: ['地产建筑', '供应链仓储', '管理咨询', '项目管理', '农业食品'],
  金: ['金融投资', '法律合规', '机械制造', '审计财务', '硬件工程'],
  水: ['物流贸易', '旅游酒店', '数据智能', '公关传播', '跨境业务'],
};

const ELEMENT_STRENGTH = {
  木: '生长与规划：擅长把混乱的信息整理成可执行的步骤',
  火: '表达与推动：擅长让事情被看见、让人愿意跟着走',
  土: '稳定与承载：擅长把长期的事做扎实，是团队的压舱石',
  金: '判断与标准：擅长挑错、定规矩、把关质量',
  水: '洞察与连接：擅长读懂人心、打通资源与信息',
};

const LEARNING = {
  strong: {
    style: '自学型 · 深挖型',
    text: '你学东西快，但讨厌被安排：给你目标和资料，你自己能啃下来；被强行塞进固定课表反而效率低。适合项目制、竞赛制、边做边学。',
  },
  balanced: {
    style: '节奏型 · 复盘型',
    text: '你的学习靠"稳定输出"取胜：每周固定时段 + 定期复盘，比突击更有效。适合课程 + 做题 + 总结的三段式，忌讳长时间中断。',
  },
  weak: {
    style: '结构型 · 带练型',
    text: '你需要外部结构托着走：小班、打卡、有人带着练，效果远好于独自啃书。把大目标切成一周一个的小关卡，你会比想象中能坚持。',
  },
};

const STAGE_THEME = [
  { theme: '打基础 · 建立专业身份', advice: '这段时间"做什么"不如"跟谁做"重要，优先选能学到东西的位置。' },
  { theme: '出手 · 拿到第一个代表作', advice: '把前几年攒的能力变成一个可展示的成果：作品、项目、论文、账号。' },
  { theme: '扩张 · 从做事到带人', advice: '开始把自己的方法复制给别人，收入结构从"卖时间"转向"卖系统"。' },
  { theme: '守成 · 稳住基本盘', advice: '不再追求速度，追求确定性：把现金流、健康、关系三条线守住。' },
];

function sortedElements(chart) {
  return [...(chart.elements || [])].sort((a, b) => b.count - a.count);
}

/**
 * @param {object} chart computeBazi 的结果
 */
export function computeCareer(chart) {
  const els = sortedElements(chart);
  const dm = chart.dayMaster?.wuxing || '土';
  const strength = chart.wuxing?.strength || 'balanced';
  const strongest = els[0]?.element || dm;
  const second = els[1]?.element || dm;
  const weakest = els[els.length - 1]?.element || dm;
  const evidence = [];

  evidence.push(`日主 ${chart.dayMaster?.gan || ''}${dm}，生扶 ${chart.wuxing?.support ?? 3}/8，判定为${strength === 'strong' ? '偏旺' : strength === 'weak' ? '偏弱' : '中和'}`);
  evidence.push(`五行配比：${els.map((e) => `${e.element}${e.count}`).join(' / ')}，以${strongest}为最旺、${weakest}为最弱`);

  const learning = LEARNING[strength];

  const strengths = [
    {
      title: `核心优势 · ${strongest}`,
      text: ELEMENT_STRENGTH[strongest],
      evidence: `依据：命局中${strongest}共 ${els[0]?.count ?? 0} 股，为五行之首`,
    },
    {
      title: `第二能力 · ${second}`,
      text: ELEMENT_STRENGTH[second],
      evidence: `依据：${second}共 ${els[1]?.count ?? 0} 股，可作为副线能力组合使用`,
    },
    {
      title: `需要补的短板 · ${weakest}`,
      text: `你在"${ELEMENT_STRENGTH[weakest].split('：')[0]}"这类能力上偏弱，不是做不到，而是不自然。用工具、流程或合作伙伴来补，比硬练更划算。`,
      evidence: `依据：${weakest}仅 ${els[els.length - 1]?.count ?? 0} 股，是全盘最弱的一环`,
    },
  ];

  const jobs = [...new Set([...(ELEMENT_JOBS[strongest] || []), ...(ELEMENT_JOBS[second] || [])])].slice(0, 6);

  const dayun = (chart.dayun || []).slice(0, 3);
  const stages = dayun.map((d, i) => ({
    range: `${d.startAge ?? '?'}–${d.endAge ?? '?'} 岁 · ${d.ganzhi}`,
    theme: STAGE_THEME[i]?.theme || '稳步推进',
    advice: STAGE_THEME[i]?.advice || '把当下的事做透，机会自然浮现。',
  }));

  const advice = [
    `用"${LEARNING[strength].style.split(' · ')[0]}"的方式学：${learning.text.slice(0, 34)}…`,
    `选行业优先看"${strongest}"：${(ELEMENT_JOBS[strongest] || []).slice(0, 3).join('、')}；这些方向你的启动成本最低。`,
    strength === 'weak'
      ? '别单打独斗：找一个执行力强的搭档，你负责判断、他负责推进。'
      : '别什么都自己扛：把重复劳动外包出去，你的时间应该花在判断与决策上。',
  ];

  return {
    headline: `${strongest}为纲 · ${learning.style}的事业路线`,
    dm,
    strength,
    strongest,
    second,
    weakest,
    counts: els.map((e) => ({ element: e.element, count: e.count })),
    learning,
    strengths,
    jobs,
    stages,
    advice,
    evidence,
  };
}
