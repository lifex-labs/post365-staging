import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

// Demo login - in production replace with real credential validation
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Demo check - replace with DB lookup + bcrypt compare in production
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const token = jwt.sign(
    { sub: 'demo-user', email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token });
});

export default router;
