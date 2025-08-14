import { Router } from 'express';
import { getThrowdowns, getThrowdownById, addParticipantToThrowdown, withdrawParticipantFromThrowdown } from '../controllers/throwdown.controller';
import { addScoreToParticipant } from '../controllers/throwdown.controller';

const router = Router();

// GET /api/throwdowns?page=1&limit=10

// List all throwdowns
router.get('/', getThrowdowns);

// Get single throwdown by id
router.get('/:id', getThrowdownById);

// Add participants to a throwdown
router.post('/:id/add-participant', addParticipantToThrowdown);

// Withdraw participant from a throwdown
router.post('/:id/withdraw-participant', withdrawParticipantFromThrowdown);

// Add score for a participant in a throwdown
router.post('/:id/add-score', addScoreToParticipant);

export default router;
