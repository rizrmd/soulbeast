import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { auth } from "./auth";
import { join } from "path";
import { existsSync } from "fs";

const app = new Hono();

// Path to frontend dist directory
const frontendDistPath = join(import.meta.dir, "../frontend/dist");

// Enable CORS for frontend
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:5173",
];

// Add production origins if environment variables are set
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
if (process.env.BETTER_AUTH_URL) {
  allowedOrigins.push(process.env.BETTER_AUTH_URL);
}

app.use(
  "/*",
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Better Auth routes
app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  const res = await auth.handler(c.req.raw);
  console.log(res.status);
  return res;
});

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.get("/api/user", async (c) => {
  const session = await auth.api.getSession({
    headers: new Headers(c.req.header()),
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return c.json({ user: session.user });
});

// Serve static files from frontend dist
if (existsSync(frontendDistPath)) {
  // Serve all static assets from the dist directory
  app.use("/static/*", serveStatic({ root: frontendDistPath }));
  app.use("/assets/*", serveStatic({ root: frontendDistPath }));
  app.use("/img/*", serveStatic({ root: frontendDistPath }));
  app.use("/fonts/*", serveStatic({ root: frontendDistPath }));

  // Serve favicon and other root assets
  app.get(
    "/favicon.ico",
    serveStatic({ path: "./favicon.ico", root: frontendDistPath })
  );
  app.get(
    "/robots.txt",
    serveStatic({ path: "./robots.txt", root: frontendDistPath })
  );

  // SPA catch-all route - serve index.html for all non-API and non-static routes
  app.get("*", async (c) => {
    const path = c.req.path;

    // Skip API routes and static assets
    if (
      path.startsWith("/api/") ||
      path.startsWith("/health") ||
      path.startsWith("/static/") ||
      path.startsWith("/assets/") ||
      path.startsWith("/img/") ||
      path.startsWith("/fonts/")
    ) {
      return c.notFound();
    }

    // Serve index.html for SPA routing
    const res = serveStatic({ root: frontendDistPath, path: "./index.html" });
    return res(c, async () => {});
  });

  console.log(`🎯 Serving frontend from: ${frontendDistPath}`);
} else {
  console.warn(`⚠️  Frontend dist directory not found: ${frontendDistPath}`);
  console.warn(`   Make sure to build the frontend first with: bun run build`);
}

const port = process.env.PORT || 3001;

export default {
  port,
  fetch: app.fetch,
};
