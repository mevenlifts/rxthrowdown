"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
const user_model_1 = __importDefault(require("../models/user.model"));
const mongoose_1 = __importDefault(require("mongoose"));
// Get current user profile
async function getProfile(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const user = await user_model_1.default.findById(userId).select('-password').populate('homeGym');
        console.log(`[User Profile] UserID: ${userId}`);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        // Add camelCase fields for frontend compatibility
        const userObj = user.toObject();
        // firstName and lastName are already camelCase in the schema
        // If homeGym is populated, add homeGymName for frontend
        if (userObj.homeGym && typeof userObj.homeGym === 'object' && userObj.homeGym.name) {
            userObj.homeGymName = userObj.homeGym.name;
        }
        console.log('[User Profile] UserID:', userId, 'userObj:', userObj);
        res.json(userObj);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}
// Update current user profile
async function updateProfile(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { homeGym, birthdate, firstName, lastName, avatarUrl, bio, level } = req.body;
        console.log(`[User Update] UserID: ${userId}, homeGym: ${homeGym}, birthdate: ${birthdate}, firstName: ${firstName}, lastName: ${lastName}, avatarUrl: ${avatarUrl}, bio: ${bio}, level: ${level}`);
        const updateFields = {};
        if (typeof homeGym !== 'undefined')
            updateFields.homeGym = homeGym; // should be gym _id
        if (typeof birthdate !== 'undefined')
            updateFields.birthdate = birthdate;
        if (typeof firstName !== 'undefined')
            updateFields.firstName = firstName;
        if (typeof lastName !== 'undefined')
            updateFields.lastName = lastName;
        if (typeof avatarUrl !== 'undefined')
            updateFields.avatarUrl = avatarUrl;
        if (typeof bio !== 'undefined')
            updateFields.bio = bio;
        if (typeof level !== 'undefined')
            updateFields.level = level;
        const user = await user_model_1.default.findByIdAndUpdate(userId, updateFields, { new: true, runValidators: true }).select('-password').populate('homeGym');
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        // Add camelCase fields for frontend compatibility
        const userObj = user.toObject();
        // firstName and lastName are already camelCase in the schema
        if (userObj.homeGym && typeof userObj.homeGym === 'object' && userObj.homeGym.name) {
            userObj.homeGymName = userObj.homeGym.name;
        }
        res.json(userObj);
    }
    catch (err) {
        console.error('[User Update Error]', err);
        res.status(500).json({ message: 'Server error' });
    }
}
// User model with mongoose schema
const userSchema = new mongoose_1.default.Schema({
    // ... other fields ...
    homeGym: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Gym' },
    // ... other fields ...
});
// Removed duplicate User model export to prevent OverwriteModelError
