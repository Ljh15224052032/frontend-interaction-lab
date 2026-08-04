# 无限图片墙视觉调整实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将图片统一为 3:4 居中裁切卡片，移除露出的装饰底板，并把纯色背景改为稀疏低对比度点阵。

**Architecture:** 保留现有 HTML 结构和 GSAP 拖拽逻辑，仅修改 `无限滑动.html` 内嵌 CSS。卡片的实际尺寸仍由 `.photos_line` 与 `.photos_line_photo` 提供，JavaScript 继续从 DOM 读取宽高，因此无限循环边界计算无需变更。

**Tech Stack:** HTML5、CSS3、原生 JavaScript、GSAP、本地 Node.js 静态断言

---

### Task 1: 固定卡片比例并让图片铺满裁切

**Files:**
- Modify: `无限滑动.html:38-62`

- [ ] **Step 1: 运行修改前的静态断言，确认当前样式不满足要求**

在项目目录运行：

```powershell
@'
const fs = require('fs');
const html = fs.readFileSync('无限滑动.html', 'utf8');
const checks = [
  ['3:4 row height', /\.photos_line\s*\{[^}]*height:\s*312em/s],
  ['full image width', /\.photos_line_photo img\s*\{[^}]*width:\s*100%/s],
  ['cover crop', /\.photos_line_photo img\s*\{[^}]*object-fit:\s*cover/s],
  ['transparent card backing', /\.photos_line_photo\s*\{[^}]*background-color:\s*transparent/s],
];
const failed = checks.filter(([, pattern]) => !pattern.test(html)).map(([name]) => name);
if (failed.length) {
  console.error(`FAIL: ${failed.join(', ')}`);
  process.exit(1);
}
console.log('PASS: image card styles');
'@ | node -
```

Expected: 命令退出码为 `1`，输出包含 `FAIL`，因为当前行高为 `342em`、图片没有 `width: 100%` 和 `object-fit: cover`，并且容器仍有紫色底色。

- [ ] **Step 2: 实现最小 CSS 修改**

在 `无限滑动.html` 中把相关规则调整为：

```css
.photos_line {
  font-size: 1px;
  height: 312em;
  margin-bottom: 48em;
  flex-shrink: 0;
}

.photos_line_photo {
  font-size: 1px;
  width: 234em;
  height: 100%;
  margin-right: 36em;
  border-radius: 12em;
  background-color: transparent;
  overflow: hidden;
  flex-shrink: 0;
}

.photos_line_photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: 0.3s ease;
}
```

`234 × 312` 恰好是 `3:4`。透明容器移除独立底板，`cover` 保证所有图片铺满且不变形。

- [ ] **Step 3: 重跑静态断言，确认图片规则通过**

重复 Step 1 的 PowerShell 命令。

Expected: 输出 `PASS: image card styles`，退出码为 `0`。

- [ ] **Step 4: 检查本任务差异**

Run:

```powershell
git diff --check -- '无限滑动.html'
git diff -- '无限滑动.html'
```

Expected: `git diff --check` 无输出；差异只包含卡片行高、透明底色、圆角和图片填充规则。

### Task 2: 添加稀疏点阵背景

**Files:**
- Modify: `无限滑动.html:24-34`

- [ ] **Step 1: 运行修改前的点阵断言，确认当前背景不满足要求**

```powershell
@'
const fs = require('fs');
const html = fs.readFileSync('无限滑动.html', 'utf8');
const body = html.match(/body\s*\{([\s\S]*?)\}/)?.[1] ?? '';
const checks = [
  ['dot gradient', /background-image:\s*radial-gradient\(/.test(body)],
  ['26px spacing', /background-size:\s*26px\s+26px/.test(body)],
  ['charcoal base', /background-color:\s*#171717/.test(body)],
];
const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
if (failed.length) {
  console.error(`FAIL: ${failed.join(', ')}`);
  process.exit(1);
}
console.log('PASS: dotted background');
'@ | node -
```

Expected: 命令退出码为 `1`，输出 `FAIL: dot gradient, 26px spacing`。

- [ ] **Step 2: 为 body 添加低对比度点阵**

保留现有布局属性，将背景相关声明写为：

```css
background-color: #171717;
background-image: radial-gradient(
  circle,
  rgba(255, 255, 255, 0.14) 1px,
  transparent 1px
);
background-size: 26px 26px;
```

底色延续现有炭黑，点径为 `1px`、间距为 `26px`，透明度 `0.14` 保证纹理可见但不抢图片焦点。

- [ ] **Step 3: 重跑点阵断言，确认背景规则通过**

重复 Task 2 Step 1 的 PowerShell 命令。

Expected: 输出 `PASS: dotted background`，退出码为 `0`。

- [ ] **Step 4: 执行完整静态回归检查**

依次运行 Task 1 Step 1 和 Task 2 Step 1 的两段 Node 断言。

Expected: 两段命令均输出 `PASS` 并以退出码 `0` 结束。

### Task 3: 浏览器视觉与交互回归验证

**Files:**
- Verify: `无限滑动.html`

- [ ] **Step 1: 在浏览器打开页面并检查桌面布局**

打开 `无限滑动.html`，使用约 `1440 × 900` 的视口。

Expected:

- 所有卡片视觉比例一致为 `3:4`。
- 图片铺满卡片，不出现紫色底部或侧边色块。
- 点阵均匀、稀疏且明显弱于图片内容。
- 图片无拉伸变形。

- [ ] **Step 2: 验证拖拽和无限循环**

按住图片墙分别向左、右、上、下拖动，至少让最外侧图片跨越一次视口对应边界。

Expected: 图片从相反方向连续回到图片墙中；没有永久空洞、卡死或控制台异常。

- [ ] **Step 3: 验证悬停裁切**

将鼠标停留在任意三张图片上。

Expected: 图片平滑放大，放大内容仍被 3:4 卡片和轻微圆角裁切，卡片外不出现溢出。

- [ ] **Step 4: 验证响应式视口**

分别检查约 `900 × 900` 和 `390 × 844` 的视口。

Expected: 现有媒体查询继续放大图片墙，所有卡片仍保持 `3:4`，页面没有新增滚动条或明显布局断裂。

- [ ] **Step 5: 最终差异与工作区检查**

```powershell
git diff --check -- '无限滑动.html'
git diff --stat -- '无限滑动.html'
git status --short
```

Expected: `git diff --check` 无输出；页面文件只包含本计划样式变更；工作区中原有的其他用户改动保持不变。
