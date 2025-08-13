import { Router } from 'express';
import { getThrowdowns, getThrowdownById, addParticipantToThrowdown } from '../controllers/throwdown.controller';

const router = Router();

// GET /api/throwdowns?page=1&limit=10

// List all throwdowns
router.get('/', getThrowdowns);

// Get single throwdown by id
router.get('/:id', getThrowdownById);

// Add participants to a throwdown
router.post('/:id/add-participant', addParticipantToThrowdown);

export default router;
