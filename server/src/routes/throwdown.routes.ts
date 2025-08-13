import { Router } from 'express';
import { getThrowdowns, getThrowdownById } from '../controllers/throwdown.controller';

const router = Router();

// GET /api/throwdowns?page=1&limit=10

// List all throwdowns
router.get('/', getThrowdowns);

// Get single throwdown by id
router.get('/:id', getThrowdownById);

export default router;
