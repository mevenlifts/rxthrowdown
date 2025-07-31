"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log('[AUTH] Incoming request:', req.method, req.originalUrl);
    if (!authHeader) {
        console.log('[AUTH] No Authorization header');
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    console.log('[AUTH] Token:', token);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        console.log('[AUTH] Decoded user:', decoded);
        req.user = decoded;
        next();
    }
    catch (err) {
        console.log('[AUTH] Invalid token:', err);
        res.status(401).json({ message: 'Invalid token' });
    }
};
exports.authenticate = authenticate;
