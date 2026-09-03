import { spawn, spawnSync } from 'node:child_process';

const host = '127.0.0.1';
const port = 8787;
const worker = spawn(process.execPath, [
  'node_modules/wrangler/bin/wrangler.js',
  'dev',
  '--local',
  '--config',
  'wrangler.local.jsonc',
  '--port',
  String(port),
], {
  stdio: 'inherit',
  windowsHide: true,
  env: {
    ...process.env,
    WRANGLER_WRITE_LOGS: 'false',
    WRANGLER_LOG_PATH: `${process.cwd()}/.wrangler/logs`,
  },
});

const waitForWorker = async () => {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (worker.exitCode !== null) throw new Error(`Wrangler exited early with code ${worker.exitCode}`);
    try {
      const response = await fetch(`http://${host}:${port}/`);
      if (response.ok) return;
    } catch {
      // Wrangler is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Timed out waiting for http://${host}:${port}`);
};

const stopWorker = () => {
  if (worker.exitCode !== null || worker.killed) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(worker.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
  } else {
    worker.kill('SIGTERM');
  }
};

try {
  await waitForWorker();
  const playwright = spawn(process.execPath, [
    'node_modules/playwright/cli.js',
    'test',
    '--config',
    'playwright.worker.config.ts',
    ...process.argv.slice(2),
  ], { stdio: 'inherit', windowsHide: true });
  const exitCode = await new Promise((resolve, reject) => {
    playwright.once('error', reject);
    playwright.once('exit', (code, signal) => resolve(code ?? (signal ? 1 : 0)));
  });
  process.exitCode = exitCode;
} finally {
  stopWorker();
}
