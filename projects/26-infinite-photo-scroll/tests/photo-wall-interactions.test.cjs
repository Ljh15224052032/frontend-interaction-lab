const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");
const htmlFile = fs
  .readdirSync(projectRoot)
  .find((name) => name.endsWith(".html"));

assert.ok(htmlFile, "HTML entry file must exist");

const html = fs.readFileSync(path.join(projectRoot, htmlFile), "utf8");

assert.match(html, /\.photos_line\s*\{[^}]*margin-bottom:\s*68em/s);
assert.match(html, /\.photos_line_photo\s*\{[^}]*margin-right:\s*56em/s);
assert.match(html, /min_zoom:\s*0\.55/);
assert.match(html, /max_zoom:\s*2\.2/);
assert.match(html, /drag_threshold:\s*6/);
assert.match(
  html,
  /addEventListener\("wheel",[\s\S]*?passive:\s*false/
);
assert.match(html, /class="lightbox"/);
assert.match(html, /\.lightbox_image\s*\{[^}]*object-fit:\s*contain/s);
assert.match(html, /\.lightbox_image\s*\{[^}]*pointer-events:\s*auto/s);

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
