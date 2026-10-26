/**
 * 星阑文化 · AI 解读模块（服务端）
 * 真实模式：调用 DeepSeek 云端 API（JSON mode），把排盘 JSON 翻译成通俗易懂的语言。
 * 演示模式：未配置 DEEPSEEK_API_KEY 时，回退到 shared/interpret.mjs 的确定性模板。
 */
import { mockInterpret, streamSections } from '../shared/interpret.mjs';

export { mockInterpret, streamSections };

const API_URL = 'https://api.deepseek.com/chat/completions';
const API_KEY = process.env.DEEPSEEK_API_KEY || '';
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

const SYSTEM_PROMPT = `你是一位从业三十年的资深命理师，精通周易八字与紫微斗数。
你的任务：把给定的排盘 JSON 数据，翻译成【通俗易懂、温暖治愈】的白话解读。
铁律：
1. 一切论断必须以排盘数据为依据，不许凭空编造八字或星曜之外的东西；
2. 语言要像知心姐姐聊天，把"七杀入命"讲成"你骨子里有股闯劲"，绝不可堆砌术语；
3. 输出严格为 JSON，格式如下，不要输出任何其他文字：
{
  "headline": "一句话总评（20字内，点睛）",
  "free": { "summary": "总运概览，2-3句", "love": "爱情小段，2-3句", "career": "事业小段，2-3句" },
  "premium": [ { "title": "章节标题", "content": "该章详细解读，4-6句" } ]
}
4. premium 恰好 6 章；语气积极但不回避挑战，末尾可给可执行的小建议；
5. 不提供医疗、法律、投资建议；不宣扬宿命论，强调"命是底色，运在自己手里"。`;

function buildUserPrompt(type, chart) {
  const label = type === 'bazi' ? '八字' : '紫微斗数';
  return `这是用户的${label}排盘数据，请按系统要求的 JSON 格式输出通俗解读：\n${JSON.stringify(chart)}`;
}

export function hasRealAI() {
  return Boolean(API_KEY);
}

/** 调用 DeepSeek 获取解读 JSON；失败时回退演示文本 */
export async function interpretWithAI(type, chart) {
  if (!hasRealAI()) return { text: mockInterpret(type, chart), mock: true };
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(type, chart) },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 3000,
      }),
    });
    if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}`);
    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return { text: parsed, mock: false };
  } catch (err) {
    console.error('[ai] DeepSeek 调用失败，回退演示模式：', err.message);
    return { text: mockInterpret(type, chart), mock: true };
  }
}
