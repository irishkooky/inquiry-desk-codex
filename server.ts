import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { classify } from './classify.ts';

const PORT = 3000;
const PUBLIC = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/classify') {
      const raw = await readBody(req);
      let text = '';
      try {
        const json: { text?: string } = JSON.parse(raw || '{}');
        text = json.text ?? '';
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'invalid json' }));
        return;
      }
      const category = classify(text);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ category, text }));
      return;
    }

    let filePath = path.join(PUBLIC, req.url === '/' || !req.url ? 'index.html' : req.url);
    if (!filePath.startsWith(PUBLIC)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    const type =
      ext === '.html' ? 'text/html; charset=utf-8' :
      ext === '.js' ? 'text/javascript; charset=utf-8' :
      ext === '.css' ? 'text/css; charset=utf-8' :
      'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    // サーバーのコンソールにも出す（どこで落ちたかを追いやすくするため）
    console.error(`[500] ${req.method} ${req.url}`, err);
    const message = err instanceof Error ? err.message : String(err);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: message }));
  }
});

const HOST = '127.0.0.1';

server.listen(PORT, HOST, () => {
  console.log(`起動しました http://localhost:${PORT}`);
});
