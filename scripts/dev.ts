#!/usr/bin/env bun

import { spawn } from "bun";
import { join } from "path";
import { existsSync } from "fs";

const projectRoot = process.cwd();
const backendPath = join(projectRoot, "backend");
const frontendPath = join(projectRoot, "frontend");

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

// Load environment variables from root .env file
try {
  const envPath = join(projectRoot, '.env');
  if (existsSync(envPath)) {
    const envContent = await Bun.file(envPath).text();
    const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    envLines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
    
    console.log(`${colors.green}✓ Loaded environment variables from .env file${colors.reset}`);
  }
} catch (error) {
  console.log(`${colors.yellow}⚠ Could not load .env file: ${error}${colors.reset}`);
}

// Message deduplication
interface LogMessage {
  content: string;
  count: number;
  lastSeen: number;
}

const messageCache = new Map<string, LogMessage>();
const DEDUPE_WINDOW = 2000; // 2 seconds

function formatTimestamp(): string {
  const now = new Date();
  return `${colors.gray}[${now.toLocaleTimeString()}]${colors.reset}`;
}

function formatPrefix(service: string, isError = false): string {
  const color = isError ? colors.red : (service === 'BACKEND' ? colors.blue : colors.magenta);
  const icon = service === 'BACKEND' ? '🔧' : '🎨';
  const paddedService = service.padEnd(8); // Ensure consistent width
  return `${color}${colors.bright}${icon} ${paddedService}${colors.reset}`;
}

function processMessage(text: string, service: string, isError = false): void {
  const lines = text.split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    const now = Date.now();
    const messageKey = `${service}:${trimmedLine}`;
    
    if (messageCache.has(messageKey)) {
      const cached = messageCache.get(messageKey)!;
      if (now - cached.lastSeen < DEDUPE_WINDOW) {
        cached.count++;
        cached.lastSeen = now;
        // Skip displaying repeated messages - only show the last occurrence
        return;
      }
    }
    
    messageCache.set(messageKey, { content: trimmedLine, count: 1, lastSeen: now });
    
    // Clean old entries
    for (const [key, value] of messageCache.entries()) {
      if (now - value.lastSeen > DEDUPE_WINDOW * 2) {
        messageCache.delete(key);
      }
    }
    
    const output = `${formatTimestamp()} ${formatPrefix(service, isError)} ${trimmedLine}\n`;
    if (isError) {
      process.stderr.write(output);
    } else {
      process.stdout.write(output);
    }
  });
}

console.log(`${colors.bright}${colors.green}🚀 Starting SoulBeast development servers...${colors.reset}`);
console.log(`${colors.gray}📁 Project root: ${colors.cyan}${projectRoot}${colors.reset}`);
console.log(`${colors.gray}🔧 Backend path: ${colors.blue}${backendPath}${colors.reset}`);
console.log(`${colors.gray}🎨 Frontend path: ${colors.magenta}${frontendPath}${colors.reset}`);
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
      processMessage(text, 'BACKEND');
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
      processMessage(text, 'BACKEND', true);
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
      processMessage(text, 'FRONTEND');
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
      processMessage(text, 'FRONTEND', true);
    }
  };
  readFrontendError();
}

// Handle process termination
process.on("SIGINT", () => {
  console.log(`\n${colors.bright}${colors.red}🛑 Shutting down development servers...${colors.reset}`);
  backend.kill();
  frontend.kill();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log(`\n${colors.bright}${colors.red}🛑 Shutting down development servers...${colors.reset}`);
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