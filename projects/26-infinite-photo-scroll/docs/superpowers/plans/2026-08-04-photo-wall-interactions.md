# 无限图片墙交互增强实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 增大图片间距，加入以鼠标位置为中心的滚轮缩放，并支持不会与拖拽冲突的完整大图预览。

**Architecture:** 保留现有单文件页面和逐卡片无限循环算法，在 `photobox` 中分离基础响应式缩放与用户缩放，并用场景位移补偿保持鼠标锚点稳定。大图预览使用独立遮罩 DOM；点击/拖拽由移动阈值区分。

**Tech Stack:** HTML5、CSS3、原生 JavaScript、GSAP、Node.js `assert`

---

### Task 1: 建立交互契约测试

**Files:**
- Create: `tests/photo-wall-interactions.test.cjs`
- Verify: `无限滑动.html`

- [ ] **Step 1: 创建失败测试**

测试读取项目内唯一 HTML 文件，断言 `56em` 横向间距、`68em` 纵向间距、缩放上下限、`6px` 阈值、非被动滚轮监听、预览遮罩和完整大图样式存在；随后在隔离 VM 中加载 `photobox`，验证两倍缩放时鼠标锚点的位移补偿。

```js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");
const htmlFile = fs.readdirSync(projectRoot).find((name) => name.endsWith(".html"));
assert.ok(htmlFile, "HTML entry file must exist");
const html = fs.readFileSync(path.join(projectRoot, htmlFile), "utf8");

assert.match(html, /\.photos_line\s*\{[^}]*margin-bottom:\s*68em/s);
assert.match(html, /\.photos_line_photo\s*\{[^}]*margin-right:\s*56em/s);
assert.match(html, /min_zoom:\s*0\.55/);
assert.match(html, /max_zoom:\s*2\.2/);
assert.match(html, /drag_threshold:\s*6/);
assert.match(html, /addEventListener\("wheel",[\s\S]*?passive:\s*false/);
assert.match(html, /class="lightbox"/);
assert.match(html, /\.lightbox_image\s*\{[^}]*object-fit:\s*contain/s);

const inlineScript = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .find((code) => code.includes("const photobox"));
assert.ok(inlineScript, "photobox script must exist");

const testableScript = inlineScript.replace(
  /photobox\.init\(\);\s*$/,
  "globalThis.__photobox = photobox;"
);
const context = {
  document: { querySelector: () => ({}) },
  window: { innerWidth: 1440, innerHeight: 900 },
  gsap: {},
};
vm.runInNewContext(testableScript, context);
const box = context.__photobox;

assert.equal(box.clampZoom(0.1), 0.55);
assert.equal(box.clampZoom(5), 2.2);
box.zoom_scale = 1;
box.scene_x = 0;
box.scene_y = 0;
box.calculateZoom(900, 500, 2);
assert.equal(box.zoom_scale, 2);
assert.equal(box.scene_x, -180);
assert.equal(box.scene_y, -50);

console.log("PASS: photo wall interaction contract");
```

- [ ] **Step 2: 运行测试并确认失败原因正确**

```powershell
node tests/photo-wall-interactions.test.cjs
```

Expected: `FAIL`，首个缺失契约为纵向 `68em` 间距；测试文件本身可正常执行。

### Task 2: 增大间距并加入大图遮罩

**Files:**
- Modify: `无限滑动.html:40-90`
- Modify: `无限滑动.html:92-180`

- [ ] **Step 1: 修改卡片间距**

将 `.photos_line` 的 `margin-bottom` 改为 `68em`，将 `.photos_line_photo` 的 `margin-right` 改为 `56em`。

```css
.photos_line { margin-bottom: 68em; }
.photos_line_photo { margin-right: 56em; }
```

- [ ] **Step 2: 添加大图遮罩样式**

新增 `.lightbox`、`.lightbox.is-open`、`.lightbox_image` 和 `.lightbox_close`，遮罩固定覆盖视口、默认不可见；大图使用 `max-width`、`max-height` 与 `object-fit: contain`，关闭按钮保持可聚焦。

```css
.lightbox { position: fixed; inset: 0; visibility: hidden; opacity: 0; pointer-events: none; }
.lightbox.is-open { visibility: visible; opacity: 1; pointer-events: auto; }
.lightbox_image { max-width: min(90vw, 1200px); max-height: 86vh; object-fit: contain; }
```

- [ ] **Step 3: 添加语义化遮罩 DOM**

在 `.photos` 后加入 `role="dialog"`、`aria-modal="true"`、`aria-hidden="true"` 的 `.lightbox`，内部包含关闭按钮和空 `src` 的预览图片。

```html
<div class="lightbox" role="dialog" aria-modal="true" aria-hidden="true" aria-label="图片预览">
  <button class="lightbox_close" type="button" aria-label="关闭大图">×</button>
  <img class="lightbox_image" alt="" />
</div>
```

