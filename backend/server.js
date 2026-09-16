import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import connectDB, { closeDB } from './config/db.js';

// ── Route imports ────────────────────────────────────────────────────────────
import authRoutes     from './routes/auth.js';
import projectRoutes  from './routes/projects.js';
import brandingRoutes from './routes/branding.js';
import tenantRoutes   from './routes/tenants.js';
import userRoutes     from './routes/users.js';
import websitesRoutes from './routes/websites.js';
import pagesRoutes from './routes/pages.js';
import siteBackendsRoutes from './routes/siteBackends.js';
import aiRoutes from './routes/ai.js';
import deployRoutes from './routes/deploy.js';
import billingRoutes from './routes/billing.js';
import analyticsRoutes from './routes/analytics.js';
import teamRoutes from './routes/team.js';
import exportRoutes from './routes/export.js';

// ── Connect to MongoDB ───────────────────────────────────────────────────────
await connectDB();

// ── Express app ──────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ── Multer (memory storage for Cloudinary uploads) ───────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// ── Global middleware ────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/branding', upload.single('file'), brandingRoutes);
app.use('/api/tenants',  tenantRoutes);
app.use('/api/tenants',  userRoutes);
app.use('/api/websites', websitesRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/site-backends', siteBackendsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/deploy', deployRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/export', exportRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start server ─────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`[INFO] Site Pilot backend running on http://localhost:${PORT}`);
});

// ── Graceful shutdown (e.g. Ctrl + C) ─────────────────────────────────────────
async function handleShutdown(signal) {
  console.log(`\n[INFO] Received ${signal}. Closing MongoDB connection and shutting down...`);
  try {
    await closeDB();
    server.close(() => {
      console.log('[INFO] HTTP server closed cleanly.');
      process.exit(0);
    });

    // Fallback timer in case keep-alive connections delay process termination
    setTimeout(() => {
      console.warn('[WARN] Forcefully exiting after shutdown timeout.');
      process.exit(0);
    }, 1500).unref();
  } catch (err) {
    console.error('[ERROR] Error during graceful shutdown:', err);
    process.exit(1);
  }
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
