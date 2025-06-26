#!/usr/bin/env bun

import { spawn } from "bun";
import { join } from "path";
import { existsSync } from "fs";

const projectRoot = import.meta.dir;
const backendPath = join(projectRoot, "backend");
const frontendPath = join(projectRoot, "frontend");
const frontendDistPath = join(frontendPath, "dist");

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

// Global reference to backend process for graceful shutdown
let backendProcess: any = null;

function log(message: string, color = colors.cyan): void {
  const timestamp = new Date().toLocaleTimeString();
  console.log(
    `${colors.gray}[${timestamp}]${colors.reset} ${color}${message}${colors.reset}`
  );
}

function logError(message: string): void {
  log(`❌ ${message}`, colors.red);
}

function logSuccess(message: string): void {
  log(`✅ ${message}`, colors.green);
}

function logInfo(message: string): void {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message: string): void {
  log(`⚠️  ${message}`, colors.yellow);
}

async function buildFrontend(): Promise<boolean> {
  logInfo("Building frontend for production...");

  try {
    const buildProcess = spawn({
      cmd: ["bun", "run", "build"],
      cwd: frontendPath,
      stdio: ["inherit", "pipe", "pipe"],
    });

    const output = await new Response(buildProcess.stdout).text();
    const errorOutput = await new Response(buildProcess.stderr).text();

    await buildProcess.exited;

    if (buildProcess.exitCode === 0) {
      logSuccess("Frontend build completed successfully");
      if (output.trim()) {
        console.log(output);
      }
      return true;
    } else {
      logError("Frontend build failed");
      if (errorOutput.trim()) {
        console.error(errorOutput);
      }
      return false;
    }
  } catch (error) {
    logError(`Frontend build error: ${error}`);
    return false;
  }
}

function validateEnvironment(): boolean {
  const requiredEnvVars = ["BETTER_AUTH_SECRET", "BETTER_AUTH_URL"];

  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    logError(`Missing required environment variables: ${missing.join(", ")}`);
    logInfo(
      "Please set these environment variables before running in production"
    );
    return false;
  }

  return true;
}

function setupProductionEnvironment(): void {
  // Set NODE_ENV to production if not already set
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "production";
    logInfo("Set NODE_ENV to production");
  }

  // Set default production port if not specified
  if (!process.env.PORT) {
    process.env.PORT = "3001";
    logInfo("Set default PORT to 3001");
  }

  // Ensure BETTER_AUTH_URL is set for production
  if (!process.env.BETTER_AUTH_URL) {
    logWarning("BETTER_AUTH_URL not set, using default production URL");
    process.env.BETTER_AUTH_URL = "https://your-domain.com";
  }

  logInfo(`Better Auth URL: ${process.env.BETTER_AUTH_URL}`);
  logInfo(`Backend Port: ${process.env.PORT}`);
}

async function startBackend(): Promise<void> {
  logInfo("Starting backend in production mode...");

  try {
    backendProcess = spawn({
      cmd: ["bun", "run", "start"],
      cwd: backendPath,
      stdio: ["inherit", "pipe", "pipe"],
      env: {
        ...process.env,
        NODE_ENV: "production",
      } as any,
    });

    // Handle backend output
    const reader = backendProcess.stdout.getReader();
    const decoder = new TextDecoder();

    // Read output in chunks
    const readOutput = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n").filter((line) => line.trim());

          lines.forEach((line) => {
            log(`🔧 BACKEND: ${line}`, colors.blue);
          });
        }
      } catch (error) {
        logError(`Backend output error: ${error}`);
      }
    };

    // Handle backend errors
    const errorReader = backendProcess.stderr.getReader();
    const readErrors = async () => {
      try {
        while (true) {
          const { done, value } = await errorReader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n").filter((line) => line.trim());

          lines.forEach((line) => {
            // Filter out Bun command output and termination messages that's not actually an error
            if (!line.includes('$ bun index.ts') && 
                !line.includes('was terminated by signal SIGTERM')) {
              log(`🔧 BACKEND ERROR: ${line}`, colors.red);
            }
          });
        }
      } catch (error) {
        logError(`Backend error reading: ${error}`);
      }
    };

    // Start reading output and errors
    readOutput();
    readErrors();

    logSuccess("Backend started successfully");
    logInfo(`Backend running on port ${process.env.PORT}`);

    // Wait for the process to exit
    await backendProcess.exited;

    if (backendProcess.exitCode !== 0) {
      // Check if it was terminated by our graceful shutdown
      if (backendProcess.signalCode === "SIGTERM") {
        log(`✅ Backend terminated gracefully`, colors.green);
      } else {
        logError(`Backend exited with code ${backendProcess.exitCode}`);
        process.exit(1);
      }
    }
  } catch (error) {
    logError(`Failed to start backend: ${error}`);
    process.exit(1);
  }
}

function setupGracefulShutdown(): void {
  const shutdown = (signal: string) => {
    const isCtrlC = signal === "SIGINT";
    const shutdownMessage = isCtrlC 
      ? "Received Ctrl+C (SIGINT), shutting down gracefully..."
      : `Received ${signal}, shutting down gracefully...`;
    
    logInfo(shutdownMessage);
    
    if (backendProcess) {
      logInfo("Terminating backend process...");
      try {
        backendProcess.kill("SIGTERM");
        // Give the process a moment to terminate gracefully
        setTimeout(() => {
          if (!backendProcess.killed) {
            logWarning("Backend process didn't terminate gracefully, forcing kill...");
            backendProcess.kill("SIGKILL");
          }
        }, 2000);
      } catch (error) {
        logError(`Error terminating backend process: ${error}`);
      }
    }
    
    // Exit after a short delay to allow cleanup
    setTimeout(() => {
      if (isCtrlC) {
        logInfo("✅ Production server stopped by user (Ctrl+C)");
      }
      process.exit(0);
    }, 500);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

async function main(): Promise<void> {
  logInfo("🚀 Starting SoulBeast in production mode...");
  
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
      
      logInfo("Loaded environment variables from .env file");
    }
  } catch (error) {
    logWarning(`Could not load .env file: ${error}`);
  }
  
  // Setup graceful shutdown
  setupGracefulShutdown();
  
  // Validate environment
  if (!validateEnvironment()) {
    process.exit(1);
  }

  // Setup production environment
  setupProductionEnvironment();

  // Build frontend
  const buildSuccess = await buildFrontend();
  if (!buildSuccess) {
    logError("Frontend build failed, aborting production start");
    process.exit(1);
  }

  // Check if frontend dist exists
  if (!existsSync(frontendDistPath)) {
    logError("Frontend dist directory not found after build");
    process.exit(1);
  }

  logSuccess("Production build completed successfully");
  logInfo("Frontend built and ready to serve");
  logInfo("Backend will serve the frontend as a Single Page Application (SPA)");

  // Start backend
  await startBackend();
}

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logError(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// Run the main function
main().catch((error) => {
  logError(`Production startup failed: ${error}`);
  process.exit(1);
});
