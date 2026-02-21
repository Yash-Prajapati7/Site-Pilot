import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import connectDB from './config/db.js';

// ── Route imports ────────────────────────────────────────────────────────────
import authRoutes     from './routes/auth.js';
import projectRoutes  from './routes/projects.js';
import brandingRoutes from './routes/branding.js';
import tenantRoutes   from './routes/tenants.js';
import userRoutes     from './routes/users.js';

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
app.listen(PORT, () => {
  console.log(`✓ Site Pilot backend running on http://localhost:${PORT}`);
});
