import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import brandProfilesRoutes from './routes/brandProfiles.js';
import brandProfileAgentRoutes from './routes/brandProfileAgent.js';
import xeoBlogAgentRoutes from './routes/xeoBlogAgent.js';
import xeoBlogsRoutes from './routes/xeoBlogs.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const clientOrigin = process.env.CLIENT_ORIGIN;
if (!clientOrigin) {
  console.error('CLIENT_ORIGIN env variable is required');
  process.exit(1);
}
app.use(cors({ origin: clientOrigin }));
app.use(express.json());

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:");
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/brand-profiles', brandProfilesRoutes);
app.use('/api/brand-profile-agent', brandProfileAgentRoutes);
app.use('/api/xeo-blog-agent', xeoBlogAgentRoutes);
app.use('/api/xeo-blogs', xeoBlogsRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  // No sensitive info logged - only port
  console.log(`Server running on port ${PORT}`);
});
