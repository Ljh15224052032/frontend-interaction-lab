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
