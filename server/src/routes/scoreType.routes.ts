import { Router } from 'express';
import { getScoreTypes } from '../controllers/scoreType.controller';

const router = Router();

router.get('/', getScoreTypes);

export default router;
