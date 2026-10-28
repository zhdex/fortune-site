/**
 * 页面草稿：跳去条款页再回来时，把用户已填的内容 / 已选商品恢复回来。
 * 用 sessionStorage（关掉标签页即清），不影响隐私。
 */

const KEY = 'xinglan_drafts_v1';

function readAll() {
  try { return JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch { return {}; }
}

export function saveDraft(name, value) {
  const all = readAll();
  all[name] = { value, at: Date.now() };
  try { sessionStorage.setItem(KEY, JSON.stringify(all)); } catch { /* 忽略 */ }
}

export function loadDraft(name, ttl = 30 * 60 * 1000) {
  const all = readAll();
  const hit = all[name];
  if (!hit) return null;
  if (Date.now() - hit.at > ttl) return null;
  return hit.value;
}

export function clearDraft(name) {
  const all = readAll();
  delete all[name];
  try { sessionStorage.setItem(KEY, JSON.stringify(all)); } catch { /* 忽略 */ }
}
