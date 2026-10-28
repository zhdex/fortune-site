/**
 * 星阑文化 · 演示解读文本（前后端共用）
 * 未配置 DEEPSEEK_API_KEY（或静态托管时）使用本模块：
 * 依据真实排盘数据，用确定性模板生成通俗解读，并模拟流式输出。
 * 纯 JS，无 Node 专有 API。
 */

export const PREMIUM_TITLES = {
  bazi: ['性格底色 · 你是谁', '爱情婚姻详批', '事业财运详批', '健康提醒', '2026 丙午流年提示', '开运建议'],
  ziwei: ['命宫主星 · 你的天赋', '性格底色', '爱情婚姻', '事业财富', '大运趋势', '开运建议'],
};

const WUXING_TRAIT = {
  金: { tag: '刚毅守正', trait: '骨子里有一股果断与原则，认准的事很难被劝回头', love: '对感情认真专一，只是不擅长把甜话说出口', career: '适合需要规则感与执行力的领域' },
  木: { tag: '向阳生长', trait: '像春天的树一样不断向上，永远有新的想法在发芽', love: '憧憬细水长流的感情，愿意为对方慢慢改变', career: '适合成长性行业，越有空间越出彩' },
  水: { tag: '细腻通达', trait: '心思细腻如水，善于感知别人察觉不到的暗流', love: '共情能力极强，容易被"懂你"的人打动', career: '适合沟通、创意与策划类工作' },
  火: { tag: '热烈明亮', trait: '天生自带热度，走到哪里都像点亮一盏灯', love: '爱得炽烈直接，讨厌暧昧与拉扯', career: '适合台前、带队与开拓性的角色' },
  土: { tag: '沉稳厚道', trait: '沉稳如大地，是朋友们眼中"最靠得住"的那个人', love: '要的是安稳踏实，细水长流胜过轰轰烈烈', career: '适合需要耐心与积累的领域，越久越值钱' },
};

/** 主星短标签（用于一句话总评，避免长句截断） */
const STAR_TAG = {
  紫微: '天生的主心骨', 天府: '稳中带暖的管家命', 太阳: '藏不住的热心肠', 太阴: '温柔细腻的观察者',
  武曲: '说做就做的行动派', 天同: '自带福气的乐天派', 廉贞: '有原则也有魅力', 天机: '脑筋转得飞快',
  天梁: '让人安心的老大哥', 天相: '处事公道的协调者', 巨门: '一开口就说到位', 贪狼: '魅力与好奇心并存',
  七杀: '敢闯敢拼的破局者', 破军: '不破不立的开创者',
};

const STAR_TRAIT = {
  紫微: '天生带一点"主心骨"，人群里不知不觉就成了拿主意的人',
  天府: '稳中带暖，善于把生活打理得井井有条',
  太阳: '热心肠藏不住，见不得身边人受委屈',
  太阴: '安静温柔，心思却比谁都细',
  武曲: '行动派，赚钱和做事都很有一套',
  天同: '天生的乐天派，福气常在不经意间降临',
  廉贞: '有原则也有魅力，认真起来格外动人',
  天机: '脑子转得快，主意一个接一个',
  天梁: '像老大哥老大姐，天生让人安心',
  天相: '处事公道，是天生的协调者',
  巨门: '口才与洞察并存，一开口就说到位',
  贪狼: '兴趣广泛魅力足，人生从不缺新鲜感',
  七杀: '敢闯敢拼，命运的剧本偏要自己写',
  破军: '不破不立，敢于推翻重来',
};

