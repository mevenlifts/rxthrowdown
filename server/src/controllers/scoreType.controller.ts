import ScoreType from '../models/scoreType.model';
import { Request, Response } from 'express';

export async function getScoreTypes(req: Request, res: Response) {
  try {
    const scoreTypes = await ScoreType.find();
    res.json(scoreTypes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch score types' });
  }
}
