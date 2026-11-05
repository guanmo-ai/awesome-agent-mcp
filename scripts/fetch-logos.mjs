// 抓取每个服务官网的高清图标，统一转成 128×128 PNG，存到 web/logos/<id>.png。
// 需要本机装有 Playwright（npm i -g playwright && npx playwright install chromium）。
// 用法：node scripts/fetch-logos.mjs            只补缺失的
//       node scripts/fetch-logos.mjs --force    全部重抓
//       node scripts/fetch-logos.mjs amap didi  只抓指定条目
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, readJson } from './lib.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const dir = join(root, 'web/logos');
const manifestPath = join(dir, 'manifest.json');
mkdirSync(dir, { recursive: true });
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.filter((a) => !a.startsWith('--'));
const services = readJson('data/services.json').services.filter(
  (s) => s.homepage && s.status !== 'rejected' && (only.length ? only.includes(s.id) : force || !existsSync(join(dir, `${s.id}.png`))),
);

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

function candidates(html, base) {
  const out = [];
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = /rel=["']?([^"'>]+)/i.exec(tag)?.[1]?.toLowerCase() ?? '';
    if (!rel.includes('icon')) continue;
    const href = /href=["']?([^"'\s>]+)/i.exec(tag)?.[1];
    if (!href) continue;
    const sizes = /sizes=["']?([^"'>]+)/i.exec(tag)?.[1] ?? '';
    const max = Math.max(0, ...sizes.split(/\s+/).map((x) => parseInt(x, 10) || 0));
    let score = max || (rel.includes('apple') ? 180 : 32);
    if (/\.svg(\?|$)/i.test(href) || /svg/i.test(tag)) score = Math.max(score, 160);
    try { out.push({ url: new URL(href.replace(/&amp;/g, '&'), base).href, score }); } catch {}
  }
  const origin = new URL(base).origin;
  out.push({ url: `${origin}/apple-touch-icon.png`, score: 150 }, { url: `${origin}/favicon.ico`, score: 16 });
  return out.sort((a, b) => b.score - a.score).filter((c, i, a) => a.findIndex((x) => x.url === c.url) === i);
}

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH });
const ctx = await browser.newContext({ userAgent: UA, ignoreHTTPSErrors: true });
const page = await ctx.newPage();
await page.setContent('<canvas id="c" width="128" height="128"></canvas>');

for (const s of services) {
  let done = false;
  try {
    const list = [];
    if (s.appStoreId) {
      // App Store 图标：512px 方形，所有服务风格统一，优先使用
      const r = await ctx.request.get(`https://itunes.apple.com/lookup?id=${s.appStoreId}&country=cn`, { timeout: 20000 }).catch(() => null);
      const art = r?.ok() ? (await r.json()).results?.[0]?.artworkUrl512 : null;
      if (art) list.push({ url: art.replace(/\/\d+x\d+bb\.\w+$/, '/256x256bb.png'), score: 999, appStore: true });
    }
    const res = await ctx.request.get(s.homepage, { timeout: 20000, headers: { 'accept-language': 'zh-CN,zh;q=0.9' } });
    const html = await res.text();
    for (const c of [...list, ...candidates(html, res.url())]) {
      const r = await ctx.request.get(c.url, { timeout: 15000 }).catch(() => null);
      if (!r?.ok()) continue;
      const body = await r.body();
      if (body.length < 100) continue;
      const type = r.headers()['content-type']?.split(';')[0] || 'image/x-icon';
      const out = await page.evaluate(async ({ b64, type }) => {
        const img = new Image();
        img.src = `data:${type};base64,${b64}`;
        try { await img.decode(); } catch { return null; }
        const isSvg = type.includes('svg');
        const w = img.naturalWidth || (isSvg ? 128 : 0);
        if (!isSvg && w < 48) return { small: w };
        const cv = document.getElementById('c');
        const g = cv.getContext('2d');
        g.clearRect(0, 0, 128, 128);
        g.imageSmoothingQuality = 'high';
        g.drawImage(img, 0, 0, 128, 128);
        const px = g.getImageData(0, 0, 128, 128).data;
        const alphaAt = (x, y) => px[(y * 128 + x) * 4 + 3];
        const corners = [alphaAt(2, 2), alphaAt(125, 2), alphaAt(2, 125), alphaAt(125, 125)];
        let opaque = 0;
        for (let i = 3; i < px.length; i += 4) if (px[i] > 200) opaque++;
        return { png: cv.toDataURL('image/png').split(',')[1], pad: corners.some((a) => a < 200), fill: opaque / (128 * 128), w };
      }, { b64: body.toString('base64'), type });
      if (!out || out.small !== undefined || out.fill < 0.04) continue;
      writeFileSync(join(dir, `${s.id}.png`), Buffer.from(out.png, 'base64'));
      manifest[s.id] = { pad: c.appStore ? false : out.pad, source: c.appStore ? 'appstore' : c.url, size: out.w };
      console.log(`✓ ${s.id.padEnd(20)} ${out.w}px ${out.pad ? '透明' : '满底'}  ${c.url}`);
      done = true;
      break;
    }
  } catch (e) {
    console.log(`✗ ${s.id.padEnd(20)} ${e.message.split('\n')[0]}`);
    continue;
  }
  if (!done) console.log(`✗ ${s.id.padEnd(20)} 没找到足够清晰的图标`);
}

writeFileSync(manifestPath, JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2) + '\n');
await browser.close();