/** 八字演示解读 */
function mockBazi(chart) {
  const dm = chart.dayMaster?.wuxing || '土';
  const t = WUXING_TRAIT[dm] || WUXING_TRAIT.土;
  const missing = chart.wuxing?.missing || [];
  const strong = chart.wuxing?.strongest || dm;
  const zodiac = chart.zodiac || '';
  const firstDayun = chart.dayun?.find((d) => d.ganzhi) || { ganzhi: '甲子', startAge: 6, endAge: 15 };

  const strengthText = {
    strong: '底子厚、能量足，缺点是容易用力过猛——学会"留三分力"，是你进阶的关键',
    balanced: '生扶与消耗大致相当，属于"怎么走都行"的中和格局，节奏感比冲劲更重要',
    weak: '自身火候偏轻，需要借外力：团队、资源、贵人，先蓄力再出手更合算',
  }[chart.wuxing?.strength || 'balanced'];
  const support = chart.wuxing?.support ?? 3;

  const headline = `${zodiac}${dm}命 · ${t.tag}的一生底稿`;
  const summary = `你的日主是「${chart.dayMaster?.gan || '?'}」，属${dm}。${t.trait}。命局中${strong}偏旺，${missing.length ? `而${missing.join('、')}偏缺，恰恰是你一生要补的功课` : '五行俱全，格局流转比较顺畅'}；日主共得 ${support}/8 分生扶，${strengthText}。落到现实里，${t.career}——这是你的长坡厚雪：起步不显眼，越往后越有分量，中年之后运势会明显走高。`;
  const love = `感情上，${t.love}。你容易被"能补你短板"的人吸引：对方不必最耀眼，但要能接住你的沉默。你慢热，一旦认定又格外固执——这是优点也是隐患，多一分主动表达，就少十分误会。婚姻里记住：${zodiac}的执念别用错地方，把"我对你好"翻译成"你想要的是什么"，关系会顺很多。`;
  const career = `事业上，${t.career}。早年常觉得有力没处使，其实是在攒底盘——你的财路走"手艺＋口碑"的滚雪球路线：前期慢，复利惊人。大运从 ${firstDayun.startAge} 岁起走「${firstDayun.ganzhi}」，节奏是先立身、后立业，别急着证明自己。合作运不错，只是签合同、谈分成要把丑话说在前头：你心软，规则得先替你把关。`;

  const premium = [
    { title: PREMIUM_TITLES.bazi[0], content: `${dm}日主的你，${t.trait}。命局以${strong}为旺，做事讲气场也讲节奏：认定的事九头牛拉不回，没兴趣的事一分钟都嫌多。这份"偏科"不是缺点，是你把力气都花在刀刃上的证明。真正的修行在"切换"二字——该硬的时候硬得住，该软的时候软得下来，你的人生会顺一大截。四个字送你：蓄势、择时。` },
    { title: PREMIUM_TITLES.bazi[1], content: `感情中你${t.love}。婚姻宫的状态提示你：伴侣更像一面"镜子"，你给出去的温度，最终都会回到自己身上。恋爱阶段慢一点没关系，看清了再靠近；真正要防的不是遇不到，而是把"将就"当成了"稳定"。婚后记得保留一点两人世界——柴米油盐之外，浪漫是你的氧气；每月一次只属于两个人的安排，比任何礼物都管用。` },
    { title: PREMIUM_TITLES.bazi[2], content: `${t.career}。命局显示你的财路不靠一夜暴富，而靠"手艺＋口碑"滚雪球：前期积累慢，但复利惊人，三十五岁后才是你的主升段。合作运不错，但签合同、谈分成要把丑话说在前面——你心软，规则得先替你把关。若要跳槽或转行，优先选"能积累作品与信誉"的方向，而不是当期多两千块的位置。` },
    { title: PREMIUM_TITLES.bazi[3], content: `${dm}过旺的人容易"用力过猛"：${dm === '火' ? '心脑血管与睡眠是你要重点照顾的' : dm === '水' ? '腰肾与作息规律要多留心' : dm === '木' ? '肝胆与情绪疏解是重点，别憋着' : dm === '金' ? '呼吸道与筋骨旧伤要注意' : '脾胃是你身体的晴雨表，饮食规律胜过一切补品'}。规律运动是你最便宜的"补运"方式，每周三次、每次三十分钟，坚持三个月自见分晓。` },
    { title: PREMIUM_TITLES.bazi[4], content: `2026 丙午年，火气升腾。对你而言是"被看见"的一年：争取过的机会容易兑现，展示过的才华容易被贵人接住。上半年宜蓄势（学习、考证、打磨作品），下半年宜出手（跳槽、签约、公开亮相都合适）。惟须防口舌是非，遇争执退半步，海阔天空。` },
    { title: PREMIUM_TITLES.bazi[5], content: `① 颜色开运：多用${dm === '金' ? '白、金' : dm === '木' ? '青、绿' : dm === '水' ? '蓝、黑' : dm === '火' ? '红、紫' : '黄、米'}色系的小物；② 方位开运：重要的事往你直觉安心的方向去，别逆着心情硬撑；③ 心法开运：每晚睡前写一句"今日做得最好的一件事"，三十天后你会看见一个更笃定的自己。命是底色，运是画笔，握笔的人始终是你。` },
  ];
  return { headline, free: { summary, love, career }, premium };
}

