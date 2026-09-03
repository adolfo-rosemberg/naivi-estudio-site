import { spawn } from 'node:child_process';

const host = '127.0.0.1';
const port = 4321;
const server = spawn(process.execPath, ['scripts/serve-dist.mjs', '--host', host, '--port', String(port)], {
  stdio: 'inherit',
  windowsHide: true,
});

const waitForServer = async () => {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://${host}:${port}/`);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for http://${host}:${port}`);
};

const stopServer = () => {
  if (!server.killed) server.kill();
};

try {
  await waitForServer();
  const playwright = spawn(process.execPath, ['node_modules/playwright/cli.js', 'test', ...process.argv.slice(2)], {
    stdio: 'inherit',
    windowsHide: true,
  });
  const exitCode = await new Promise((resolve, reject) => {
    playwright.once('error', reject);
    playwright.once('exit', (code, signal) => resolve(code ?? (signal ? 1 : 0)));
  });
  process.exitCode = exitCode;
} finally {
  stopServer();
}
