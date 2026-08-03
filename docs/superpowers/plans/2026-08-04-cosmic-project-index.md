# Cosmic Project Index Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the root project index as a polished “deep-space archive” with an atmospheric hero, scroll-responsive cosmic scenery, accessible filtering, pagination, and resilient fallbacks.

**Architecture:** Keep the zero-build HTML/CSS/JavaScript structure. Make project entries semantic links in `index.html`, keep presentation and responsive states in `style.css`, and organize `script.js` into small initialization functions for archive state, canvas stars, scroll scenes, reveal observers, and the custom cursor. Use progressive enhancement so project links remain usable without JavaScript or GSAP.

**Tech Stack:** Semantic HTML5, CSS custom properties/Grid/animations, Canvas 2D, vanilla JavaScript, IntersectionObserver, requestAnimationFrame, existing GSAP 3 CDN, Node built-in test runner.

---

## File map

- Create `tests/index-page.test.mjs`: static contract tests for required semantic landmarks, 26 project links, progressive-enhancement hooks, reduced-motion CSS, and JavaScript module boundaries.
- Modify `index.html`: semantic deep-space archive markup, fixed atmospheric layers, hero, status rail, filters, project link rows, pagination, empty state, and footer.
- Modify `style.css`: full visual system, responsive archive layout, planet/orbit scene, state styles, motion, accessibility, and fallbacks.
- Modify `script.js`: archive filtering/pagination/statistics, canvas star field, scroll progress/parallax, reveal observer, cursor behavior, and graceful feature detection.

### Task 1: Lock the page contract with failing tests

**Files:**
- Create: `tests/index-page.test.mjs`

- [ ] **Step 1: Add the static contract test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
const js = readFileSync(new URL('../script.js', import.meta.url), 'utf8');

test('index exposes the deep-space archive landmarks', () => {
  assert.match(html, /<canvas[^>]+id="starfield"/);
  assert.match(html, /class="hero"/);
  assert.match(html, /id="projectArchive"/);
  assert.match(html, /id="categoryTabs"/);
  assert.match(html, /id="pagination"/);
  assert.match(html, /id="archiveEmpty"/);
});

