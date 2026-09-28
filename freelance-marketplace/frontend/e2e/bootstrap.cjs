/**
 * E2E bootstrap.
 *
 * Runs `python manage.py seed_e2e` in the backend folder, then execs
 * `python manage.py runserver`.
 *
 * Why: Playwright's webServer.command runs a single shell command, so
 * we can't chain two with `&&` reliably on Windows. Doing it in Node
 * is portable and lets us fail fast with a clear message.
 *
 * This file is CommonJS (.cjs) because the frontend is ESM.
 */

const { spawn, spawnSync } = require("node:child_process");
const path = require("node:path");
const process = require("node:process");

const BACKEND_DIR = path.resolve(__dirname, "../../backend");

/**
 * Run a command synchronously in BACKEND_DIR, inheriting stdio so
 * messages appear in the Playwright output.
 */
function runSync(cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd: BACKEND_DIR,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    console.error(`\nCommand failed: ${cmd} ${args.join(" ")}`);
    process.exit(result.status || 1);
  }
}

// 1. Apply migrations + seed if empty.
runSync("python", ["manage.py", "seed_e2e"]);

// 2. Start Django in the foreground, replacing this process.
//    Using `spawn` and forwarding signals keeps Ctrl+C working.
const server = spawn(
  "python",
  ["manage.py", "runserver", "127.0.0.1:8000", "--noreload"],
  {
    cwd: BACKEND_DIR,
    stdio: "inherit",
    shell: process.platform === "win32",
  }
);

// Forward termination signals so Playwright can shut the server down.
["SIGINT", "SIGTERM"].forEach((sig) => {
  process.on(sig, () => {
    server.kill(sig);
  });
});

server.on("exit", (code) => {
  process.exit(code ?? 0);
});