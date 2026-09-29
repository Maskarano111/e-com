import "dotenv/config";
import express from "express";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import apiRouter from "./server/routes";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Security headers via helmet
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for dev/Vite inline scripts compatibility
    crossOriginEmbedderPolicy: false
  }));

  const normalizeOrigin = (value: string) => {
    try { return new URL(value.trim()).origin; } catch { return ''; }
  };
  const allowedOrigins = new Set(
    [process.env.APP_URL, ...(process.env.CORS_ORIGINS || '').split(',')]
      .map((origin) => normalizeOrigin(origin || ''))
      .filter(Boolean)
  );
  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.add('http://localhost:4179');
    allowedOrigins.add('http://localhost:5173');
  }
  app.use((req, res, next) => {
    const origin = req.get('Origin');
    if (origin) {
      const normalizedOrigin = normalizeOrigin(origin);
      if (!normalizedOrigin || !allowedOrigins.has(normalizedOrigin)) {
        return res.status(403).json({ error: 'This origin is not allowed to access the API.' });
      }
      res.setHeader('Access-Control-Allow-Origin', normalizedOrigin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  // Rate limiting for auth routes (prevents credential brute-forcing)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts. Please try again in 15 minutes.' }
  });
  const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many password reset requests. Please try again later.' }
  });
  app.use('/api/auth/forgot-password', passwordResetLimiter);
  app.use('/api/auth/', authLimiter);

  // General API rate limiter
  const generalApiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 300, // 300 requests per minute
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api/', generalApiLimiter);

  // Middlewares for body parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Mount e-commerce API routes
  app.use("/api", apiRouter);

  // Vite middleware for development vs static for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NovaMart Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
