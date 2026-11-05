// 本地预览 dist/：node scripts/serve.mjs（默认 http://127.0.0.1:4179）
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, normalize, extname } from 'node:path';
import { root } from './lib.mjs';

const dist = join(root, 'dist');
const port = Number(process.env.PORT || 4179);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.txt': 'text/plain', '.md': 'text/markdown', '.png': 'image/png' };

createServer(async (req, res) => {
  let file;
  try {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    if (path.includes('\0')) throw new Error('Invalid path');
    file = join(dist, path.endsWith('/') ? path + 'index.html' : path);
  } catch { return res.writeHead(400).end('请求地址无效'); }
  if (!file.startsWith(dist)) return res.writeHead(403).end();
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': (types[extname(file)] || 'application/octet-stream') + '; charset=utf-8' }).end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`预览：http://127.0.0.1:${port}/`));
