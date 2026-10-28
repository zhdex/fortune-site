/**
 * 待支付订单暂存
 * 付款弹窗里点「查看完整条款」→ 跳到条款页；条款页可一键回到原页面并重新打开这笔付款。
 * （免责声明为单方告知，不再要求同意；只有退款政策由付款弹窗的勾选框确认。）
 */

const PENDING_KEY = 'xinglan_pending_pay';
const TTL = 30 * 60 * 1000;

export function setPending(product, from, focus) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ product, from, focus, at: Date.now() }));
  } catch { /* 忽略 */ }
}

export function peekPending() {
  try {
    const v = JSON.parse(sessionStorage.getItem(PENDING_KEY));
    return v && Date.now() - v.at < TTL ? v : null;
  } catch {
    return null;
  }
}

export function takePending() {
  const v = peekPending();
  try { sessionStorage.removeItem(PENDING_KEY); } catch { /* 忽略 */ }
  return v;
}

export function clearPending() {
  try { sessionStorage.removeItem(PENDING_KEY); } catch { /* 忽略 */ }
}
