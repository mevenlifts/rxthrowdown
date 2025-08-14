import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const signup = async (req: Request, res: Response) => {
  // Accept both camelCase and snake_case for compatibility
  const firstName = req.body.firstName || req.body.first_name;
  const lastName = req.body.lastName || req.body.last_name;
  const { email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ firstName, lastName, email, password: hashed });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    // Return all user fields except password, and add camelCase fields for frontend
    const userObj = user.toObject();
    delete userObj.password;
    // firstName and lastName are already camelCase in the schema
    res.status(201).json({ token, user: userObj });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(`[LOGIN ATTEMPT] Email: ${email}`);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[LOGIN FAIL] Email: ${email} - User not found`);
      return res.status(400).json({ message: 'Invalid credentials email' });
    }

    if (!user.password) {
      console.log(`[LOGIN FAIL] Email: ${email} - No password set`);
      return res.status(400).json({ message: 'User has no password set' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log(`[LOGIN FAIL] Email: ${email} - Incorrect password`);
      return res.status(400).json({ message: 'Invalid credentials pwd' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    // Return all user fields except password, and add camelCase fields for frontend
    const userObj = user.toObject();
    delete userObj.password;
    // firstName and lastName are already camelCase in the schema
    console.log(`[LOGIN SUCCESS] Email: ${email} - User ID: ${user._id}`);
    res.json({ token, user: userObj });
  } catch (err) {
    console.log(`[LOGIN ERROR] Email: ${email} -`, err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const dashboard = async (req: AuthRequest, res: Response) => {
  res.json({ message: 'Welcome to your RxThrowdown dashboard!', user: req.user });
};