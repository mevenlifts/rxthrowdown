// POST /api/throwdowns
import ScoreType from '../models/scoreType.model';
export async function createThrowdown(req: Request, res: Response) {
  try {
    const { title, startDate, duration, workouts, scale, author, videoRequired } = req.body;
    if (!title || !startDate || !duration || !workouts || !scale || !author) {
      console.log('[CREATE THROWDOWN] Missing required fields:', { title, startDate, duration, workouts, scale, author });
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Validate each workout's scoreType exists
    for (const workout of workouts) {
      if (!workout.scoreType) {
        return res.status(400).json({ message: 'Each workout must have a scoreType' });
      }
      const scoreType = await ScoreType.findById(workout.scoreType);
      if (!scoreType) {
        return res.status(400).json({ message: `Invalid score type for workout: ${workout.description}` });
      }
    }
    const throwdown = await Throwdown.create({
      title,
      startDate,
      duration,
      workouts,
      scale,
      author,
      videoRequired: !!videoRequired,
      participants: [],
    });
    res.status(201).json({ message: 'Throwdown created', throwdown });
  } catch (err) {
    console.error('[CREATE THROWDOWN ERROR]', err);
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
      .populate({
        path: 'workouts.scoreType',
        select: '_id name description',
      })
      .populate({
        path: 'participants.user',
        select: 'firstName lastName email homeGym',
        populate: { path: 'homeGym', select: 'name' }
      });
    if (!throwdown) {
      console.log('[GET THROWDOWN] Throwdown not found:', id);
      return res.status(404).json({ message: 'Throwdown not found' });
    }
    // Fetch all score types for fallback mapping
    const allScoreTypes: { _id: any; name: string }[] = await ScoreType.find({}, '_id name');
    const tdObj = throwdown.toObject();
    if (Array.isArray(tdObj.workouts)) {
      tdObj.workouts = tdObj.workouts.map(w => {
        let scoreTypeName = '';
        if (w.scoreType && typeof w.scoreType === 'object' && 'name' in w.scoreType && typeof w.scoreType.name === 'string') {
          scoreTypeName = w.scoreType.name;
        } else if (typeof w.scoreType === 'string' && /^[a-f\d]{24}$/.test(w.scoreType)) {
          // Find matching scoreType by ID
          const found = allScoreTypes.find(st => st._id.toString() === w.scoreType);
          scoreTypeName = found ? found.name : '';
        }
        return {
          ...w,
          scoreTypeName,
        };
      });
    }
    res.json(tdObj);
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
    const { userId, scores } = req.body;
    console.log(`[ADD SCORE] throwdownId: ${id}, userId: ${userId}, scores:`, scores);
    if (!userId || !scores || !Array.isArray(scores)) {
      console.log('[ADD SCORE] Missing userId or scores:', { userId, scores });
      return res.status(400).json({ message: 'User ID and scores array required' });
    }
    // Find throwdown and populate workouts.scoreType
    const throwdown = await Throwdown.findById(id).populate('workouts.scoreType');
    if (!throwdown) {
      console.log('[ADD SCORE] Throwdown not found:', id);
      return res.status(404).json({ message: 'Throwdown not found' });
    }

    // Ensure participants is initialized
    if (!Array.isArray(throwdown.participants)) {
      throwdown.participants = [];
    }

    // Find participant and set scores
    const participant = throwdown.participants.find(p => p.user.toString() === userId);
    if (!participant) {
      console.log('[ADD SCORE] Participant not found:', userId);
      return res.status(404).json({ message: 'Participant not found' });
    }

    // Validate scores array length matches workouts
    if (scores.length !== throwdown.workouts.length) {
      return res.status(400).json({ message: 'Scores array length must match number of workouts' });
    }

    // Validate and assign each score
    participant.scores = [];
    for (let i = 0; i < throwdown.workouts.length; i++) {
      const workout = throwdown.workouts[i];
      const scoreType = workout.scoreType;
      const score = scores[i];
      let scoreTypeName = '';
      if (scoreType && typeof (scoreType as any).name === 'string') {
        scoreTypeName = ((scoreType as any).name as string).toLowerCase();
      }
      // ScoreType logic: rounds-reps, time, reps, lbs
      if (scoreTypeName === 'rounds-reps') {
        if (
          typeof score !== 'object' ||
          typeof score.rounds !== 'number' ||
          typeof score.reps !== 'number'
        ) {
          return res.status(400).json({ message: `Score for workout ${i + 1} must include rounds and reps as numbers` });
        }
        participant.scores[i] = { rounds: score.rounds, reps: score.reps };
      } else if (scoreTypeName === 'time') {
        if (
          typeof score !== 'object' ||
          typeof score.time !== 'number'
        ) {
          return res.status(400).json({ message: `Score for workout ${i + 1} must include time as a number` });
        }
        participant.scores[i] = { time: score.time };
      } else if (scoreTypeName === 'reps') {
        if (
          typeof score !== 'object' ||
          typeof score.reps !== 'number'
        ) {
          return res.status(400).json({ message: `Score for workout ${i + 1} must include reps as a number` });
        }
        participant.scores[i] = { reps: score.reps };
      } else if (scoreTypeName === 'lbs') {
        if (
          typeof score !== 'object' ||
          typeof score.lbs !== 'number'
        ) {
          return res.status(400).json({ message: `Score for workout ${i + 1} must include lbs as a number` });
        }
        participant.scores[i] = { lbs: score.lbs };
      } else {
        participant.scores[i] = score;
      }
    }

    try {
      await throwdown.save();
      console.log('[ADD SCORE] Scores added successfully');
      res.json({ message: 'Scores added', throwdown });
    } catch (saveErr) {
      console.error('[ADD SCORE] Error saving throwdown:', saveErr);
      res.status(400).json({ message: 'Error saving scores to database' });
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
