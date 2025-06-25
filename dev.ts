#!/usr/bin/env bun

import { spawn } from "bun";
import { join } from "path";

const projectRoot = import.meta.dir;
const backendPath = join(projectRoot, "backend");
const frontendPath = join(projectRoot, "frontend");

console.log("🚀 Starting SoulBeast development servers...");
console.log("📁 Project root:", projectRoot);
console.log("🔧 Backend path:", backendPath);
console.log("🎨 Frontend path:", frontendPath);
console.log("");

// Start backend server
const backend = spawn({
  cmd: ["bun", "run", "dev"],
  cwd: backendPath,
  stdout: "pipe",
  stderr: "pipe",
});

// Start frontend server
const frontend = spawn({
  cmd: ["bun", "run", "dev"],
  cwd: frontendPath,
  stdout: "pipe",
  stderr: "pipe",
});

// Handle backend output
if (backend.stdout) {
  const backendReader = backend.stdout.getReader();
  const readBackend = async () => {
    while (true) {
      const { done, value } = await backendReader.read();
      if (done) break;
      const text = new TextDecoder().decode(value);
      process.stdout.write(`[BACKEND] ${text}`);
    }
  };
  readBackend();
}

if (backend.stderr) {
  const backendErrorReader = backend.stderr.getReader();
  const readBackendError = async () => {
    while (true) {
      const { done, value } = await backendErrorReader.read();
      if (done) break;
      const text = new TextDecoder().decode(value);
      process.stderr.write(`[BACKEND ERROR] ${text}`);
    }
  };
  readBackendError();
}

// Handle frontend output
if (frontend.stdout) {
  const frontendReader = frontend.stdout.getReader();
  const readFrontend = async () => {
    while (true) {
      const { done, value } = await frontendReader.read();
      if (done) break;
      const text = new TextDecoder().decode(value);
      process.stdout.write(`[FRONTEND] ${text}`);
    }
  };
  readFrontend();
}

if (frontend.stderr) {
  const frontendErrorReader = frontend.stderr.getReader();
  const readFrontendError = async () => {
    while (true) {
      const { done, value } = await frontendErrorReader.read();
      if (done) break;
      const text = new TextDecoder().decode(value);
      process.stderr.write(`[FRONTEND ERROR] ${text}`);
    }
  };
  readFrontendError();
}

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down development servers...");
  backend.kill();
  frontend.kill();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down development servers...");
  backend.kill();
  frontend.kill();
  process.exit(0);
});

// Wait for both processes
Promise.all([backend.exited, frontend.exited]).then(() => {
  console.log("\n✅ All development servers have stopped.");
  process.exit(0);
}).catch((error) => {
  console.error("\n❌ Error running development servers:", error);
  process.exit(1);
});

console.log("\n💡 Press Ctrl+C to stop all servers");
console.log("=".repeat(50));