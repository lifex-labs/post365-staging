import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All routes below require a valid JWT
router.use(requireAuth);

router.get('/posts', async (req, res) => {
  // Placeholder - replace with DB query using Promise.all for parallel I/O
  res.json({ posts: [] });
});

router.get('/roadmap', async (req, res) => {
  res.json({ features: [] });
});

export default router;
