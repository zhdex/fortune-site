# 星阑文化 · 命理网站

> 星盘与灯火，皆为懂你。八字 · 紫微斗数 · 每日运势 —— 深奥的古老智慧，翻译成温柔的白话。

## 项目结构

```
星阑文化/
├── shared/            # 前后端【共用】引擎（纯 JS，浏览器与 Node 都可用）
│   ├── charts.mjs     # 排盘：八字（lunar-javascript）+ 紫微（iztro）+ 黄历
│   └── interpret.mjs  # 演示解读文案 + 流式分片（无后端时的本地回退）
├── server/            # Express 后端
│   ├── index.mjs      # 路由：排盘 / AI 流式解读(SSE) / 模拟支付 / 每日运势
│   ├── charts.mjs     # 转发 shared/charts.mjs（保持旧引用可用）
│   └── ai.mjs         # DeepSeek 解读（JSON mode + 回退演示模板）
├── web/               # React + Vite 前端（星河幻境主题：深空紫 + 金色符印）
│   ├── public/images/        # 主视觉背景（hero-bg.webp/jpg）与 ComfyUI 生成的图标/符印
│   ├── src/i18n/             # 三语词库与切换机制（简中 / 繁中 / English）
│   ├── src/components/       # Nav / LangSwitcher / Mandala(SVG 符印) / Icons / StarField / PayModal
│   ├── src/lib/api.js        # 自动探测后端；不可用则回退本地引擎
│   └── src/pages/            # Home / Fortune(命盘解读) / Daily(每日运势) / About
├── .github/workflows/deploy.yml  # 推送到 main 自动构建并部署 GitHub Pages
├── .env.example       # 环境变量样例
└── package.json
```

## 界面与多语言

- **视觉**：整幅星河背景 + 金色细线符印（纯 SVG，可旋转/呼吸，缩放不糊）+ 四张功能卡（图标为本地 ComfyUI qwen_image_2.1 生成的透明 PNG，转 WebP 后每枚约 10 KB）。
- **多语言**：右上角地球按钮切换 **简体中文 / 繁體中文 / English**，选择记入 `localStorage`（`xinglan_lang`），并同步 `<html lang>`；词库集中在 `web/src/i18n/dict.js`，新增语言只需加一个对象 + 在 `LANGS` 登记。
- **可扩展**：首页由 `content` 驱动（服务卡 / 三步流程 / 定价 / FAQ 均为数据段），页面为 hash 路由，新增页面在 `App.jsx` 的 `ROUTES` 里加一项即可。
- **无障碍**：尊重系统 `prefers-reduced-motion`，关闭动画并取消错峰延迟。

## 在线演示（GitHub Pages）

🔗 **https://zhdex.github.io/fortune-site/**

推送到 `main` 即自动构建部署（`.github/workflows/deploy.yml`，构建时注入 `BASE_PATH=/fortune-site/`）。

> **静态版的诚实说明**：Pages 只能托管静态文件，跑不了 Node 后端。此时
> - **排盘照旧是真的**：八字、紫微、每日运势由浏览器内运行的同一套 `shared/` 引擎计算，结果与后端完全一致；
> - **解读是内置示例文案**：真实 AI（DeepSeek）解读、HMAC 付费令牌校验、服务端模拟支付都需要后端，静态版会自动降级；
> - 页面顶部会明确提示"静态演示版"，不糊弄访客。
>
> 想要真实 AI 解读，把前端 `web/dist` 与后端一起部署到任意支持 Node 的主机即可（前端探测到 `/api/health` 就自动切回真实模式）。

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
