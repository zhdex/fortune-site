/**
 * 星阑文化 · 服务器
 * 路由：排盘 / 分段付费解读（SSE）/ 每日运势小测验 / 一日一卦 / 模拟支付 / 静态托管
 *
 * 变现模型（与 shared/catalog.mjs 一致）：
 *   命盘三段各 $3.99，整体 $11.99
 *   每日运势 $0.99/日、$11.99/月、$29.99/半年、$49.99/年（年卡解锁全部）
 *   一日一卦深度解读 $1.99
 * 支付为演示占位：确认后签发带 scope 的 HMAC 令牌，凭令牌解锁对应内容。
 */
import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeBazi, computeZiwei, computeDaily } from './charts.mjs';
import { interpretWithAI, streamSections, hasRealAI } from './ai.mjs';
import { mockDailyText } from '../shared/interpret.mjs';
import { computeDailyQuiz, computeWeek } from '../shared/dailyQuiz.mjs';
import { castGua, guaHeadline, GUA_CATEGORIES } from '../shared/divination.mjs';
import { PRODUCTS, scopeCovers, SECTION_SCOPE, READING_PRODUCTS, DAILY_PRODUCTS } from '../shared/catalog.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8787);
const PAY_SECRET = process.env.PAY_SECRET || 'xinglan-demo-secret-2026';
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const TEASER_CHARS = 88;

const app = express();
app.use(express.json({ limit: '256kb' }));

/* ------------------------- 令牌 ------------------------- */

const b64u = (buf) => Buffer.from(buf).toString('base64url');
const hmac = (data) => crypto.createHmac('sha256', PAY_SECRET).update(data).digest('base64url');

