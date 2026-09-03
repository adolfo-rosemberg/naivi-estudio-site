import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../dist', import.meta.url)));
const args = process.argv.slice(2);
const host = args.includes('--host') ? args[args.indexOf('--host') + 1] : '127.0.0.1';
const portIndex = args.indexOf('--port');
const port = portIndex >= 0 ? Number(args[portIndex + 1]) : 4321;
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

let idleTimer;
const touchIdleTimer = () => {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => shutdown(), 1500);
};

const server = createServer((request, response) => {
  touchIdleTimer();
  const requestPath = decodeURIComponent(new URL(request.url ?? '/', `http://${host}`).pathname);
  const candidate = normalize(join(root, requestPath));
  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }
  const filePath = existsSync(candidate) && statSync(candidate).isFile() ? candidate : join(root, 'index.html');
  if (!existsSync(filePath)) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  response.writeHead(200, { 'Content-Type': contentTypes[extname(filePath)] ?? 'application/octet-stream' });
  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  process.stdout.write(`Static dist server listening at http://${host}:${port}\n`);
});

const shutdown = () => {
  server.closeAllConnections?.();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 250).unref();
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
process.once('disconnect', shutdown);
