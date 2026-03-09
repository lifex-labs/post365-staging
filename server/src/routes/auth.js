import { Router } from 'express';

const router = Router();

// Auth is handled by Clerk. This endpoint is disabled.
router.post('/login', (_req, res) => {
  res.status(410).json({ error: 'This endpoint is disabled. Authentication is handled by Clerk.' });
});

export default router;
