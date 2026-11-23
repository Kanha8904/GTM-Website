// Regenerates public/img/og-image.png (1200×630) + favicon PNGs. Needs Playwright with Chromium.
// Edit scripts/og-template.html if dates/weeks/seats change, then: node scripts/make-og.mjs
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const r = (p) => fileURLToPath(new URL(p, import.meta.url));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.goto("file://" + r("./og-template.html"));
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: r("../public/img/og-image.png") });
for (const [size, name] of [[32, "favicon-32.png"], [180, "apple-touch-icon.png"]]) {
  await p.setViewportSize({ width: size, height: size });
  await p.setContent(`<body style="margin:0;background:#FFFFFF;display:grid;place-items:center;width:${size}px;height:${size}px"><img src="file://${r("../public/img/favicon.svg")}" style="height:${Math.round(size * 0.8)}px"></body>`);
  await p.waitForTimeout(100);
  await p.screenshot({ path: r("../public/img/" + name) });
}
await b.close();
console.log("✔ og-image.png, favicon-32.png, apple-touch-icon.png");