- [ ] **Step 4: 运行测试确认样式与 DOM 契约已通过、脚本契约仍失败**

```powershell
node tests/photo-wall-interactions.test.cjs
```

Expected: 间距和预览相关断言通过，失败推进到缺失的缩放字段或滚轮处理。

### Task 3: 实现鼠标锚点缩放和点击/拖拽判定

**Files:**
- Modify: `无限滑动.html:190-290`
- Test: `tests/photo-wall-interactions.test.cjs`

- [ ] **Step 1: 扩展 `photobox` 状态**

加入 `base_scale`、`zoom_scale`、`min_zoom: 0.55`、`max_zoom: 2.2`、`scene_x`、`scene_y`、`drag_threshold: 6`、按下坐标、拖拽标志和遮罩引用。

```js
base_scale: 1,
zoom_scale: 1,
min_zoom: 0.55,
max_zoom: 2.2,
scene_x: 0,
scene_y: 0,
drag_threshold: 6,
```

- [ ] **Step 2: 添加纯缩放计算与场景渲染方法**

实现 `clampZoom(value)`、`calculateZoom(clientX, clientY, nextZoom)` 和 `renderScene(duration)`。`calculateZoom` 根据新旧缩放比例更新 `scene_x/scene_y`，使鼠标下的内容保持视觉原位；`renderScene` 统一输出 GSAP 平移与有效缩放。

```js
clampZoom(value) {
  return Math.min(this.max_zoom, Math.max(this.min_zoom, value));
},
calculateZoom(clientX, clientY, nextZoom) {
  const clamped = this.clampZoom(nextZoom);
  const ratio = clamped / this.zoom_scale;
  const centerX = window.innerWidth / 2 + this.scene_x;
  const centerY = window.innerHeight / 2 + this.scene_y;
  this.scene_x += (1 - ratio) * (clientX - centerX);
  this.scene_y += (1 - ratio) * (clientY - centerY);
  this.zoom_scale = clamped;
},
renderScene(duration = 0) {
  this.scale_nums = this.base_scale * this.zoom_scale;
  gsap.to(this.container, {
    x: this.scene_x,
    y: this.scene_y,
    scale: this.scale_nums,
    transformOrigin: "center center",
    duration,
    ease: "power3.out",
    overwrite: true,
  });
},
```

- [ ] **Step 3: 接入非被动滚轮事件**

监听 `window` 的 `wheel`，使用 `{ passive: false }`，在遮罩关闭时阻止默认滚动并通过指数增量更新用户缩放；达到上下限时不再引入位移。

- [ ] **Step 4: 重写鼠标事件参数和阈值判定**

所有监听器显式接收 `event`；按下时记录起点与卡片，移动超过 `6px` 标记为拖拽，松开时只有未拖拽的同一卡片会打开大图。移动距离继续除以 `base_scale * zoom_scale`。

- [ ] **Step 5: 实现大图打开与关闭**

实现 `openLightbox(photo)` 和 `closeLightbox()`；打开时设置图片 `src/alt`、状态类和 ARIA，关闭支持遮罩空白、关闭按钮和 `Escape`。遮罩打开期间滚轮与拖拽处理立即返回。

- [ ] **Step 6: 更新窗口缩放流程**

`resize()` 只更新 `base_scale` 并调用统一场景渲染，保留 `zoom_scale`；继续重建卡片循环数据。

- [ ] **Step 7: 运行完整测试并确认通过**

```powershell
node tests/photo-wall-interactions.test.cjs
```

Expected: 输出 `PASS: photo wall interaction contract`。

### Task 4: 回归验证

**Files:**
- Verify: `无限滑动.html`
- Verify: `tests/photo-wall-interactions.test.cjs`

- [ ] **Step 1: 检查资源和脚本语法**

使用 Node 读取 HTML，确认 28 个图片路径存在，并将内联脚本交给 `new Function()` 解析。

- [ ] **Step 2: 检查差异质量**

```powershell
git diff --check -- '无限滑动.html' 'tests/photo-wall-interactions.test.cjs'
git diff --stat -- '无限滑动.html' 'tests/photo-wall-interactions.test.cjs'
```

Expected: 无空白错误；差异只涉及本次交互功能和测试。

- [ ] **Step 3: 浏览器交互验证**

在桌面视口验证：滚轮围绕鼠标缩放且受上下限约束；任意缩放下四向拖拽和无限循环正常；点击打开完整大图，明显拖拽不打开；遮罩空白、关闭按钮和 `Esc` 均可关闭；大图打开时背景不响应。

- [ ] **Step 4: 响应式验证**

在约 `900 × 900` 与 `390 × 844` 视口检查间距、缩放保留和大图安全边距，确认无新增页面滚动条。
