# 前端86个项目练习

> 系统化的前端交互效果练习项目集，涵盖CSS3、JavaScript、响应式设计等核心技术

> 关于前端的一些观点：工具和语言的熟练度不是最核心的，具有竞争力的是在其他领域的思维，比如设计逻辑，或者哲学思想这些，只训练语言，再厉害也只是模仿，脱离了案例就没有了自己，这也许是大多数人学习设计相关的通病，因为解决这个难题并不简单，这需要长久的思考和实践。

## 📁 项目结构

```
frontend-86-projects/
├── projects/              # 所有项目
│   ├── 01-parallax-scrolling/       # 视差滚动效果
│   ├── 02-fullscreen-video/         # 全屏视频背景
│   ├── 03-transform-effects/        # 滚动变换效果
│   ├── 04-responsive-navigation/    # 全屏覆盖响应式导航
│   ├── 05-loading-bar-animation/    # 加载条波浪动画
│   ├── 06-social-media-navigation/  # 社交媒体悬停导航
│   ├── 07-icon-hover-effects/       # 图标悬停效果
│   ├── 08-transparent-text-effects/ # 透明文字效果
│   ├── 09-split-image-hover/        # 悬停分裂图片
│   ├── 10-neon-light-effects/       # 霓虹灯文字效果
│   ├── 11-login-form/               # 登录表单
│   ├── 12-bubble-animation/         # 气泡背景动画
│   ├── 13-3d-model-showcase/        # 3D模型展示页
│   ├── 14-ripple-loader/            # 波纹加载动画
│   ├── 15-constellation-loader/     # 星座连线Loading
│   ├── 16-target-cursor/            # 目标光标效果
│   └── 17-project-showcase/         # 项目展示平台
├── assets/               # 公共资源
├── index.html           # 项目导航页（GitHub Pages首页）
├── 快速开始.md           # 精简操作指南
├── 经验记录.md           # 开发经验记录
└── README.md             # 本文件
```

## 📚 项目列表

| 序号 | 项目名称 | 技术点 | 状态 | 在线查看 |
|------|---------|--------|------|---------|
| 01 | 视差滚动效果 | CSS3 transform, JavaScript | ✅ 已完成 | [查看](projects/01-parallax-scrolling/) |
| 02 | 全屏视频背景 | HTML5 Video, CSS3 | ✅ 已完成 | [查看](projects/02-fullscreen-video/) |
| 03 | 滚动变换效果 | CSS3 Transform, JavaScript | ⏭️ 已跳过 | [查看](projects/03-transform-effects/) |
| 04 | 全屏覆盖响应式导航 | CSS3, JavaScript, 响应式设计 | ⏭️ 已跳过 | [查看](projects/04-responsive-navigation/) |
| 05 | 加载条波浪动画 | CSS Animation, Flexbox | ✅ 已完成 | [查看](projects/05-loading-bar-animation/) |
| 06 | 社交媒体悬停导航 | CSS Pseudo-elements, Transform, Font Awesome | ✅ 已完成 | [查看](projects/06-social-media-navigation/) |
| 07 | 图标悬停效果 | CSS Transform, Pseudo-elements, Font Awesome | ✅ 已完成 | [查看](projects/07-icon-hover-effects/) |
| 08 | 透明文字效果 | CSS mix-blend-mode, text-shadow | ✅ 已完成 | [查看](projects/08-transparent-text-effects/) |
| 09 | 悬停分裂图片 | CSS Transform, 3D Rotation | ⚠️ 略有瑕疵 | [查看](projects/09-split-image-hover/) |
| 10 | 霓虹灯文字效果 | CSS text-shadow, filter, blur | ✅ 已完成 | [查看](projects/10-neon-light-effects/) |
| 11 | 登录表单 | CSS Float, Box-shadow, Form Styling | ⚠️ 不太完善 | [查看](projects/11-login-form/) |
| 12 | 气泡背景动画 | CSS Animation, Keyframes, Transform | ✅ 已完成 | [查看](projects/12-bubble-animation/) |
| 13 | 3D模型展示页 | Sketchfab iframe, Responsive Layout, Page Transition | ✅ 已完成 | [查看](projects/13-3d-model-showcase/) |
| 14 | 波纹加载动画 | CSS Animation, SVG, Variables, Glassmorphism | ✅ 已完成 | [查看](projects/14-ripple-loader/) |
| 15 | 星座连线Loading | Canvas 2D, JavaScript, State Machine | ✅ 已完成 | [查看](projects/15-constellation-loader/) |
| 16 | 目标光标效果 | GSAP, JavaScript, React to JS | ✅ 已完成 | [查看](projects/16-target-cursor/) |
| 17 | 项目展示平台 | CSS Grid, Flexbox, JavaScript, FLIP Animation | ✅ 已完成 | [查看](projects/17-project-showcase/) |

## 🌐 在线演示

**项目导航页**: [查看所有项目](https://ljh15224052032.github.io/frontend-interaction-lab/)

点击"查阅"按钮可跳转到具体项目页面。

## 🚀 本地开发

### 方式一：直接打开
1. 克隆仓库
   ```bash
   git clone https://github.com/your-username/frontend-86-projects.git
   cd frontend-86-projects
   ```
2. 直接在浏览器中打开 `index.html` 或具体项目的 `index.html`

### 方式二：使用 Live Server（推荐）
1. 安装 VS Code 扩展 `Live Server`
2. 右键点击 `index0.html` → `Open with Live Server`
3. 享受热更新功能

### 添加新项目
```bash
# 1. 在 projects/ 下创建新项目文件夹
mkdir projects/14-project-name
cd projects/14-project-name

# 2. 创建项目文件
touch index.html style.css script.js

# 3. 开发完成后提交代码
git add .
git commit -m "完成项目14：项目名称"
git push
```

## 📖 学习资源

- **快速开始**: 查看 [快速开始.md](快速开始.md)
- **经验记录**: 查看 [经验记录.md](经验记录.md)
- **在线演示**: GitHub Pages 托管

## 🔧 技术栈

- **HTML5**: 语义化标签、表单、多媒体
- **CSS3**: 动画、变换、过渡、混合模式、Flexbox、Grid
- **JavaScript**: DOM操作、事件监听、ES6+语法
- **响应式设计**: 媒体查询、移动端适配

## 📝 开发进度

- **总项目数**: 86
- **已完成**: 15
- **已跳过**: 2
- **开发中**: 0
- **完成率**: 17.4%

## 🏷️ 版本历史

- **v0.4** (2026-04-04) - 完成项目17（项目展示平台），实现网格视图和时间线视图，支持动态列数调整、分类筛选、搜索过滤等功能
- **v0.3** (2026-04-04) - 完成项目16（目标光标效果），React组件成功转换为纯JavaScript
- **v0.2** (2026-04-04) - 完成项目14（波纹加载动画）、项目15（星座连线Loading），更新项目13为完成状态
- **v0.1** (2026-04-03) - 完成前13个项目，搭建基础框架

## 📄 许可证

MIT License - 自由使用和修改

## 👨‍💻 作者

[Ljh15224052032](https://github.com/Ljh15224052032)

---

💡 **提示**: 本项目持续更新中，欢迎关注！
