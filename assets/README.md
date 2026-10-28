# 素材归档说明（assets/）

这个目录的作用只有一个：**让项目自包含**。任何一台机器拿到 `星阑文化/` 这个文件夹，
都能看懂每张图从哪来、怎么用、怎么重新生成，不依赖 Downloads、不依赖 ComfyUI 的历史记录。

> 站点真正对外引用的图不在这里，而在 `web/public/images/`（构建时原样复制到 `dist/`）。
> 这里存的是**原始素材与生成原图**，是那些优化后文件的来源。

```
assets/
├── source/          # 主上提供的原始素材（保留原图，不改动）
├── generated/       # 本地 ComfyUI qwen_image_2.1 生成的原图（1024×1024，RGBA 透明底）
├── screenshots/     # 验收截图（桌面 / 手机 / 关于页 / 线上实拍）
└── README.md        # 本文件
```

---

## 一、source/ —— 主上提供的原始素材

| 文件 | 原文件名 | 尺寸 | 用途 |
|---|---|---|---|
| `hero-bg-original.png` | `梦幻紫粉星空曼陀罗.png`（主上 2026-10-28 提供） | 1672×940 | **当前首页主视觉背景**（太极八卦 + 紫粉星云） |
| `hero-bg-previous.png` | `星河幻境中的秘法之门.png`（2026-10-26 提供） | 1536×1024，3.05 MB，RGB | 上一版主视觉，已停用，仅留档对比 |

**优化产物（站点实际使用）**：`web/public/images/hero-bg.webp`（379 KB）、`hero-bg.jpg`（376 KB）。
用 Python + Pillow 转换，命令等价于：

```python
from PIL import Image
im = Image.open("assets/source/hero-bg-original.png").convert("RGB")
im.save("web/public/images/hero-bg.webp", "WEBP", quality=88, method=6)
im.save("web/public/images/hero-bg.jpg", "JPEG", quality=84, optimize=True, progressive=True)
```

> 页面上用 `background-image` 同时给 webp 与 jpg 两个源，浏览器自动取支持的那个。

---

## 二、generated/ —— ComfyUI 生成原图

全部由**本地 ComfyUI**（`http://127.0.0.1:8188`）的 `qwen_image_2.1` 文生图工作流生成，
比例为 `1:1 (Square)`、`mp=1`、25 步，提示词写在下方附录里（英文提交）。
透明底靠提示词固定句式实现：

```
This is an RGBA format image with transparency. [主体描述]. The image has an alpha channel and a transparent background.
```

| 原图 | 用途 | 站点产物 | 体积变化 |
|---|---|---|---|
| `sigil.png` | 内页标题背后的水印符印 | `web/public/images/gen/sigil.webp`（560×560） | 1613 KB → 101 KB |
| `icon-self.png` | 「自我认知」卡片徽章 | `web/public/images/gen/icon-self.webp`（192×192） | 867 KB → 10 KB |
| `icon-career.png` | 「事业方向」卡片徽章 | `web/public/images/gen/icon-career.webp` | 834 KB → 10 KB |
| `icon-love.png` | 「情感关系」卡片徽章 | `web/public/images/gen/icon-love.webp` | 887 KB → 11 KB |
| `icon-fortune.png` | 「流年运势」卡片徽章 | `web/public/images/gen/icon-fortune.webp` | 850 KB → 10 KB |

**转 WebP 的做法**：先按 alpha 通道自动裁掉四周留白（`getbbox()`），补成正方形，
再用 LANCZOS 缩到目标尺寸存 WebP（质量 90）。这样图标在圆形徽章里更饱满，体积也小一个数量级。

**兜底**：卡片图标走 `<img>`，加载失败时自动回落到 `web/src/components/Icons.jsx` 里的 SVG 线稿，
不会出现破图；SVG 版本也是同一套金色线条语言。

### 附录：生成提示词（英文原文）

```text
# sigil
This is an RGBA format image with transparency. An ornate celestial sigil emblem: a six-pointed
star drawn in thin luminous gold line art, enclosed by three concentric ritual circles filled with
tiny astrological glyphs and rune ticks, delicate sparks along the strokes, perfectly symmetrical,
centered, floating in empty space, intricate and elegant, premium mystical brand emblem, crisp thin
gold strokes with soft bloom, no text, no frame. The image has an alpha channel and a transparent background.

# icon-self
This is an RGBA format image with transparency. A minimal gold line-art icon of a seated meditating
figure with crossed legs inside a thin circular ring, a small crescent moon and two tiny four-pointed
stars hovering above the head, perfectly symmetrical, centered, elegant uniform thin gold strokes with
a soft warm glow, flat crisp vector-like clarity, generous empty margin around the ring, no text, no frame.
The image has an alpha channel and a transparent background.

# icon-career
This is an RGBA format image with transparency. A minimal gold line-art icon of a rising staircase of
three ascending bars with a slim upward arrow above them, enclosed in a thin circular ring, two tiny
four-pointed stars flanking the ring, perfectly symmetrical, centered, uniform thin gold strokes with
soft warm glow, flat crisp vector-like clarity, generous empty margin, no text, no frame.
The image has an alpha channel and a transparent background.

# icon-love
This is an RGBA format image with transparency. A minimal gold line-art icon of two interlocking
hearts tilted slightly, embraced by a thin crescent arc, inside a thin circular ring, a single tiny
star at the top, symmetrical and balanced, centered, uniform thin gold strokes with soft warm glow,
flat crisp vector-like clarity, generous empty margin, no text, no frame.
The image has an alpha channel and a transparent background.

# icon-fortune
This is an RGBA format image with transparency. A minimal gold line-art icon of an eight-pointed
compass rose made of long and short rays inside a thin circular ring, four tiny dots at the cardinal
points, one slender star at the center, perfectly symmetrical, centered, uniform thin gold strokes
with soft warm glow, flat crisp vector-like clarity, generous empty margin, no text, no frame.
The image has an alpha channel and a transparent background.
```

