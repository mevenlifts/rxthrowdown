import { Request, Response } from 'express';
import Gym from '../models/gym.model';

// Get all gyms (for dropdown search)
export async function getGyms(req: Request, res: Response) {
  try {
    const gyms = await Gym.find().sort({ name: 1 });
    res.json(gyms);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

// Add a new gym
export async function addGym(req: Request, res: Response) {
  try {
    const { name, location } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const gym = new Gym({ name, location });
    await gym.save();
    res.status(201).json(gym);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}
