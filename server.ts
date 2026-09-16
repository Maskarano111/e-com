import "dotenv/config";
import express from "express";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import apiRouter from "./server/routes";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security headers via helmet
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for dev/Vite inline scripts compatibility
    crossOriginEmbedderPolicy: false
  }));

  // Rate limiting for auth routes (prevents credential brute-forcing)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts. Please try again in 15 minutes.' }
  });
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
