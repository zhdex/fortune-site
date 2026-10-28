/**
 * 同意状态与"待支付订单"暂存
 * - consent：用户是否已阅读并同意《免责声明》《退款政策》（localStorage，长期有效）
 * - pending：从付款弹窗跳到条款页时暂存商品与来路，同意后自动回到原页并重新打开付款
 */

const CONSENT_KEY = 'xinglan_consent_v1';
const PENDING_KEY = 'xinglan_pending_pay';
const TTL = 30 * 60 * 1000;

export function getConsent() {
  try {
    const v = JSON.parse(localStorage.getItem(CONSENT_KEY));
    return v && v.agreed ? v : null;
  } catch {
    return null;
  }
}

export function hasConsent() {
  return Boolean(getConsent());
}

export function setConsent() {
  const v = { agreed: true, at: Date.now() };
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(v)); } catch { /* 忽略 */ }
  return v;
}

export function setPending(product, from) {
  try { sessionStorage.setItem(PENDING_KEY, JSON.stringify({ product, from, at: Date.now() })); } catch { /* 忽略 */ }
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
