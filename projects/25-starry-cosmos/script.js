// ==============================
// 项目25：星空宇宙背景
// Starry Cosmos Background
// ==============================

const canvas = document.getElementById('cosmos');
const ctx = canvas.getContext('2d');
const label = document.getElementById('effectLabel');

let W, H;
let currentEffect = null;
let mouseX = -9999, mouseY = -9999;

// ========== 工具函数 ==========
function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function dist(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }
function lerp(a, b, t) { return a + (b - a) * t; }

// ========== 效果1：深空星尘 ==========
class StarDust {
    constructor() { this.stars = []; }
    init() {
        this.stars = [];
        for (let i = 0; i < 900; i++) {
            const layer = randInt(0, 2); // 0远 1中 2近
            this.stars.push({
                x: rand(0, W), y: rand(0, H),
                r: layer === 0 ? rand(0.3, 0.8) : layer === 1 ? rand(0.8, 1.6) : rand(1.6, 2.8),
                baseAlpha: rand(0.3, 1),
                twinkleSpeed: rand(0.005, 0.03),
                twinkleOffset: rand(0, Math.PI * 2),
                driftX: (layer + 1) * rand(0.005, 0.02),
                driftY: (layer + 1) * rand(0.005, 0.015),
                layer,
            });
        }
    }
    update(t) {
        for (const s of this.stars) {
            s.x += s.driftX;
            s.y += s.driftY;
            if (s.x > W + 5) s.x = -5;
            if (s.y > H + 5) s.y = -5;
            s.alpha = s.baseAlpha * (0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset));
        }
    }
    draw(t) {
        // 深蓝黑径向渐变背景
        const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
        bg.addColorStop(0, '#0a0a2e');
        bg.addColorStop(0.5, '#050520');
        bg.addColorStop(1, '#010108');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        for (const s of this.stars) {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(220, 230, 255, ${s.alpha})`;
            ctx.fill();
            // 近层星加光晕
            if (s.layer === 2 && s.alpha > 0.5) {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(180, 200, 255, ${s.alpha * 0.12})`;
                ctx.fill();
            }
        }
    }
    destroy() { this.stars = []; }
}

// ========== 效果2：流星雨夜 ==========
class MeteorShower {
    constructor() { this.bgStars = []; this.meteors = []; this.nextMeteor = 0; }
    init() {
        this.bgStars = [];
        this.meteors = [];
        this.nextMeteor = 0;
        for (let i = 0; i < 350; i++) {
            this.bgStars.push({
                x: rand(0, W), y: rand(0, H),
                r: rand(0.3, 1.5),
                alpha: rand(0.2, 0.8),
                twinkle: rand(0.008, 0.025),
                offset: rand(0, Math.PI * 2),
            });
        }
    }
    update(t) {
        // 生成流星
        if (t > this.nextMeteor) {
            const isFireball = Math.random() < 0.08;
            const angle = rand(0.6, 1.0); // 弧度
            const speed = isFireball ? rand(12, 18) : rand(6, 12);
            this.meteors.push({
                x: rand(-100, W * 1.2), y: rand(-100, -10),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                length: isFireball ? rand(120, 200) : rand(50, 100),
                width: isFireball ? rand(2.5, 4) : rand(0.8, 2),
                alpha: isFireball ? 1 : rand(0.5, 0.9),
                life: 1,
                decay: rand(0.005, 0.015),
            });
            this.nextMeteor = t + (isFireball ? rand(3000, 8000) : rand(500, 2000));
        }
        // 更新流星
        for (let i = this.meteors.length - 1; i >= 0; i--) {
            const m = this.meteors[i];
            m.x += m.vx;
            m.y += m.vy;
            m.life -= m.decay;
            if (m.life <= 0 || m.x > W + 200 || m.y > H + 200) {
                this.meteors.splice(i, 1);
            }
        }
    }
    draw(t) {
        ctx.fillStyle = '#050518';
        ctx.fillRect(0, 0, W, H);

        // 背景星
        for (const s of this.bgStars) {
            const a = s.alpha * (0.6 + 0.4 * Math.sin(t * s.twinkle + s.offset));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 210, 240, ${a})`;
            ctx.fill();
        }

        // 流星
        for (const m of this.meteors) {
            const tailX = m.x - m.vx / Math.hypot(m.vx, m.vy) * m.length * m.life;
            const tailY = m.y - m.vy / Math.hypot(m.vx, m.vy) * m.length * m.life;
            const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
            grad.addColorStop(0, `rgba(255, 255, 255, ${m.alpha * m.life})`);
            grad.addColorStop(0.3, `rgba(200, 220, 255, ${m.alpha * m.life * 0.6})`);
            grad.addColorStop(1, `rgba(100, 150, 255, 0)`);
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(tailX, tailY);
            ctx.strokeStyle = grad;
            ctx.lineWidth = m.width;
            ctx.lineCap = 'round';
            ctx.stroke();
            // 头部光点
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.width * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${m.alpha * m.life * 0.8})`;
            ctx.fill();
        }
    }
    destroy() { this.bgStars = []; this.meteors = []; }
}

