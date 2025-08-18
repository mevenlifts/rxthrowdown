// POST /api/throwdowns
import ScoreType from '../models/scoreType.model';
export async function createThrowdown(req: Request, res: Response) {
  try {
    const { name, startDate, endDate, duration, workout, scale, author, scoreTypeId } = req.body;
    if (!name || !startDate || !endDate || !duration || !workout || !scale || !author || !scoreTypeId) {
      console.log('[CREATE THROWDOWN] Missing required fields:', { name, startDate, endDate, duration, workout, scale, author, scoreTypeId });
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Validate scoreType exists
    const scoreType = await ScoreType.findById(scoreTypeId);
    if (!scoreType) {
      console.log('[CREATE THROWDOWN] Invalid score type:', scoreTypeId);
      return res.status(400).json({ message: 'Invalid score type' });
    }
    const throwdown = await Throwdown.create({
      name,
      startDate,
      endDate,
      duration,
      workout,
      scale,
      author,
      scoreType: scoreType._id,
      participants: [],
    });
    res.status(201).json({ message: 'Throwdown created', throwdown });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}
import { Request, Response } from 'express';
import Throwdown from '../models/throwdown.model';

// GET /api/throwdowns/:id
export async function getThrowdownById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const throwdown = await Throwdown.findById(id)
      .populate('author', 'firstName lastName email')
      .populate('scoreType')
      .populate({
        path: 'participants.user',
        select: 'firstName lastName email homeGym',
        populate: { path: 'homeGym', select: 'name' }
      });
    if (!throwdown) {
      console.log('[GET THROWDOWN] Throwdown not found:', id);
      return res.status(404).json({ message: 'Throwdown not found' });
    }
    res.json(throwdown);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/throwdowns?page=1&limit=10
export async function getThrowdowns(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    const [throwdowns, total] = await Promise.all([
      Throwdown.find()
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'firstName lastName email'),
      Throwdown.countDocuments(),
    ]);

    res.json({
      throwdowns,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/throwdowns/:id/add-participant
// POST /api/throwdowns/:id/add-score
export async function addScoreToParticipant(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId, score } = req.body;
    console.log(`[ADD SCORE] throwdownId: ${id}, userId: ${userId}, score:`, score);
    if (!userId || !score) {
      console.log('[ADD SCORE] Missing userId or score:', { userId, score });
      return res.status(400).json({ message: 'User ID and score required' });
    }
    // Populate scoreType for validation
    const throwdown = await Throwdown.findById(id).populate('scoreType');
    if (!throwdown) {
      console.log('[ADD SCORE] Throwdown not found:', id);
      return res.status(404).json({ message: 'Throwdown not found' });
    }

    // Ensure participants is initialized
    if (!Array.isArray(throwdown.participants)) {
      throwdown.participants = [];
    }

    // Find participant and set score
    const participant = throwdown.participants.find(p => p.user.toString() === userId);
    if (!participant) {
      console.log('[ADD SCORE] Participant not found:', userId);
      return res.status(404).json({ message: 'Participant not found' });
    }

    // Validate score based on scoreType
    let scoreType = throwdown.scoreType;
    if (!scoreType) {
      await throwdown.populate('scoreType');
      scoreType = throwdown.scoreType;
    }
    if (!scoreType) {
      console.log('[ADD SCORE] Score type not found for throwdown:', id);
      return res.status(400).json({ message: 'Score type not found for throwdown' });
    }

    // ScoreType logic: rounds-reps, time, reps
    let scoreTypeName = '';
    if (scoreType && typeof (scoreType as any).name === 'string') {
      scoreTypeName = ((scoreType as any).name as string).toLowerCase();
    }
    if (scoreTypeName === 'rounds-reps') {
      // Expect score = { rounds: number, reps: number }
      if (
        typeof score !== 'object' ||
        typeof score.rounds !== 'number' ||
        typeof score.reps !== 'number'
      ) {
        console.log('[ADD SCORE] Invalid rounds-reps score:', score);
        return res.status(400).json({ message: 'Score must include rounds and reps as numbers' });
      }
      participant.score = { rounds: score.rounds, reps: score.reps };
    } else if (scoreTypeName === 'time') {
      // Expect score = { time: number }
      if (
        typeof score !== 'object' ||
        typeof score.time !== 'number'
      ) {
        console.log('[ADD SCORE] Invalid time score:', score);
        return res.status(400).json({ message: 'Score must include time as a number' });
      }
      participant.score = { time: score.time };
    } else if (scoreTypeName === 'reps') {
      // Expect score = { reps: number }
      if (
        typeof score !== 'object' ||
        typeof score.reps !== 'number'
      ) {
        console.log('[ADD SCORE] Invalid reps score:', score);
        return res.status(400).json({ message: 'Score must include reps as a number' });
      }
      participant.score = { reps: score.reps };
    } else if (scoreTypeName === 'lbs') {
      // Expect score = { lbs: number }
      if (
        typeof score !== 'object' ||
        typeof score.lbs !== 'number'
      ) {
        console.log('[ADD SCORE] Invalid lbs score:', score);
        return res.status(400).json({ message: 'Score must include lbs as a number' });
      }
      participant.score = { lbs: score.lbs };
    } else {
      // Fallback: just store score as-is
      participant.score = score;
    }

    try {
      await throwdown.save();
      console.log('[ADD SCORE] Score added successfully');
      res.json({ message: 'Score added', throwdown });
    } catch (saveErr) {
      console.error('[ADD SCORE] Error saving throwdown:', saveErr);
      res.status(400).json({ message: 'Error saving score to database' });
    }
  } catch (err) {
    console.error('[ADD SCORE ERROR]', err);
    res.status(500).json({ message: 'Server error' });
  }
}
// POST /api/throwdowns/:id/withdraw-participant
export async function withdrawParticipantFromThrowdown(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) {
      console.log('[WITHDRAW PARTICIPANT] No user ID provided');
      return res.status(400).json({ message: 'No user ID provided' });
    }
    const throwdown = await Throwdown.findById(id);
    if (!throwdown) {
      console.log('[WITHDRAW PARTICIPANT] Throwdown not found:', id);
      return res.status(404).json({ message: 'Throwdown not found' });
    }

    // Ensure participants is initialized
    if (!Array.isArray(throwdown.participants)) {
      throwdown.participants = [];
    }

    // Remove the participant with matching userId
    throwdown.participants = throwdown.participants.filter(p => p.user.toString() !== userId);
    await throwdown.save();
    res.json({ message: 'Participant withdrawn', throwdown });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}
import User from '../models/user.model';
import mongoose from 'mongoose';
export async function addParticipantToThrowdown(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userIds } = req.body; // expects array of user IDs or a single user ID
    if (!userIds || (Array.isArray(userIds) && userIds.length === 0)) {
      console.log('[ADD PARTICIPANT] No user IDs provided:', userIds);
      return res.status(400).json({ message: 'No user IDs provided' });
    }
    const throwdown = await Throwdown.findById(id);
    if (!throwdown) {
      console.log('[ADD PARTICIPANT] Throwdown not found:', id);
      return res.status(404).json({ message: 'Throwdown not found' });
    }

    // Ensure participants is initialized
    if (!Array.isArray(throwdown.participants)) {
      throwdown.participants = [];
    }

    // Remove participants whose user does not exist
    const validUsers: { _id: mongoose.Types.ObjectId }[] = await User.find({}, '_id');
    const validUserIds = validUsers.map(u => u._id.toString());
    throwdown.participants = throwdown.participants ? throwdown.participants.filter(p => validUserIds.includes(p.user.toString())) : [];

    // Normalize to array
    const ids = Array.isArray(userIds) ? userIds : [userIds];
    // Add each user as a participant if not already present
    throwdown.participants = throwdown.participants || [];
    ids.forEach(userId => {
      if (!throwdown.participants!.some(p => p.user.toString() === userId)) {
        throwdown.participants!.push({ user: userId, score: 0 });
      }
    });
    await throwdown.save();
    res.json({ message: 'Participants added (unknowns removed)', throwdown });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}
