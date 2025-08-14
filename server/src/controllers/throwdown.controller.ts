import { Request, Response } from 'express';
import Throwdown from '../models/throwdown.model';

// GET /api/throwdowns/:id
export async function getThrowdownById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const throwdown = await Throwdown.findById(id)
      .populate('author', 'firstName lastName email')
      .populate({
        path: 'participants.user',
        select: 'firstName lastName email homeGym',
        populate: { path: 'homeGym', select: 'name' }
      });
    if (!throwdown) return res.status(404).json({ message: 'Throwdown not found' });
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
    if (!userId || typeof score !== 'number') {
      return res.status(400).json({ message: 'User ID and score required' });
    }
    const throwdown = await Throwdown.findById(id);
    if (!throwdown) return res.status(404).json({ message: 'Throwdown not found' });

    // Ensure participants is initialized
    if (!Array.isArray(throwdown.participants)) {
      throwdown.participants = [];
    }

    // Find participant and add score
    const participant = throwdown.participants.find(p => p.user.toString() === userId);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    if (!Array.isArray(participant.scores)) participant.scores = [];
    participant.scores.push(score);
    await throwdown.save();
    res.json({ message: 'Score added', throwdown });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}
// POST /api/throwdowns/:id/withdraw-participant
export async function withdrawParticipantFromThrowdown(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'No user ID provided' });
    }
    const throwdown = await Throwdown.findById(id);
    if (!throwdown) return res.status(404).json({ message: 'Throwdown not found' });

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
      return res.status(400).json({ message: 'No user IDs provided' });
    }
    const throwdown = await Throwdown.findById(id);
    if (!throwdown) return res.status(404).json({ message: 'Throwdown not found' });

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
        throwdown.participants!.push({ user: userId, scores: [0] });
      }
    });
    await throwdown.save();
    res.json({ message: 'Participants added (unknowns removed)', throwdown });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}