/** 紫微演示解读 */
function mockZiwei(chart) {
  const lifePalace = chart.palaces?.find((p) => p.name === '命宫');
  const stars = lifePalace?.majorStars?.map((s) => s.name) || [];
  const main = stars[0] || '紫微';
  const t = STAR_TRAIT[main] || STAR_TRAIT.紫微;
  const spouse = chart.palaces?.find((p) => p.name === '夫妻宫');
  const careerPalace = chart.palaces?.find((p) => p.name === '官禄宫');
  const wealth = chart.palaces?.find((p) => p.name === '财帛宫');

  const starTxt = (p) => (p?.majorStars?.length ? p.majorStars.map((s) => s.name + (s.mutagen ? `(${s.mutagen})` : '')).join('、') : '宫内无主星，借对宫论');

  const headline = `${main}坐命 · ${STAR_TAG[main] || '天赋自成一格'}的人生剧本`;
  const summary = `你命宫坐「${starTxt(lifePalace)}」，${t}。身宫落${chart.body || '命宫'}，${chart.fiveElementsClass || ''}，人生剧本是"先打地基、后起高楼"——起步看似慢，实则每一步都算数。这一局的优势在"稳"，功课在"敢"：该争的时候争一句，机会才不会被更外放的人拿走。`;
  const love = `夫妻宫见「${starTxt(spouse)}」。你的缘分不喜欢将就，宁缺毋滥是你的底色。感情里你外冷内热：嘴上不煽情，心里的账却记得清清楚楚。真正适合你的人，往往出现在你不再"急着找"的时候——所以别把单身当成一个待修的故障，它可能只是还没到站。`;
  const career = `官禄宫见「${starTxt(careerPalace)}」：凭本事吃饭的格局。你适合"专业＋个人品牌"的路子——技术、创作、咨询、教育这类越老越值钱的领域。年轻时不怕吃亏，每一次"多做一点"都在替你攒名声；三十岁以后，名声会开始替你赚钱。`;
  const loveFull = `夫妻宫见「${starTxt(spouse)}」。你的缘分不喜欢将就，宁缺毋滥是你的底色。感情里你外冷内热，认定之后极其长情；需要留意的课题是——别用"考验对方"来确认爱意，直接说出需求，幸福来得更快。晚婚或聚少离多式的开局，反而更利于长久。`;
  const careerFull = `官禄宫见「${starTxt(careerPalace)}」。事业上你适合"专业立身、名声带财"的路线：技术、创作、咨询、教育等凭真本事说话的领域，都能走出名堂。三十岁前后是重要分水岭，此前的每一次"吃亏"都是在给你攒人攒经验。守住"不赚快钱"的底线，你的路会越走越宽。`;

  const premium = [
    { title: PREMIUM_TITLES.ziwei[0], content: `命宫主星「${starTxt(lifePalace)}」：${t}。你的天赋在于把复杂的事情理出头绪，别人眼里的乱麻，在你手里三下五除二就成了线。善用这份天赋，它就是你安身立命的根本。` },
    { title: PREMIUM_TITLES.ziwei[1], content: `命主${main}，性格层次分明：对事讲原则，对人讲义气，唯独对自己苛刻。你习惯把情绪调静音，报喜不报忧——可亲近的人真正想做的，是当你的"树洞"而不只是观众。允许自己被照顾，是你的成长课题。` },
    { title: PREMIUM_TITLES.ziwei[2], content: loveFull },
    { title: PREMIUM_TITLES.ziwei[3], content: `${careerFull} 财帛宫见「${starTxt(wealth)}」：正财稳、偏财平，"以名带利"是你的财富密码——把作品和口碑做起来，钱会自己找上门。` },
    { title: PREMIUM_TITLES.ziwei[4], content: `大限走势提示：青年期重"学"，中年期重"势"。你的人生不是短跑冲刺型，而是越跑越顺的长跑型——每一次看似绕远的经历，回头看都是伏笔。逢七逢十的年份（28、35 前后）多留意环境变化，顺势调整，事半功倍。` },
    { title: PREMIUM_TITLES.ziwei[5], content: `① 贵人开运：你的贵人多来自"旧识"，多维系老朋友，机会常从回头客来；② 空间开运：工位或书桌保持整洁明亮，杂乱会悄悄偷走你的专注与判断；③ 心法开运：每月给自己留一个"独处日"，你的灵感与决断力，都在安静里生长。命盘给的是地形，走路的人是你。` },
  ];
  return { headline, free: { summary, love, career }, premium };
}