/** 签发解锁令牌：{ sk: 商品键, sc: [scope], exp } */
function issueToken(productKey, ttl = YEAR_MS) {
  const product = PRODUCTS[productKey];
  const payload = { sk: productKey, sc: product.scope, exp: Date.now() + (product.ttl || ttl) };
  const body = b64u(JSON.stringify(payload));
  return `${body}.${hmac(body)}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  try {
    const expected = hmac(body);
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (!payload.exp || Date.now() > payload.exp) return null;
    if (!Array.isArray(payload.sc)) return null;
    return payload;
  } catch {
    return null;
  }
}

/** 合并多个令牌的权限 */
function entitlementsOf(tokens) {
  const list = Array.isArray(tokens) ? tokens : tokens ? [tokens] : [];
  const set = new Set();
  for (const t of list) {
    const p = verifyToken(t);
    if (p) p.sc.forEach((s) => set.add(s));
  }
  return [...set];
}

function bad(res, msg, code = 400) {
  return res.status(code).json({ error: msg });
}

function normalizeInput(input = {}) {
  const { year, month, day, hour = 12, minute = 0, gender = '男', name = '' } = input;
  const y = Number(year), m = Number(month), d = Number(day), h = Number(hour), mi = Number(minute);
  if (!Number.isInteger(y) || y < 1900 || y > 2100) return null;
  if (!Number.isInteger(m) || m < 1 || m > 12) return null;
  if (!Number.isInteger(d) || d < 1 || d > 31) return null;
  if (!Number.isInteger(h) || h < 0 || h > 23) return null;
  if (!Number.isInteger(mi) || mi < 0 || mi > 59) return null;
  return { year: y, month: m, day: d, hour: h, minute: mi, gender: gender === '女' ? '女' : '男', name: String(name).slice(0, 20) };
}

/* ------------------------- 基础接口 ------------------------- */

app.get('/api/health', (_req, res) => res.json({ ok: true, mode: hasRealAI() ? 'real' : 'demo', service: '星阑文化' }));

app.get('/api/products', (_req, res) => res.json({
  currency: 'USD',
  products: PRODUCTS,
  reading: READING_PRODUCTS,
  daily: DAILY_PRODUCTS,
}));

app.post('/api/bazi', (req, res) => {
  const input = normalizeInput(req.body);
  if (!input) return bad(res, '出生信息不完整或超出支持范围（1900-2100 年）');
  try {
    res.json({ input, chart: computeBazi(input) });
  } catch (e) {
    bad(res, '排盘失败：' + e.message, 500);
  }
});

app.post('/api/ziwei', (req, res) => {
  const input = normalizeInput(req.body);
  if (!input) return bad(res, '出生信息不完整或超出支持范围（1900-2100 年）');
  try {
    res.json({ input, chart: computeZiwei(input) });
  } catch (e) {
    bad(res, '排盘失败：' + e.message, 500);
  }
});

/* ------------------------- 分段付费解读（SSE） ------------------------- */

const SECTION_LABEL = { summary: '总运概览', love: '爱情看这', career: '事业看这' };

app.post('/api/interpret', async (req, res) => {
  const { type = 'bazi', tokens = [] } = req.body || {};
  const input = normalizeInput(req.body?.input);
  if (!['bazi', 'ziwei'].includes(type)) return bad(res, '未知的报告类型');
  if (!input) return bad(res, '出生信息不完整或超出支持范围（1900-2100 年）');

  const ent = entitlementsOf(tokens);
  const allChapters = scopeCovers(ent, 'ch:all');

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  const send = (event, data) => res.write(`event: ${event}\ndata: ${typeof data === 'string' ? data : JSON.stringify(data)}\n\n`);

  try {
    const chart = type === 'bazi' ? computeBazi(input) : computeZiwei(input);
    send('chart', { input, chart });

    const { text: result, mock } = await interpretWithAI(type, chart);

    // 先给一句话总评
    if (result.headline) send('headline', result.headline);

    // 三段：未购给 teaser，已购给全文
    for (const key of ['summary', 'love', 'career']) {
      const text = result.free?.[key];
      if (!text) continue;
      const scope = SECTION_SCOPE[key];
      if (scopeCovers(ent, scope)) {
        send('section', { section: key, label: SECTION_LABEL[key], text, unlocked: true });
      } else {
        // 预览约一半，保证"看得到钩子、看不到全文"
        const teaserLen = Math.max(40, Math.min(TEASER_CHARS, Math.floor(text.length * 0.55)));
        send('section', {
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

    // 深度章节：整体解锁才下发
    const chapters = result.premium || [];
    if (allChapters) {
      for await (const evt of streamSections({ ...result, free: {} })) {
        if (evt.event === 'premium') send('chapter', JSON.parse(evt.data));
      }
    } else {
      send('chapterlock', {
        count: chapters.length,
        titles: chapters.map((c) => c.title),
        scope: 'ch:all',
        price: PRODUCTS['bundle:reading'].price,
      });
    }

    send('done', { entitlements: ent, mock });
  } catch (e) {
    send('error', { message: '解读生成失败：' + e.message });
  } finally {
    res.end();
  }
});

/* ------------------------- 每日运势小测验 ------------------------- */

app.post('/api/daily-quiz', (req, res) => {
  const birthInput = req.body?.birth || {};
  const y = Number(birthInput.year), m = Number(birthInput.month), d = Number(birthInput.day);
  if (!Number.isInteger(y) || y < 1900 || y > 2100 || !Number.isInteger(m) || m < 1 || m > 12 || !Number.isInteger(d) || d < 1 || d > 31) {
    return bad(res, '请提供有效的出生年月日（1900-2100）');
  }
  const date = String(req.body?.date || new Date().toISOString().slice(0, 10));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return bad(res, '日期格式应为 YYYY-MM-DD');

  try {
    const quiz = computeDailyQuiz({ year: y, month: m, day: d }, date);
    const ent = entitlementsOf(req.body?.tokens);
    const entitled = scopeCovers(ent, 'daily');
    if (!entitled) {
      return res.json({
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
      });
    }
    return res.json({
      entitled: true,
      quiz,
      week: computeWeek({ year: y, month: m, day: d }, date),
    });
  } catch (e) {
    return bad(res, '运势生成失败：' + e.message, 500);
  }
});

/* ------------------------- 一日一卦 ------------------------- */

app.post('/api/gua', (req, res) => {
  const { question = '', category = 'other', date, hour = new Date().getHours(), tokens = [] } = req.body || {};
  try {
    const gua = castGua({ dateStr: date, hour: Number(hour), question, category });
    const ent = entitlementsOf(tokens);
    const entitled = scopeCovers(ent, 'gua');
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
      return res.json({
        entitled: false,
        free: { ...base, judgement: gua.ben.judgement },
        price: PRODUCTS['gua:single'].price,
      });
    }
    const timing = gua.moving <= 2
      ? '动爻在下三爻：事情在近期（一周内）会有明确信号，宜早作准备。'
      : gua.moving <= 4
        ? '动爻在中段：约三到四周见分晓，中间会有一到两次反复，属正常。'
        : '动爻在上三爻：结果偏慢，约一到两个月才明朗，急不得。';
    return res.json({
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
    });
  } catch (e) {
    return bad(res, '起卦失败：' + e.message, 500);
  }
});

/* ------------------------- 每日黄历（保留） ------------------------- */

app.post('/api/daily', (req, res) => {
  const date = String(req.body?.date || new Date().toISOString().slice(0, 10));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return bad(res, '日期格式应为 YYYY-MM-DD');
  try {
    const daily = computeDaily(date);
    res.json({ daily, text: mockDailyText(date, daily) });
  } catch (e) {
    bad(res, '每日运势生成失败：' + e.message, 500);
  }
});

/* ------------------------- 模拟支付（占位） ------------------------- */

const ORDERS = new Map();

app.post('/api/pay/create', (req, res) => {
  const key = String(req.body?.product || '');
  const product = PRODUCTS[key];
  if (!product) return bad(res, '未知商品', 404);
  const orderId = 'XL' + Date.now().toString(36).toUpperCase() + crypto.randomBytes(2).toString('hex').toUpperCase();
  const order = {
    orderId,
    product: key,
    title: product.title,
    price: product.price,
    currency: 'USD',
    status: 'pending',
    createdAt: Date.now(),
  };
  ORDERS.set(orderId, order);
  res.json({ ...order, note: '演示占位支付：确认后直接签发解锁令牌' });
});

app.post('/api/pay/confirm', (req, res) => {
  const { orderId } = req.body || {};
  const order = ORDERS.get(orderId);
  if (!order) return bad(res, '订单不存在或已过期', 404);
  order.status = 'paid';
  order.paidAt = Date.now();
  const token = issueToken(order.product);
  const payload = verifyToken(token);
  res.json({
    orderId: order.orderId,
    status: 'paid',
    token,
    entitlements: payload?.sc || [],
    expiresAt: payload?.exp || null,
  });
});

app.post('/api/pay/verify', (req, res) => {
  const payload = verifyToken(req.body?.token);
  res.json({ valid: Boolean(payload), payload: payload || null });
});

app.post('/api/pay/entitlements', (req, res) => {
  res.json({ entitlements: entitlementsOf(req.body?.tokens) });
});

/* ------------------------- 静态资源 ------------------------- */

const distDir = path.join(__dirname, '..', 'web', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`[星阑文化] 服务器已启动: http://localhost:${PORT} （AI 模式: ${hasRealAI() ? 'DeepSeek 真实接口' : '演示模拟'}）`);
});
