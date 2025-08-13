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
import { Request, Response } from 'express';
import Throwdown from '../models/throwdown.model';

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
