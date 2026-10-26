/**
 * 星阑文化 · 服务器
 * 路由：排盘 / AI 流式解读（SSE）/ 模拟支付 / 每日运势
 * 支付为演示占位：确认后签发 HMAC 令牌，凭令牌解锁完整报告。
 */
import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeBazi, computeZiwei, computeDaily } from './charts.mjs';
import { interpretWithAI, streamSections, mockInterpret, hasRealAI } from './ai.mjs';
import { mockDailyText } from '../shared/interpret.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8787);
const PAY_SECRET = process.env.PAY_SECRET || 'xinglan-demo-secret-2026';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 365; // 解锁令牌有效期 1 年

const app = express();
app.use(express.json({ limit: '256kb' }));

/* ------------------------- 工具函数 ------------------------- */

const b64u = (buf) => Buffer.from(buf).toString('base64url');
const hmac = (data) => crypto.createHmac('sha256', PAY_SECRET).update(data).digest('base64url');

/** 签发解锁令牌：payload.signature */
function issueToken(type) {
  const payload = { t: type, exp: Date.now() + TOKEN_TTL_MS };
  const body = b64u(JSON.stringify(payload));
  return `${body}.${hmac(body)}`;
}

/** 校验令牌；返回 payload 或 null */
function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  try {
    const expected = hmac(body);
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function bad(res, msg, code = 400) {
  return res.status(code).json({ error: msg });
}

/** 校验出生输入并规范为整数 */
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

/* ------------------------- 排盘接口 ------------------------- */

app.get('/api/health', (_req, res) => res.json({ ok: true, mode: hasRealAI() ? 'real' : 'demo', service: '星阑文化' }));

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

/* ------------------------- AI 流式解读（SSE） ------------------------- */
/**
 * POST /api/interpret
 * body: { type: 'bazi'|'ziwei', input: {...}, token?: string }
 * 事件流：
 *   chart    → 完整排盘 JSON
 *   headline → 一句话总评
 *   delta    → 免费段落增量 {section,label,text}
 *   premium  → 完整章节 {title,content}（需有效令牌）
 *   locked   → 未解锁提示
 *   done     → {unlocked, mock}
 */
app.post('/api/interpret', async (req, res) => {
  const { type = 'bazi', token = '' } = req.body || {};
  const input = normalizeInput(req.body?.input);
  if (!['bazi', 'ziwei'].includes(type)) return bad(res, '未知的报告类型');
  if (!input) return bad(res, '出生信息不完整或超出支持范围（1900-2100 年）');

  const unlocked = Boolean(verifyToken(token));
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
    for await (const evt of streamSections(result)) {
      if (evt.event === 'premium' && !unlocked) continue; // 未解锁：扣下付费章节
      send(evt.event, evt.data);
    }
    if (!unlocked) {
      send('locked', JSON.stringify({
        count: (result.premium || []).length,
        titles: (result.premium || []).map((s) => s.title),
      }));
    }
    send('done', JSON.stringify({ unlocked, mock }));
  } catch (e) {
    send('error', JSON.stringify({ message: '解读生成失败：' + e.message }));
  } finally {
    res.end();
  }
});

/* ------------------------- 每日运势 ------------------------- */

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

const ORDERS = new Map(); // orderId -> {type, amount, status, createdAt}

app.post('/api/pay/create', (req, res) => {
  const type = req.body?.type === 'ziwei' ? 'ziwei' : 'bazi';
  const orderId = 'XL' + Date.now().toString(36).toUpperCase() + crypto.randomBytes(2).toString('hex').toUpperCase();
  const order = { orderId, type, amount: 9.9, subject: '星阑文化 · 完整命盘报告', status: 'pending', createdAt: Date.now() };
  ORDERS.set(orderId, order);
  res.json({ ...order, payUrl: null, note: '演示占位支付：确认后直接签发解锁令牌' });
});

app.post('/api/pay/confirm', (req, res) => {
  const { orderId } = req.body || {};
  const order = ORDERS.get(orderId);
  if (!order) return bad(res, '订单不存在或已过期', 404);
  order.status = 'paid';
  order.paidAt = Date.now();
  const token = issueToken(order.type);
  res.json({ orderId: order.orderId, status: 'paid', token, expiresIn: TOKEN_TTL_MS });
});

app.post('/api/pay/verify', (req, res) => {
  const payload = verifyToken(req.body?.token);
  res.json({ valid: Boolean(payload), payload: payload || null });
});

/* ------------------------- 静态资源（生产模式） ------------------------- */

const distDir = path.join(__dirname, '..', 'web', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`[星阑文化] 服务器已启动: http://localhost:${PORT} （AI 模式: ${hasRealAI() ? 'DeepSeek 真实接口' : '演示模拟'}）`);
});
