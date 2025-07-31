import { Router } from 'express';
import { signup, login, dashboard } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/dashboard', authenticate, dashboard);

export default router;