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
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

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