test('all 26 project destinations are semantic links', () => {
  const links = [...html.matchAll(/<a\s+[^>]*class="project-entry[^>]*href="projects\//g)];
  assert.equal(links.length, 26);
  assert.match(html, /href="projects\/25-starry-cosmos\/"/);
  assert.match(html, /href="projects\/26-infinite-photo-scroll\/"/);
});

test('filters expose pressed state and CSS supports reduced motion', () => {
  assert.match(html, /aria-pressed="true"/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /--color-signal:/);
  assert.match(css, /\.js\s+\.project-entry/);
});

test('script keeps behavior in focused initializers', () => {
  for (const name of ['initArchive', 'initStarfield', 'initScrollScene', 'initReveals', 'initCursor']) {
    assert.match(js, new RegExp(`function\\s+${name}\\s*\\(`));
  }
  assert.match(js, /requestAnimationFrame/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /prefers-reduced-motion/);
});
```

- [ ] **Step 2: Run the contract test and confirm the old page fails**

Run: `node --test tests/index-page.test.mjs`

Expected: FAIL because `#starfield`, `.project-entry`, the new initializer functions, and reduced-motion styles do not exist yet.

- [ ] **Step 3: Commit only the test contract**

```powershell
git add -- tests/index-page.test.mjs
git commit -m "test: define cosmic index page contract"
```

### Task 2: Rebuild the semantic page structure

**Files:**
- Modify: `index.html`
- Test: `tests/index-page.test.mjs`

- [ ] **Step 1: Replace the document shell and atmospheric layers**

Use this structure at the beginning of `<body>`:

```html
<script>document.documentElement.classList.add('js');</script>
<div class="reading-progress" aria-hidden="true"><span id="readingProgress"></span></div>
<canvas class="starfield" id="starfield" aria-hidden="true"></canvas>
<div class="cosmic-noise" aria-hidden="true"></div>
<div class="signal-cursor" id="cursor" aria-hidden="true"><span></span></div>
<div class="site-shell">
  <header class="hero" id="top">
    <nav class="masthead" aria-label="主导航">
      <a class="brand cursor-target" href="#top" aria-label="返回首页">FL / 86</a>
      <p class="masthead-status"><span class="live-dot"></span>Archive online</p>
      <a class="archive-jump cursor-target" href="#projectArchive">进入档案 <span>↘</span></a>
    </nav>
    <div class="hero-scene" aria-hidden="true">
      <div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>
      <div class="planet" id="heroPlanet"><span class="planet-glow"></span></div>
      <div class="coordinate coordinate-a">RA 22H 41M</div>
      <div class="coordinate coordinate-b">DEC +17° 32′</div>
    </div>
    <div class="hero-copy" id="heroCopy">
      <p class="eyebrow">Frontend expedition · 01—86</p>
      <h1><span>数字宇宙</span><span class="title-indent">探索档案</span></h1>
      <p class="hero-intro">持续记录 86 个前端交互实验。每一次动效、每一种界面，都是驶向未知体验的一次短途航行。</p>
      <a class="scroll-cue cursor-target" href="#projectArchive"><span>Scroll to explore</span><i></i></a>
    </div>
  </header>
```

- [ ] **Step 2: Add the dynamic mission summary**

```html
<section class="mission-summary" aria-label="项目进度">
  <div class="summary-intro"><span class="section-index">LOG / 001</span><p>探索并记录浏览器中可能发生的视觉与交互现象。</p></div>
  <dl class="stats">
    <div><dt>计划任务</dt><dd id="totalProjects">86</dd></div>
    <div><dt>已记录</dt><dd id="completedProjects">0</dd></div>
    <div><dt>完成率</dt><dd id="completionRate">0%</dd></div>
  </dl>
</section>
```

- [ ] **Step 3: Convert every existing project card to a semantic archive link**

Wrap the archive in `<main class="archive" id="projectArchive">`. Keep all existing titles, technologies, status classes, categories, and destinations. Convert each card to this exact shape; source each value directly from the corresponding existing card so no destination or status is invented:

```html
<a class="project-entry cursor-target" href="projects/01-parallax-scrolling/" data-category="visual" data-status="done">
  <span class="project-number">01</span>
  <span class="project-heading"><strong>视差滚动效果</strong><small>Parallax scrolling</small></span>
  <span class="project-tech">CSS3 · JavaScript · 视差滚动</span>
  <span class="project-status status-done">已完成</span>
  <span class="project-arrow" aria-hidden="true">↗</span>
</a>
```

Project 25 must remain `href="projects/25-starry-cosmos/"`, title `星空宇宙背景`, and technology `Canvas · Particle System · Gradient`. Project 26 must remain `href="projects/26-infinite-photo-scroll/"`.

- [ ] **Step 4: Add accessible filters, pagination, empty state, and footer**

```html
<div class="archive-heading">
  <div><p class="eyebrow">Observation records</p><h2>项目档案</h2></div>
  <p>选择观测频段，查看不同类型的交互实验。</p>
</div>
<nav class="category-tabs" id="categoryTabs" aria-label="项目分类">
  <button class="category-tab active cursor-target" data-category="all" aria-pressed="true">全部 <span class="count">26</span></button>
  <button class="category-tab cursor-target" data-category="loading" aria-pressed="false">加载动画 <span class="count">0</span></button>
  <button class="category-tab cursor-target" data-category="navigation" aria-pressed="false">导航效果 <span class="count">0</span></button>
  <button class="category-tab cursor-target" data-category="visual" aria-pressed="false">视觉效果 <span class="count">0</span></button>
  <button class="category-tab cursor-target" data-category="media" aria-pressed="false">媒体组件 <span class="count">0</span></button>
  <button class="category-tab cursor-target" data-category="form" aria-pressed="false">表单组件 <span class="count">0</span></button>
  <button class="category-tab cursor-target" data-category="other" aria-pressed="false">其他 <span class="count">0</span></button>
</nav>
<div class="archive-columns" aria-hidden="true"><span>编号 / 项目</span><span>实验媒介</span><span>状态</span></div>
<div class="projects-list" id="projectsList"></div>
<p class="archive-empty" id="archiveEmpty" hidden>该观测频段暂无记录。</p>
<nav class="pagination" id="pagination" aria-label="项目分页">
  <button class="page-btn cursor-target" id="prevBtn" type="button">← 上一航段</button>
  <p><span id="currentPage">01</span> / <span id="totalPages">02</span></p>
  <button class="page-btn cursor-target" id="nextBtn" type="button">下一航段 →</button>
</nav>
</main>
<footer class="site-footer"><p class="eyebrow">Transmission continues</p><h2>探索仍在继续。</h2><div><span>© <span id="currentYear"></span> Frontend Lab</span><span>Hosted on GitHub Pages · <b id="footerRecorded">26</b> records</span></div></footer>
```

- [ ] **Step 5: Run the contract test**

Run: `node --test tests/index-page.test.mjs`

Expected: project-link and landmark assertions PASS; JavaScript and reduced-motion assertions still FAIL.

- [ ] **Step 6: Commit the semantic markup**

```powershell
git add -- index.html
git commit -m "feat: rebuild index as semantic space archive"
```

### Task 3: Implement the deep-space visual system

**Files:**
- Modify: `style.css`
- Test: `tests/index-page.test.mjs`

- [ ] **Step 1: Add design tokens and global foundations**

At the top of `style.css`, import the selected fonts and define the full token set:

```css
@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500;6..96,600&family=IBM+Plex+Mono:wght@400;500&family=Noto+Serif+SC:wght@400;500;600&display=swap');
:root {
  --color-void:#03060b; --color-deep:#07111e; --color-panel:rgba(8,21,35,.72);
  --color-text:#eaf6ff; --color-muted:#8197aa; --color-signal:#74d7ff;
  --color-line:rgba(133,187,218,.2); --color-warning:#ff9d6c;
  --font-display:'Bodoni Moda','Noto Serif SC',serif;
  --font-body:'Noto Serif SC','Songti SC',serif;
  --font-data:'IBM Plex Mono','Cascadia Mono',monospace;
  --page-gutter:clamp(1.25rem,4vw,4.5rem); --max-width:1440px;
  --ease-out:cubic-bezier(.16,1,.3,1); --duration-fast:220ms; --duration-slow:900ms;
}
*{box-sizing:border-box} html{scroll-behavior:smooth;background:var(--color-void)}
body{margin:0;min-width:320px;background:var(--color-void);color:var(--color-text);font-family:var(--font-body);overflow-x:hidden}
a{color:inherit} button{font:inherit} .site-shell{position:relative;z-index:2;max-width:var(--max-width);margin:auto;padding-inline:var(--page-gutter)}
```

- [ ] **Step 2: Style the fixed canvas, noise, progress line, signal cursor, hero planet, offset orbits, and title hierarchy**

Add the fixed, non-interactive atmospheric layers and hero scene with these concrete foundations, then extend the same selectors for typography spacing:

```css
.starfield,.cosmic-noise{position:fixed;inset:0;width:100%;height:100%;pointer-events:none}.starfield{z-index:0}.cosmic-noise{z-index:1;opacity:.22;background:radial-gradient(circle at 72% 20%,rgba(67,149,204,.14),transparent 33%),linear-gradient(115deg,transparent 45%,rgba(86,196,232,.035) 50%,transparent 56%)}
.reading-progress{position:fixed;z-index:20;inset:0 0 auto;height:2px;background:rgba(255,255,255,.04)}.reading-progress span{display:block;width:100%;height:100%;background:var(--color-signal);transform:scaleX(0);transform-origin:left}
.hero{position:relative;min-height:100svh;border-bottom:1px solid var(--color-line)}.masthead{height:88px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;border-bottom:1px solid var(--color-line);font-family:var(--font-data);font-size:.72rem;text-transform:uppercase;letter-spacing:.14em}.archive-jump{justify-self:end}.hero-copy{position:relative;z-index:3;width:min(720px,70%);padding-top:clamp(9rem,25vh,16rem);padding-bottom:6rem}.hero h1{margin:.8rem 0 1.5rem;font-family:var(--font-display);font-size:clamp(4.5rem,10vw,10rem);font-weight:500;line-height:.76;letter-spacing:-.07em}.hero h1 span{display:block}.title-indent{padding-left:clamp(1.5rem,8vw,8rem)}
.hero-scene{position:absolute;z-index:1;inset:5rem calc(var(--page-gutter)*-1) 0 30%;overflow:hidden}.planet{position:absolute;width:clamp(390px,56vw,850px);aspect-ratio:1;right:-16%;top:9%;border-radius:50%;background:radial-gradient(circle at 32% 27%,#c9f1ff 0,#4d91b5 9%,#183752 31%,#091521 58%,#020408 73%);box-shadow:-45px 25px 110px rgba(70,177,226,.14);will-change:transform}.planet::after{content:'';position:absolute;inset:0;border-radius:inherit;background:repeating-radial-gradient(ellipse at 40% 30%,transparent 0 10px,rgba(255,255,255,.025) 11px 12px);mix-blend-mode:screen}.orbit{position:absolute;right:-2%;top:4%;width:min(72vw,1000px);aspect-ratio:1;border:1px solid rgba(116,215,255,.19);border-radius:50%;will-change:transform}.orbit-two{right:5%;top:13%;width:min(60vw,820px);border-style:dashed}
.signal-cursor{position:fixed;z-index:40;left:0;top:0;width:34px;height:34px;border:1px solid rgba(116,215,255,.78);border-radius:50%;pointer-events:none;transform:translate3d(-100px,-100px,0);transition:width var(--duration-fast),height var(--duration-fast),background var(--duration-fast)}.signal-cursor span{position:absolute;left:50%;top:50%;width:3px;height:3px;border-radius:50%;background:var(--color-signal);transform:translate(-50%,-50%)}.signal-cursor.is-active{width:52px;height:52px;background:rgba(116,215,255,.08)}
```

- [ ] **Step 3: Style the summary, archive rows, scan-line hover, statuses, filters, pagination, and footer**

Use a five-column archive row matching `number / heading / technology / status / arrow`. The hover state must change background/line/arrow position without applying vertical card lift. Add `.project-entry[hidden]{display:none}` and `.js .project-entry{opacity:0;transform:translateY(24px)}` with `.project-entry.is-revealed` restoring the final state.

- [ ] **Step 4: Add tablet, mobile, touch, and reduced-motion rules**

```css
@media (max-width:900px){.hero-scene{opacity:.72}.mission-summary{grid-template-columns:1fr}.project-entry{grid-template-columns:3rem 1fr auto}.project-tech{grid-column:2/4}.archive-columns{display:none}}
@media (max-width:600px){.masthead-status{display:none}.hero{min-height:860px}.planet{right:-48%;width:90vw}.stats{grid-template-columns:repeat(3,1fr)}.project-status{grid-column:2}.project-arrow{grid-column:3;grid-row:1/3}.pagination{gap:1rem}.page-btn{min-height:44px}}
@media (pointer:coarse){.signal-cursor{display:none}}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}.js .project-entry{opacity:1;transform:none}.signal-cursor{display:none}}
```

- [ ] **Step 5: Run contract and CSS syntax checks**

Run: `node --test tests/index-page.test.mjs`

Expected: CSS token and reduced-motion assertions PASS; initializer assertions still FAIL.

Run: `npx --yes stylelint style.css --config '{"rules":{"block-no-empty":true}}'`

Expected: PASS with no empty CSS blocks.

- [ ] **Step 6: Commit the visual system**

```powershell
git add -- style.css
git commit -m "feat: style deep-space archive experience"
```

### Task 4: Implement archive behavior as progressive enhancement

**Files:**
- Modify: `script.js`
- Test: `tests/index-page.test.mjs`

- [ ] **Step 1: Replace duplicated card and pagination handlers with `initArchive`**

Implement `initArchive()` with these stable rules:

```js
function initArchive() {
  const entries = [...document.querySelectorAll('.project-entry')];
  const tabs = [...document.querySelectorAll('.category-tab')];
  const perPage = 10;
  let category = 'all';
  let page = 1;
  const filtered = () => entries.filter(entry => category === 'all' || entry.dataset.category === category);
  const render = ({ returnToArchive = false } = {}) => {
    const matches = filtered();
    const pages = Math.max(1, Math.ceil(matches.length / perPage));
    page = Math.min(page, pages);
    entries.forEach(entry => { entry.hidden = true; entry.classList.remove('is-revealed'); });
    matches.slice((page - 1) * perPage, page * perPage).forEach(entry => { entry.hidden = false; requestAnimationFrame(() => entry.classList.add('is-revealed')); });
    document.querySelector('#currentPage').textContent = String(page).padStart(2, '0');
    document.querySelector('#totalPages').textContent = String(pages).padStart(2, '0');
    document.querySelector('#prevBtn').disabled = page <= 1;
    document.querySelector('#nextBtn').disabled = page >= pages;
    document.querySelector('#archiveEmpty').hidden = matches.length !== 0;
    document.querySelector('#pagination').hidden = matches.length === 0;
    if (returnToArchive) document.querySelector('#projectArchive').scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  };
  tabs.forEach(tab => tab.addEventListener('click', () => {
    category = tab.dataset.category;
    page = 1;
    tabs.forEach(item => { const active = item === tab; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
    render();
  }));
  document.querySelector('#prevBtn').addEventListener('click', () => { if (page > 1) { page -= 1; render({ returnToArchive:true }); } });
  document.querySelector('#nextBtn').addEventListener('click', () => { const pages = Math.max(1, Math.ceil(filtered().length / perPage)); if (page < pages) { page += 1; render({ returnToArchive:true }); } });
  tabs.forEach(tab => { const tabCategory = tab.dataset.category; tab.querySelector('.count').textContent = tabCategory === 'all' ? entries.length : entries.filter(entry => entry.dataset.category === tabCategory).length; });
  const completed = entries.filter(entry => entry.dataset.status === 'done').length;
  document.querySelector('#completedProjects').textContent = completed;
  document.querySelector('#completionRate').textContent = `${Math.round(completed / 86 * 100)}%`;
  document.querySelector('#footerRecorded').textContent = entries.length;
  render();
}
```

- [ ] **Step 2: Calculate all statistics from the DOM**

Inside `initArchive`, set `#completedProjects` from `.status-done`, set `#completionRate` against the fixed target of 86, set `#footerRecorded` to `entries.length`, and update each tab’s `.count` from its category. Keep `#totalProjects` at 86.

- [ ] **Step 3: Run the contract test**

Run: `node --test tests/index-page.test.mjs`

Expected: initializer assertions for the remaining visual modules still FAIL; archive source is present without syntax errors.

- [ ] **Step 4: Commit archive behavior**

```powershell
git add -- script.js
git commit -m "feat: add accessible archive filtering and pagination"
```

### Task 5: Add stars, scroll choreography, reveals, and cursor

**Files:**
- Modify: `script.js`
- Test: `tests/index-page.test.mjs`

- [ ] **Step 1: Add global motion preference and `initStarfield`**

```js
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function initStarfield() {
  const canvas = document.querySelector('#starfield');
  const context = canvas?.getContext?.('2d');
  if (!context) return;
  let stars = [], frame = 0, running = !document.hidden && !reducedMotion.matches;
  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.floor(innerWidth * ratio); canvas.height = Math.floor(innerHeight * ratio);
    canvas.style.width = `${innerWidth}px`; canvas.style.height = `${innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    stars = Array.from({ length: Math.min(180, Math.floor(innerWidth * innerHeight / 7500)) }, () => ({ x: Math.random()*innerWidth, y: Math.random()*innerHeight, r: Math.random()*1.25+.2, a: Math.random()*.7+.2, d: Math.random()*.16+.03 }));
  };
  const draw = () => { context.clearRect(0,0,innerWidth,innerHeight); for (const star of stars) { star.y += star.d; if (star.y > innerHeight) star.y = 0; context.globalAlpha = star.a; context.fillStyle = '#dff6ff'; context.beginPath(); context.arc(star.x,star.y,star.r,0,Math.PI*2); context.fill(); } if (running) frame = requestAnimationFrame(draw); };
  resize(); draw();
  window.addEventListener('resize', resize, { passive:true });
  document.addEventListener('visibilitychange', () => { running = !document.hidden && !reducedMotion.matches; cancelAnimationFrame(frame); if (running) draw(); });
}
```

- [ ] **Step 2: Add `initScrollScene` using a single animation frame**

Read `scrollY` in a passive listener, schedule only one `requestAnimationFrame`, update `#readingProgress` scale, move `#heroPlanet` more slowly than `#heroCopy`, and rotate `.orbit-one`/`.orbit-two` in opposite directions. Return early for reduced motion.

- [ ] **Step 3: Add `initReveals` with feature detection**

Use one `IntersectionObserver`; the complete fallback and observer body are:

```js
function initReveals() {
  const elements = [...document.querySelectorAll('.project-entry,.mission-summary,.archive-heading,.site-footer')];
  const reveal = element => element.classList.add('is-revealed');
  if (!('IntersectionObserver' in window) || reducedMotion.matches) { elements.forEach(reveal); return; }
  const observer = new IntersectionObserver(records => records.forEach(record => { if (record.isIntersecting) { reveal(record.target); observer.unobserve(record.target); } }), { rootMargin:'0px 0px -8%', threshold:.08 });
  elements.forEach(element => observer.observe(element));
}
```

- [ ] **Step 4: Replace the four-corner cursor with `initCursor`**

Use pointer events to place `#cursor` with `transform: translate3d(...)`; add `.is-active` while hovering `.cursor-target`; do not initialize on coarse pointers or reduced motion. The cursor must have `pointer-events:none` and no effect on link activation.

- [ ] **Step 5: Add resilient initialization**

```js
function initPage() {
  document.querySelector('#currentYear').textContent = new Date().getFullYear();
  initArchive(); initStarfield(); initScrollScene(); initReveals(); initCursor();
  if (window.gsap && !reducedMotion.matches) {
    window.gsap.from('.hero-copy > *', { y: 28, opacity: 0, duration: .9, stagger: .09, ease: 'power3.out', clearProps: 'transform,opacity' });
  }
}
document.addEventListener('DOMContentLoaded', initPage, { once:true });
```

- [ ] **Step 6: Run all automated checks**

Run: `node --check script.js`

Expected: no output and exit code 0.

Run: `node --test tests/index-page.test.mjs`

Expected: 4 tests PASS, 0 FAIL.

- [ ] **Step 7: Commit the visual behavior**

```powershell
git add -- script.js tests/index-page.test.mjs
git commit -m "feat: add cosmic scroll and pointer effects"
```

### Task 6: Browser verification and refinement

**Files:**
- Modify if required: `index.html`, `style.css`, `script.js`
- Test: `tests/index-page.test.mjs`

- [ ] **Step 1: Serve the repository locally**

Run: `python -m http.server 4173`

Expected: server listens on `http://localhost:4173/`.

- [ ] **Step 2: Verify desktop behavior at 1440×900**

Open the root page and confirm: hero fills the first viewport; title and planet do not collide; scroll progress reaches the right edge; filters update counts and pressed state; pagination shows 10/10/6 entries; every visible row is a real link; page has no console errors.

- [ ] **Step 3: Verify responsive behavior at 768×1024 and 390×844**

Confirm: no horizontal overflow; archive technologies wrap beneath headings; touch targets are at least 44px high; planet remains a background element; pagination controls fit; custom cursor is absent under touch emulation.

- [ ] **Step 4: Verify accessibility and fallbacks**

Navigate the entire page with Tab/Shift+Tab, confirm visible focus and logical order, emulate `prefers-reduced-motion: reduce`, block the GSAP CDN, and confirm all project links/filter/pagination functions remain usable without animation errors.

- [ ] **Step 5: Run final checks after any visual fixes**

Run: `node --check script.js; node --test tests/index-page.test.mjs; git diff --check`

Expected: JavaScript syntax PASS, 4 tests PASS, and no whitespace errors.

- [ ] **Step 6: Commit verified refinements**

```powershell
git add -- index.html style.css script.js tests/index-page.test.mjs
git commit -m "fix: polish cosmic index across breakpoints"
```

### Task 7: Final review

**Files:**
- Review: `index.html`, `style.css`, `script.js`, `tests/index-page.test.mjs`

- [ ] **Step 1: Confirm scope preservation**

Run: `git status --short` and `git diff HEAD~5 -- index.html style.css script.js tests/index-page.test.mjs`.

Expected: root index files and the new test contain the intended work; unrelated existing deletions and untracked project directories remain untouched.

- [ ] **Step 2: Confirm project destinations**

Run: `node --test tests/index-page.test.mjs`.

Expected: 26 semantic project links, including the user’s `25-starry-cosmos` and project 26, are reported by passing tests.

- [ ] **Step 3: Record final evidence**

Capture desktop and mobile screenshots and report their paths together with test results and any intentionally preserved dirty-worktree entries.
