// Renders the 3D illustrations (three.js, brand colours) to public/img/3d/.
// Needs Playwright with Chromium: node scripts/make-3d.mjs
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { execFileSync } from "node:child_process";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const dir = fileURLToPath(new URL("./three/", import.meta.url));
const out = fileURLToPath(new URL("../public/img/3d/", import.meta.url));
await mkdir(out, { recursive: true });
const srv = createServer(async (req, res) => {
  try { const p = join(dir, new URL(req.url, "http://x").pathname); res.writeHead(200, { "Content-Type": extname(p) === ".js" ? "text/javascript" : "text/html" }); res.end(await readFile(p)); }
  catch { res.writeHead(404); res.end(); }
}).listen(4399);
const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
for (const s of ["pipeline", "target", "layers"]) {
  const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  p.on("pageerror", (e) => console.error(s, e.message));
  await p.goto(`http://localhost:4399/scene.html?s=${s}`);
  await p.waitForFunction(() => window.__done, null, { timeout: 60000 });
  await p.locator("canvas").screenshot({ path: join(out, `${s}-raw.png`), omitBackground: true });
  console.log("rendered", s);
}
await b.close(); srv.close();
execFileSync("python3", [fileURLToPath(new URL("./finish-3d.py", import.meta.url))], { stdio: "inherit" });
