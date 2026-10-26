/**
 * API 客户端
 * 优先连接后端（真实 AI 解读 + HMAC 付费令牌）；
 * 若后端不可用（例如 GitHub Pages 静态托管），自动回退为浏览器本地引擎（演示模式）。
 */
import { localBazi, localZiwei, localDaily, localStream } from './localEngine.js';

const API_BASE = 'api';

let serverUp = null; // null=未知, true=有后端, false=静态模式
let mode = 'unknown';
const modeListeners = new Set();

export function getMode() {
  return mode;
}

/** 订阅模式变化（'server' | 'static'） */
export function onModeChange(fn) {
  modeListeners.add(fn);
  if (mode !== 'unknown') fn(mode);
  return () => modeListeners.delete(fn);
}

function setMode(m) {
  if (mode === m) return;
  mode = m;
  modeListeners.forEach((fn) => fn(m));
}

/** 探测后端是否可用（结果缓存，只探测一次） */
async function detect() {
  if (serverUp !== null) return serverUp;
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
    const ct = res.headers.get('content-type') || '';
    serverUp = res.ok && ct.includes('json');
  } catch {
    serverUp = false;
  }
  setMode(serverUp ? 'server' : 'static');
  return serverUp;
}

/** 供页面在挂载时调用，确保模式已确定 */
export async function ensureMode() {
  await detect();
  return mode;
}

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '请求失败' }));
    throw new Error(err.error || `请求失败 (${res.status})`);
  }
  return res.json();
}

/** 静态模式下的演示订单与解锁标记（本地生成，仅用于演示） */
function localOrder(type) {
  return {
    orderId: 'XL' + Date.now().toString(36).toUpperCase(),
    type,
    amount: 9.9,
    subject: '星阑文化 · 完整命盘报告',
    status: 'pending',
    demo: true,
  };
}

export const api = {
  bazi: async (input) => ((await detect()) ? post('/bazi', input) : { input, chart: localBazi(input) }),
  ziwei: async (input) => ((await detect()) ? post('/ziwei', input) : { input, chart: localZiwei(input) }),
  daily: async (date) => ((await detect()) ? post('/daily', { date }) : localDaily(date)),
  payCreate: async (type) => ((await detect()) ? post('/pay/create', { type }) : localOrder(type)),
  payConfirm: async (orderId, type) => {
    if (await detect()) return post('/pay/confirm', { orderId });
    return { orderId, status: 'paid', token: `demo.${type}.${Date.now().toString(36)}`, demo: true };
  },
  payVerify: async (token) => {
    if (await detect()) return post('/pay/verify', { token });
    return { valid: Boolean(token), payload: null, demo: true };
  },
};

/* --------------------- 流式解读 --------------------- */

function remoteStream({ type, input, token, handlers, onFallback }) {
  const ctrl = new AbortController();
  let gotChart = false;
  (async () => {
    try {
      const res = await fetch(`${API_BASE}/interpret`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, input, token }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error('解读服务不可用');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf('\n\n')) !== -1) {
          const raw = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          let event = 'message';
          const dataLines = [];
          for (const line of raw.split('\n')) {
            if (line.startsWith('event:')) event = line.slice(6).trim();
            else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
          }
          if (!dataLines.length) continue;
          const dataStr = dataLines.join('\n');
          let data = dataStr;
          try { data = JSON.parse(dataStr); } catch { /* 保留原始字符串 */ }
          if (event === 'chart') gotChart = true;
          if (event === 'headline') handlers.onHeadline?.(typeof data === 'string' ? data : dataStr);
          else if (event === 'chart') handlers.onChart?.(data);
          else if (event === 'delta') handlers.onDelta?.(data);
          else if (event === 'premium') handlers.onPremium?.(data);
          else if (event === 'locked') handlers.onLocked?.(data);
          else if (event === 'done') handlers.onDone?.(data);
          else if (event === 'error') handlers.onError?.(new Error(data?.message || '解读失败'));
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (!gotChart) onFallback?.(); // 后端中途不可用：退回本地演示
      else handlers.onError?.(err);
    }
  })();
  return () => ctrl.abort();
}

/**
 * 流式解读（自动选择后端 SSE 或本地模拟）。
 * handlers: {onChart, onHeadline, onDelta, onPremium, onLocked, onDone, onError}
 * 返回取消函数。
 */
export function streamInterpret({ type, input, token, handlers }) {
  let cancelRemote = null;
  let cancelLocal = null;
  let stopped = false;

  (async () => {
    const up = await detect();
    if (stopped) return;
    if (up) {
      cancelRemote = remoteStream({
        type, input, token, handlers,
        onFallback: () => {
          if (!stopped) cancelLocal = localStream({ type, input, token, handlers });
        },
      });
    } else {
      cancelLocal = localStream({ type, input, token, handlers });
    }
  })();

  return () => {
    stopped = true;
    cancelRemote?.();
    cancelLocal?.();
  };
}

/* --------------------- 解锁令牌存取 --------------------- */

const TOKEN_KEY = 'xinglan_unlock_tokens';

export function getTokens() {
  try { return JSON.parse(localStorage.getItem(TOKEN_KEY)) || {}; } catch { return {}; }
}

export function saveToken(type, token) {
  const all = getTokens();
  all[type] = token;
  localStorage.setItem(TOKEN_KEY, JSON.stringify(all));
}
