"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboard = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const signup = async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    try {
        const existing = await user_model_1.default.findOne({ email });
        if (existing)
            return res.status(400).json({ message: 'Email already in use' });
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const user = new user_model_1.default({ first_name, last_name, email, password: hashed });
        await user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
        // Return all user fields except password
        const userObj = user.toObject();
        delete userObj.password;
        res.status(201).json({ token, user: userObj });
    }
    catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    const { email, password } = req.body;
    console.log(`[LOGIN ATTEMPT] Email: ${email}`);
    try {
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            console.log(`[LOGIN FAIL] Email: ${email} - User not found`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        if (!user.password) {
            console.log(`[LOGIN FAIL] Email: ${email} - No password set`);
            return res.status(400).json({ message: 'User has no password set' });
        }
        const match = await bcryptjs_1.default.compare(password, user.password);
        if (!match) {
            console.log(`[LOGIN FAIL] Email: ${email} - Incorrect password`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
        // Return all user fields except password
        const userObj = user.toObject();
        delete userObj.password;
        console.log(`[LOGIN SUCCESS] Email: ${email} - User ID: ${user._id}`);
        res.json({ token, user: userObj });
    }
    catch (err) {
        console.log(`[LOGIN ERROR] Email: ${email} -`, err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
const dashboard = async (req, res) => {
    res.json({ message: 'Welcome to your RxThrowdown dashboard!', user: req.user });
};
exports.dashboard = dashboard;
