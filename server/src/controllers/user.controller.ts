import { Request, Response } from 'express';
import User from '../models/user.model';
import mongoose from 'mongoose';

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

// Get current user profile
export async function getProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findById(userId).select('-password').populate('homeGym');
    console.log(`[User Profile] UserID: ${userId}`);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Add camelCase fields for frontend compatibility
    const userObj = user.toObject();
    // firstName and lastName are already camelCase in the schema
    // If homeGym is populated, add homeGymName for frontend
    if (userObj.homeGym && typeof userObj.homeGym === 'object' && (userObj.homeGym as any).name) {
      (userObj as any).homeGymName = (userObj.homeGym as any).name;
    }
    console.log('[User Profile] UserID:', userId, 'userObj:', userObj);
    res.json(userObj);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

// Update current user profile
export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { homeGym, birthdate, firstName, lastName, avatarUrl, bio, level } = req.body;
    console.log(`[User Update] UserID: ${userId}, homeGym: ${homeGym}, birthdate: ${birthdate}, firstName: ${firstName}, lastName: ${lastName}, avatarUrl: ${avatarUrl}, bio: ${bio}, level: ${level}`);
    const updateFields: any = {};
    if (typeof homeGym !== 'undefined') updateFields.homeGym = homeGym; // should be gym _id
    if (typeof birthdate !== 'undefined') updateFields.birthdate = birthdate;
    if (typeof firstName !== 'undefined') updateFields.firstName = firstName;
    if (typeof lastName !== 'undefined') updateFields.lastName = lastName;
    if (typeof avatarUrl !== 'undefined') updateFields.avatarUrl = avatarUrl;
    if (typeof bio !== 'undefined') updateFields.bio = bio;
    if (typeof level !== 'undefined') updateFields.level = level;
    const user = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password').populate('homeGym');
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Add camelCase fields for frontend compatibility
    const userObj = user.toObject();
    // firstName and lastName are already camelCase in the schema
    if (userObj.homeGym && typeof userObj.homeGym === 'object' && (userObj.homeGym as any).name) {
      (userObj as any).homeGymName = (userObj.homeGym as any).name;
    }
    res.json(userObj);
  } catch (err) {
    console.error('[User Update Error]', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// User model with mongoose schema
const userSchema = new mongoose.Schema({
  // ... other fields ...
  homeGym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym' },
  // ... other fields ...
});

// Removed duplicate User model export to prevent OverwriteModelError
