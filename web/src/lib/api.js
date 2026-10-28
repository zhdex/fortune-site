/**
 * 星阑文化 · API 客户端
 * 有后端 → 走后端（真实 AI + HMAC 令牌校验）；无后端（GitHub Pages）→ 本地引擎，权限用本地凭证仓判定。
 * 两种模式对外接口完全一致，页面代码无需分叉。
 */
import { PRODUCTS, scopeCovers } from '../../../shared/catalog.mjs';
import { localBazi, localZiwei, localDaily, localQuiz, localGua, localStream } from './localEngine.js';

const API_BASE = 'api';

let serverUp = null;
let mode = 'unknown';
const modeListeners = new Set();

export function getMode() { return mode; }

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

/* --------------------- 购买凭证仓 --------------------- */

const VAULT_KEY = 'xinglan_vault_v2';

export function getVault() {
  try {
    const v = JSON.parse(localStorage.getItem(VAULT_KEY));
    if (v && Array.isArray(v.purchases)) return v;
  } catch { /* 忽略 */ }
  return { purchases: [] };
}

function saveVault(v) {
  try { localStorage.setItem(VAULT_KEY, JSON.stringify(v)); } catch { /* 忽略 */ }
}

/** 全部有效 scope */
export function getEntitlements() {
  const now = Date.now();
  const set = new Set();
  for (const p of getVault().purchases) {
    if (p.exp && p.exp < now) continue;
    (p.scopes || []).forEach((s) => set.add(s));
  }
  return [...set];
}

/** 所有仍有效的令牌（发给后端校验） */
export function getTokens() {
  const now = Date.now();
  return getVault().purchases.filter((p) => !p.exp || p.exp > now).map((p) => p.token).filter(Boolean);
}

export function hasScope(scope) {
  return scopeCovers(getEntitlements(), scope);
}

export function clearVault() {
  saveVault({ purchases: [] });
}

/* --------------------- 购买流程 --------------------- */

/**
 * 购买一个商品：返回 { product, token, scopes, exp }
 * 后端模式走 create→confirm；静态模式本地签发演示凭证。
 */
export async function purchase(productKey) {
  const product = PRODUCTS[productKey];
  if (!product) throw new Error('未知商品');
  const up = await detect();
  let token = '';
  let scopes = product.scope;
  let exp = Date.now() + (product.ttl || 365 * 24 * 60 * 60 * 1000);

  if (up) {
    const order = await post('/pay/create', { product: productKey });
    await new Promise((r) => setTimeout(r, 900)); // 模拟支付通道耗时
    const done = await post('/pay/confirm', { orderId: order.orderId });
    token = done.token;
    scopes = done.entitlements || product.scope;
    exp = done.expiresAt || exp;
  } else {
    token = `demo.${productKey}.${Date.now().toString(36)}`;
  }

  const vault = getVault();
  vault.purchases = vault.purchases.filter((p) => p.product !== productKey);
  vault.purchases.push({ product: productKey, token, scopes, exp, at: Date.now(), demo: !up });
  saveVault(vault);
  return { product: productKey, token, scopes, exp };
}

/* --------------------- 业务接口 --------------------- */

export const api = {
  bazi: async (input) => ((await detect()) ? post('/bazi', input) : { input, chart: localBazi(input) }),
  ziwei: async (input) => ((await detect()) ? post('/ziwei', input) : { input, chart: localZiwei(input) }),
  daily: async (date) => ((await detect()) ? post('/daily', { date }) : localDaily(date)),

  dailyQuiz: async ({ birth, date }) => {
    if (await detect()) return post('/daily-quiz', { birth, date, tokens: getTokens() });
    return localQuiz({ birth, date, entitlements: getEntitlements() });
  },

  gua: async ({ question, category, date, hour }) => {
    if (await detect()) return post('/gua', { question, category, date, hour, tokens: getTokens() });
    return localGua({ question, category, date, hour, entitlements: getEntitlements() });
  },
};

/* --------------------- 流式解读 --------------------- */

const EVENT_MAP = {
  chart: 'onChart',
  section: 'onSection',
  chapter: 'onChapter',
  chapterlock: 'onChapterLock',
  done: 'onDone',
  error: 'onError',
};

function dispatch(handlers, event, data) {
  const key = EVENT_MAP[event];
  if (!key) return;
  if (event === 'error') {
    handlers.onError?.(new Error(data?.message || '解读失败'));
    return;
  }
  handlers[key]?.(data);
}

function remoteStream({ type, input, handlers, onFallback }) {
  const ctrl = new AbortController();
  let gotChart = false;
  (async () => {
    try {
      const res = await fetch(`${API_BASE}/interpret`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, input, tokens: getTokens() }),
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
          if (event === 'headline') {
            handlers.onHeadline?.(typeof data === 'string' ? data : dataStr);
            continue;
          }
          dispatch(handlers, event, data);
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (!gotChart) onFallback?.();
      else handlers.onError?.(err);
    }
  })();
  return () => ctrl.abort();
}

/**
 * 流式解读。handlers:
 *   onChart, onHeadline, onSection, onChapter, onChapterLock, onDone, onError
 * 返回取消函数。
 */
export function streamInterpret({ type, input, handlers }) {
  let cancelRemote = null;
  let cancelLocal = null;
  let stopped = false;

  (async () => {
    const up = await detect();
    if (stopped) return;
    if (up) {
      cancelRemote = remoteStream({
        type, input, handlers,
        onFallback: () => { if (!stopped) cancelLocal = localStream({ type, input, entitlements: getEntitlements(), handlers }); },
      });
    } else {
      cancelLocal = localStream({ type, input, entitlements: getEntitlements(), handlers });
    }
  })();

  return () => {
    stopped = true;
    cancelRemote?.();
    cancelLocal?.();
  };
}
