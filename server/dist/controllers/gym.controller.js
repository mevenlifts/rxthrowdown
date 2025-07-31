"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGyms = getGyms;
exports.addGym = addGym;
const gym_model_1 = __importDefault(require("../models/gym.model"));
// Get all gyms (for dropdown search)
async function getGyms(req, res) {
    try {
        const gyms = await gym_model_1.default.find().sort({ name: 1 });
        res.json(gyms);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}
// Add a new gym
async function addGym(req, res) {
    try {
        const { name, location } = req.body;
        if (!name)
            return res.status(400).json({ message: 'Name is required' });
        const gym = new gym_model_1.default({ name, location });
        await gym.save();
        res.status(201).json(gym);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}
