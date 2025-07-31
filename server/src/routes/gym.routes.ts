import { Router } from 'express';
import { getGyms, addGym } from '../controllers/gym.controller';

const router = Router();

router.get('/', getGyms);
router.post('/', addGym);

export default router;