/** 生成某类型解读（演示模式，确定性） */
export function mockInterpret(type, chart) {
  return type === 'bazi' ? mockBazi(chart) : mockZiwei(chart);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------- 每日运势文案（前后端共用） ---------------- */

const DAILY_OPENERS = [
  '今天宜稳扎稳打，把一件小事做到位，运气就会顺着它来。',
  '今天人际磁场不错，主动打个招呼，可能就撞见机会。',
  '今天节奏稍乱也别慌，先列清单再动手，效率自然回来。',
  '今天适合收尾而非开局，把昨天的事推进一步就是赢。',
  '今天灵感在线，适合动笔、动脑、动创意。',
  '今天宜静不宜躁，深呼吸三次再回复那条让你皱眉的消息。',
];

/** 依日期哈希确定性挑选开运提示，同一天所有人一致 */
export function mockDailyText(date, daily) {
  const seed = [...date].reduce((a, c) => a + c.charCodeAt(0), 0);
  const opener = DAILY_OPENERS[seed % DAILY_OPENERS.length];
  return `${date}（${daily.lunar}，${daily.dayGanzhi}）。${opener}今日宜：${daily.yi.join('、')}；宜避：${daily.ji.join('、')}。把你最想推进的事安排在上午，好运更喜欢早起的人。`;
}

/** 按段落流式产出（SSE 协议事件），前后端共用 */
export async function* streamSections(result, pace = 1) {
  yield { event: 'headline', data: result.headline };
  await sleep(300 / pace);
  for (const [key, label] of [['summary', '总运概览'], ['love', '爱情看这'], ['career', '事业看这']]) {
    const text = result.free?.[key] || '';
    for (let i = 0; i < text.length; i += 18) {
      yield { event: 'delta', data: JSON.stringify({ section: key, label, text: text.slice(i, i + 18) }) };
      await sleep(24 / pace);
    }
    await sleep(200 / pace);
  }
  for (const sec of result.premium || []) {
    yield { event: 'premium', data: JSON.stringify(sec) };
    await sleep(160 / pace);
  }
}
