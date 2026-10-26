/**
 * 星阑文化 · 浏览器本地引擎（静态托管模式）
 * GitHub Pages 等纯静态环境没有后端，排盘与演示解读全部在浏览器内完成：
 * 复用仓库根目录 shared/ 下的同一份引擎，保证与服务器结果完全一致。
 */
import { computeBazi, computeZiwei, computeDaily } from '../../../shared/charts.mjs';
import { mockInterpret, streamSections, mockDailyText } from '../../../shared/interpret.mjs';

export const localBazi = (input) => computeBazi(input);
export const localZiwei = (input) => computeZiwei(input);
export const localDaily = (date) => {
  const daily = computeDaily(date);
  return { daily, text: mockDailyText(date, daily) };
};
export const localInterpret = (type, chart) => mockInterpret(type, chart);

/** 本地模拟流式解读：事件协议与服务器 SSE 完全一致 */
export function localStream({ type, input, token, handlers }) {
  let stopped = false;
  (async () => {
    try {
      const chart = type === 'bazi' ? computeBazi(input) : computeZiwei(input);
      if (stopped) return;
      handlers.onChart?.({ input, chart });

      const unlocked = Boolean(token);
      const result = mockInterpret(type, chart);
      for await (const evt of streamSections(result)) {
        if (stopped) return;
        if (evt.event === 'premium' && !unlocked) continue;
        if (evt.event === 'headline') handlers.onHeadline?.(evt.data);
        else if (evt.event === 'delta') handlers.onDelta?.(JSON.parse(evt.data));
        else if (evt.event === 'premium') handlers.onPremium?.(JSON.parse(evt.data));
      }
      if (stopped) return;
      const titles = (result.premium || []).map((s) => s.title);
      if (!unlocked) handlers.onLocked?.({ count: titles.length, titles });
      handlers.onDone?.({ unlocked, mock: true, static: true });
    } catch (err) {
      if (!stopped) handlers.onError?.(err);
    }
  })();
  return () => { stopped = true; };
}
