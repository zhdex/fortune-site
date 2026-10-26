# 星阑文化 · 命理网站

> 星盘与灯火，皆为懂你。八字 · 紫微斗数 · 每日运势 —— 深奥的古老智慧，翻译成温柔的白话。

## 项目结构

```
星阑文化/
├── server/            # Express 后端
│   ├── index.mjs      # 路由：排盘 / AI 流式解读(SSE) / 模拟支付 / 每日运势
│   ├── charts.mjs     # 排盘引擎（lunar-javascript 八字 + iztro 紫微，纯本地计算）
│   └── ai.mjs         # DeepSeek 解读（JSON mode + 回退演示模板）
├── web/               # React + Vite 前端（紫色星空主题）
│   └── src/pages/     # Home / Fortune(命盘解读) / Daily(每日运势) / About
├── .env.example       # 环境变量样例
└── package.json
```

## 快速开始

### 1. 配置 AI（可选）

复制 `.env.example` 为 `.env`，填入 DeepSeek 密钥：

```
DEEPSEEK_API_KEY=sk-你的密钥
DEEPSEEK_MODEL=deepseek-chat
PAY_SECRET=xinglan-demo-secret-2026
PORT=8787
```

> **不填密钥也能跑**：服务器自动进入演示模式，用确定性模板文本 + 模拟流式输出，适合先看效果。

### 2. 启动

```bash
# 后端（端口 8787）
pnpm install
pnpm start          # 或 pnpm dev（--watch）

# 前端开发模式（端口 5188，已代理 /api 到 8787）
cd web
pnpm install
pnpm dev            # 打开 http://localhost:5188

# 或生产构建后由后端直接托管
pnpm run build      # 产物在 web/dist，服务器自动挂载
# 然后只访问 http://localhost:8787 即可
```

## 功能一览

| 模块 | 说明 | 收费 |
|---|---|---|
| 八字排盘 | 四柱、五行、纳音、大运（本地引擎精确计算，含节气） | 总评/爱情/事业免费 |
| 紫微斗数 | 十二宫安星、命主身宫、大限（iztro 引擎） | 同上 |
| AI 白话解读 | DeepSeek 流式输出，把术语翻译成通俗温暖的语言 | 免费小段 + 付费完整六章 |
| 完整报告 | 性格底色 / 婚姻详批 / 财运 / 健康 / 2026流年 / 开运建议 | ￥9.9 一次解锁 |
| 每日运势 | 黄历宜忌 + 白话开运提示 | 永久免费 |

## 支付说明（演示占位）

`/api/pay/create` → `/api/pay/confirm` 为**模拟支付**：确认后服务器签发 HMAC-SHA256
解锁令牌，前端存入 localStorage；解读接口校验令牌后才下发付费章节。接入真实支付时，
只需替换 `confirm` 为支付回调并沿用同一套 HMAC 令牌签发逻辑。

## 免责声明

本站内容为传统文化的现代演绎，仅供娱乐与自我观照，不构成医疗、法律、投资建议。
