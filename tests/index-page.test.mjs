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
    assert.match(css, /--archive-grid:\s*4\.5rem\s+minmax/);
    assert.match(css, /grid-template-columns:\s*var\(--archive-grid\)/);
});

test('headline and archive typography keep readable spacing and scale', () => {
    assert.match(css, /\.hero h1\s*\{[^}]*line-height:\s*0\.94/s);
    assert.match(css, /--archive-tab-size:\s*0\.78rem/);
    assert.match(css, /--archive-label-size:\s*0\.66rem/);
    assert.match(css, /--archive-number-size:\s*0\.78rem/);
    assert.match(css, /--archive-detail-size:\s*0\.69rem/);
    assert.match(css, /--archive-status-size:\s*0\.64rem/);
});

test('script keeps behavior in focused initializers', () => {
    for (const name of ['initArchive', 'initStarfield', 'initScrollScene', 'initReveals', 'initCursor']) {
        assert.match(js, new RegExp(`function\\s+${name}\\s*\\(`));
    }
    assert.match(js, /requestAnimationFrame/);
    assert.match(js, /IntersectionObserver/);
    assert.match(js, /prefers-reduced-motion/);
    assert.match(js, /const\s+perPage\s*=\s*10/);
    assert.match(js, /scrollIntoView/);
    assert.match(js, /devicePixelRatio/);
    assert.match(js, /visibilitychange/);
    assert.match(js, /matchMedia\(['"]\(pointer:\s*coarse\)/);
});