提交脚本（技能 `comfyui`）：

```python
import sys
sys.path.insert(0, r"C:\Users\zhdex\.dsh\skills\comfyui\scripts")
import submit_qwen_t2i as q
q.run(prompt=PROMPT, ratio="1:1 (Square)", mp=1)
```

---

## 三、generated/ 第二批（v3：五行 / 每日场景 / 八卦）

同一套 qwen_image_2.1、同一句透明底提示词模板，`1:1 (Square)` + `mp=1`。

| 原图 | 用途 | 站点产物 | 体积 |
|---|---|---|---|
| `wuxing-wood.png` | 五行·木（树与根） | `gen/wuxing-wood.webp`（192²） | 21 KB |
| `wuxing-fire.png` | 五行·火（火焰） | `gen/wuxing-fire.webp` | 15 KB |
| `wuxing-earth.png` | 五行·土（山峦） | `gen/wuxing-earth.webp` | 9 KB |
| `wuxing-metal.png` | 五行·金（晶石） | `gen/wuxing-metal.webp` | 11 KB |
| `wuxing-water.png` | 五行·水（浪花） | `gen/wuxing-water.webp` | 7 KB |
| `scene-contract.png` | 今日宜忌·签约合作 | `gen/scene-contract.webp`（168²） | 9 KB |
| `scene-document.png` | 文书往来 | `gen/scene-document.webp` | 13 KB |
| `scene-exam.png` | 考试答题 | `gen/scene-exam.webp` | 9 KB |
| `scene-defense.png` | 答辩陈述 | `gen/scene-defense.webp` | 11 KB |
| `scene-meeting.png` | 开会沟通 | `gen/scene-meeting.webp` | 9 KB |
| `scene-interview.png` | 面试求职 | `gen/scene-interview.webp` | 10 KB |
| `scene-date.png` | 约会表白 | `gen/scene-date.webp` | 12 KB |
| `scene-travel.png` | 出行安排 | `gen/scene-travel.webp` | 9 KB |
| `scene-shopping.png` | 大额消费 | `gen/scene-shopping.webp` | 6 KB |
| `scene-outfit.png` | 穿衣配色（备用视觉） | `gen/scene-outfit.webp` | 11 KB |
| `gua-taiji.png` | 一日一卦页标题背后的太极八卦盘 | `gen/gua-taiji.webp`（560²） | 99 KB |

生成脚本与提示词写法同上一节；补拍/替换时保持文件名一致即可，页面无需改动。
另有 4 张（interview / date / travel / shopping）是第二批补提交，序号 03163–03166。

## 四、screenshots —— 验收截图

| 文件 | 说明 |
|---|---|
| `desktop-home.png` | 桌面端首页（1440×1050，系统"减少动态效果"下拍摄，即最终静止态） |
| `mobile-home.png` | 手机端首页（390×844 @2x，CDP 设备模拟） |
| `about.png` | 关于页（含四枚生成图标的卡片与页脚标语） |
| `live-pages.png` | **线上站实拍**：https://zhdex.github.io/fortune-site/ |

拍摄方式：Microsoft Edge 无头模式

```powershell
msedge --headless=new --disable-gpu --hide-scrollbars --force-prefers-reduced-motion `
  --window-size=1440,1050 --virtual-time-budget=9000 `
  --screenshot="assets/screenshots/desktop-home.png" http://localhost:4173/
```

> 手机尺寸不能靠 `--window-size`（Edge 有最小窗口宽度，会裁切），
> 要用 CDP 的 `Emulation.setDeviceMetricsOverride` 设 390×844、`deviceScaleFactor: 2`，再 `Page.captureScreenshot`。

---

## 五、重新生成 / 替换素材的注意点

1. **不要直接替换 `generated/` 里的原图**再重新导出，先把旧文件按 `名字_v2.png` 另存，保留版本对比。
2. 导出到 `web/public/images/gen/` 时保持**同名**，页面无需改动。
3. 新增图标时，同步在 `web/src/pages/Home.jsx` 的 `CardKeys` 与 `web/src/i18n/dict.js` 的 `cards.*` 里加对应键，
   并补一个 `web/src/components/Icons.jsx` 的 SVG 兜底。
4. 所有图片都走 `import.meta.env.BASE_URL` 前缀拼接，GitHub Pages 的 `/fortune-site/` 子路径才不会丢图。
