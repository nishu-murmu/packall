// Frees port 5173 before starting the Tauri dev server.
// On Windows, stale Vite processes from previous sessions often hold the port,
// causing `bunx vite` to exit non-zero, which makes the Tauri CLI kill the
// Rust binary with SIGTERM (exit 143) and show a 1-2 second flash then close.
const { execSync } = require('child_process');

const PORT = 5173;

try {
  if (process.platform === 'win32') {
    const out = execSync('netstat -ano', { stdio: 'pipe' }).toString();
    const killed = new Set();
    for (const line of out.split('\n')) {
      if (!(line.includes(`:${PORT} `) || line.includes(`:${PORT}\r`))) continue;
      if (!line.includes('LISTENING')) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parseInt(parts[parts.length - 1], 10);
      if (!pid || pid <= 0 || killed.has(pid)) continue;
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'pipe' });
        killed.add(pid);
        console.log(`[dev] Freed port ${PORT} (killed PID ${pid})`);
      } catch {}
    }
  } else {
    try {
      const pids = execSync(`lsof -ti :${PORT}`, { stdio: 'pipe' }).toString().trim();
      if (pids) {
        execSync(`kill -9 ${pids.split('\n').join(' ')}`, { stdio: 'pipe' });
        console.log(`[dev] Freed port ${PORT}`);
      }
    } catch {}
  }
} catch {}
