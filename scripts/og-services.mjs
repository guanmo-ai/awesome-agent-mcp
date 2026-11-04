// Offline service share images. Needs an existing local Playwright installation.
// node scripts/og-services.mjs            add missing images
// node scripts/og-services.mjs --force    regenerate all visible services
// node scripts/og-services.mjs amap feishu regenerate only the named services
// Optional: PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/testing/chromium
// Optional: NODE_PATH=/path/to/existing/node_modules (no repository dependency required)
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, load, LABELS } from './lib.mjs';
import { esc, sortedTypes, mark, brandColor } from '../web/render.mjs';

const { data, errors } = load();
if (errors.length) throw new Error(errors.join('\n'));
const args = process.argv.slice(2);
const ids = args.filter((a) => !a.startsWith('--'));
const dir = join(root, 'web/og');
mkdirSync(dir, { recursive: true });
const services = data.services.filter((s) => s.status !== 'rejected' && (ids.length ? ids.includes(s.id) : args.includes('--force') || !existsSync(join(dir, `${s.id}.jpg`))));
if (!services.length) { console.log('所有服务分享图已存在。'); process.exit(0); }
const { chromium } = createRequire(import.meta.url)('playwright');
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const font = readFileSync(join(root, 'web/fonts/Geist-Variable.woff2')).toString('base64');
const brand = readFileSync(join(root, 'web/favicon.svg')).toString('base64');
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, colorScheme: 'dark' });
  // No server, remote APIs, CDN fonts, or network access are needed to render.
  await page.route('https://**/*', (route) => route.abort());
  for (const s of services) {
    const logo = join(root, `web/logos/${s.id}.png`);
    const image = existsSync(logo) ? `<img src="data:image/png;base64,${readFileSync(logo).toString('base64')}" alt="">` : `<span>${esc(mark(s))}</span>`;
    await page.setContent(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><style>
      @font-face{font-family:Geist;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:100 900}
      *{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px;overflow:hidden}
      body{font-family:Geist,"PingFang SC","Microsoft YaHei",sans-serif;color:#f1f3f7;background:#07080a}
      .glow{position:absolute;inset:0;background:radial-gradient(ellipse at 14% 34%,#5b8cff1f,transparent 58%),radial-gradient(ellipse at 85% 100%,#8b6dff20,transparent 50%)}
      main{position:relative;padding:64px 72px;height:100%;display:flex;flex-direction:column;justify-content:center}
      .eyebrow{font-size:18px;letter-spacing:2px;color:#9ba6bb;margin-bottom:35px}.row{display:flex;align-items:center;gap:36px}
      .logo{width:152px;height:152px;flex:none;display:flex;align-items:center;justify-content:center;background:#fff;border-radius:32px;overflow:hidden}
      .logo img{width:100%;height:100%;object-fit:contain}.logo span{font-size:72px;font-weight:700;color:${brandColor(s)}}
      h1{margin:0;font-size:${s.name.length > 9 ? 56 : 68}px;line-height:1.2;letter-spacing:-2px;font-weight:650;max-width:830px}
      p{margin:24px 0 0;max-width:1000px;font-size:29px;line-height:1.55;color:#b1b8c8}
      .tags{display:flex;gap:12px;margin-top:28px}.tag{padding:8px 16px;border:1px solid #414b62;border-radius:10px;color:#c5d1ee;font-size:20px}
      footer{position:absolute;right:72px;bottom:42px;display:flex;align-items:center;gap:11px;color:#c9d0df;font-size:23px;font-weight:550}
      .brand{width:30px;height:30px;border-radius:9px;display:block}
      .line{position:absolute;left:72px;right:72px;bottom:90px;height:1px;background:#282e3b}
    </style><div class="glow"></div><main><div class="eyebrow">国内官方 MCP · SKILL · CLI</div><div class="row"><div class="logo">${image}</div><h1>${esc(s.name)}</h1></div><p>${esc(s.summary)}</p><div class="tags">${sortedTypes(s).map((t) => `<span class="tag">${esc(LABELS.types[t])}</span>`).join('')}</div></main><div class="line"></div><footer><img class="brand" src="data:image/svg+xml;base64,${brand}" alt="">Agent MCP</footer></html>`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(dir, `${s.id}.jpg`), type: 'jpeg', quality: 88 });
    console.log(`已生成 web/og/${s.id}.jpg（1200×630）`);
  }
} finally { await browser.close(); }
