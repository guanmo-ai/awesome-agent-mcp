// 生成分享图 web/og.jpg（X、微信等预览图，README 顶部也用它）。需要本机装有 Playwright。
// 用法：先 npm run serve 开预览，再 node scripts/og-image.mjs
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { root } from './lib.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
const url = process.env.URL || 'http://127.0.0.1:4179/';
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH });
const page = await browser.newPage({ viewport: { width: 1600, height: 840 }, deviceScaleFactor: 0.75, colorScheme: 'dark' });
await page.goto(url, { waitUntil: 'networkidle' });
await page.addStyleTag({ content: '.nav-links,.kbar{visibility:hidden}' });
await page.waitForTimeout(3200);
await page.screenshot({ path: join(root, 'web/og.jpg'), type: 'jpeg', quality: 88 });
await browser.close();
console.log('已生成 web/og.jpg（1200×630）');