// ========== 效果3：星云漩涡 ==========
class NebulaVortex {
    constructor() { this.particles = []; }
    init() {
        this.particles = [];
        const arms = 3;
        for (let i = 0; i < 2500; i++) {
            const arm = i % arms;
            const baseAngle = (arm / arms) * Math.PI * 2;
            const distFromCenter = rand(20, Math.min(W, H) * 0.42);
            const spiralAngle = baseAngle + distFromCenter * 0.008 + rand(-0.3, 0.3);
            const r = distFromCenter + rand(-15, 15);
            this.particles.push({
                angle: spiralAngle,
                r: Math.max(5, r),
                speed: 0.0003 + (200 / (distFromCenter + 50)) * 0.0004,
                size: rand(0.5, 2.5),
                brightness: rand(0.3, 1),
            });
        }
    }
    update(t) {
        for (const p of this.particles) {
            p.angle += p.speed;
        }
    }
    draw(t) {
        ctx.fillStyle = '#030014';
        ctx.fillRect(0, 0, W, H);

        const cx = W / 2, cy = H / 2;

        // 中心光晕
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
        glow.addColorStop(0, 'rgba(255, 240, 200, 0.15)');
        glow.addColorStop(0.3, 'rgba(180, 140, 255, 0.06)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);

        const maxDist = Math.min(W, H) * 0.42;
        for (const p of this.particles) {
            const x = cx + Math.cos(p.angle) * p.r;
            const y = cy + Math.sin(p.angle) * p.r;
            const d = p.r / maxDist;

            let r, g, b;
            if (d < 0.2) {
                r = lerp(255, 200, d / 0.2);
                g = lerp(240, 160, d / 0.2);
                b = lerp(200, 255, d / 0.2);
            } else if (d < 0.5) {
                const t = (d - 0.2) / 0.3;
                r = lerp(200, 160, t);
                g = lerp(160, 80, t);
                b = lerp(255, 220, t);
            } else {
                const t = (d - 0.5) / 0.5;
                r = lerp(160, 100, t);
                g = lerp(80, 40, t);
                b = lerp(220, 140, t);
            }

            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r|0}, ${g|0}, ${b|0}, ${p.brightness * (1 - d * 0.5)})`;
            ctx.fill();
        }
    }
    destroy() { this.particles = []; }
}

// ========== 效果4：星座连线 ==========
class Constellation {
    constructor() { this.stars = []; }
    init() {
        this.stars = [];
        for (let i = 0; i < 180; i++) {
            this.stars.push({
                x: rand(0, W), y: rand(0, H),
                vx: rand(-0.15, 0.15), vy: rand(-0.15, 0.15),
                r: rand(1, 2.5),
                baseAlpha: rand(0.4, 0.9),
            });
        }
    }
    update(t) {
        for (const s of this.stars) {
            // 鼠标吸引
            const d = dist(s.x, s.y, mouseX, mouseY);
            if (d < 150 && d > 1) {
                s.x += (mouseX - s.x) * 0.003;
                s.y += (mouseY - s.y) * 0.003;
            }
            s.x += s.vx;
            s.y += s.vy;
            if (s.x < 0 || s.x > W) s.vx *= -1;
            if (s.y < 0 || s.y > H) s.vy *= -1;
            s.x = Math.max(0, Math.min(W, s.x));
            s.y = Math.max(0, Math.min(H, s.y));
        }
    }
    draw(t) {
        ctx.fillStyle = '#060612';
        ctx.fillRect(0, 0, W, H);

        const LINK_DIST = 120;
        // 连线
        for (let i = 0; i < this.stars.length; i++) {
            for (let j = i + 1; j < this.stars.length; j++) {
                const d = dist(this.stars[i].x, this.stars[i].y, this.stars[j].x, this.stars[j].y);
                if (d < LINK_DIST) {
                    const alpha = (1 - d / LINK_DIST) * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(this.stars[i].x, this.stars[i].y);
                    ctx.lineTo(this.stars[j].x, this.stars[j].y);
                    ctx.strokeStyle = `rgba(140, 180, 255, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        // 星点
        for (const s of this.stars) {
            // 光晕
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(160, 200, 255, ${s.baseAlpha * 0.08})`;
            ctx.fill();
            // 星点
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 220, 255, ${s.baseAlpha})`;
            ctx.fill();
        }
    }
    destroy() { this.stars = []; }
}

// ========== 效果5：虫洞穿越 ==========
class WarpDrive {
    constructor() { this.stars = []; this.nextSpawn = 0; }
    init() {
        this.stars = [];
        this.nextSpawn = 0;
    }
    update(t) {
        const cx = W / 2, cy = H / 2;
        // 生成新星星
        if (t > this.nextSpawn) {
            const angle = rand(0, Math.PI * 2);
            this.stars.push({
                x: cx, y: cy,
                angle,
                speed: rand(0.3, 1),
                dist: 0,
                maxAlpha: rand(0.4, 1),
                prevX: cx, prevY: cy,
            });
            this.nextSpawn = t + rand(8, 25);
        }
        // 更新
        const maxDist = Math.hypot(W, H) * 0.6;
        for (let i = this.stars.length - 1; i >= 0; i--) {
            const s = this.stars[i];
            s.prevX = s.x;
            s.prevY = s.y;
            s.dist += s.speed * (1 + s.dist * 0.005); // 加速
            s.x = cx + Math.cos(s.angle) * s.dist;
            s.y = cy + Math.sin(s.angle) * s.dist;
            if (s.dist > maxDist) {
                this.stars.splice(i, 1);
            }
        }
    }
    draw(t) {
        ctx.fillStyle = '#000008';
        ctx.fillRect(0, 0, W, H);

        const cx = W / 2, cy = H / 2;
        const maxDist = Math.hypot(W, H) * 0.6;

        // 中心光晕
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
        glow.addColorStop(0, 'rgba(200, 220, 255, 0.2)');
        glow.addColorStop(0.5, 'rgba(100, 140, 255, 0.05)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(cx - 80, cy - 80, 160, 160);

        for (const s of this.stars) {
            const progress = s.dist / maxDist;
            const alpha = s.maxAlpha * Math.min(1, progress * 3) * (1 - progress);

            // 近中心是点，远距离变线
            if (s.dist < 30) {
                ctx.beginPath();
                ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(220, 230, 255, ${alpha})`;
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.moveTo(s.prevX, s.prevY);
                ctx.lineTo(s.x, s.y);
                ctx.strokeStyle = `rgba(200, 220, 255, ${alpha})`;
                ctx.lineWidth = Math.min(2, 0.5 + progress * 2);
                ctx.stroke();
            }
        }
    }
    destroy() { this.stars = []; }
}

// ========== 主控制器 ==========
const effects = {
    stardust: { cls: StarDust, label: '深空星尘' },
    meteor: { cls: MeteorShower, label: '流星雨夜' },
    nebula: { cls: NebulaVortex, label: '星云漩涡' },
    constellation: { cls: Constellation, label: '星座连线' },
    warp: { cls: WarpDrive, label: '虫洞穿越' },
};

function switchEffect(name) {
    if (currentEffect) currentEffect.destroy();
    const def = effects[name];
    currentEffect = new def.cls();
    currentEffect.init();
    label.textContent = def.label;

    document.querySelectorAll('.effect-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.effect === name);
    });
}

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    if (currentEffect) {
        currentEffect.destroy();
        currentEffect.init();
    }
}

let startTime = 0;
function animate(now) {
    if (!startTime) startTime = now;
    const t = now - startTime;
    currentEffect.update(t);
    currentEffect.draw(t);
    requestAnimationFrame(animate);
}

// ========== 事件绑定 ==========
window.addEventListener('resize', resize);
window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
window.addEventListener('touchmove', e => {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
});

document.querySelectorAll('.effect-btn').forEach(btn => {
    btn.addEventListener('click', () => switchEffect(btn.dataset.effect));
});

// ========== 启动 ==========
resize();
switchEffect('stardust');
requestAnimationFrame(animate);
