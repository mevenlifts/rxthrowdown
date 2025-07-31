import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  console.log('[AUTH] Incoming request:', req.method, req.originalUrl);
  if (!authHeader) {
    console.log('[AUTH] No Authorization header');
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('[AUTH] Token:', token);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[AUTH] Decoded user:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('[AUTH] Invalid token:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};