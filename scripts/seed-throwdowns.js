// Usage: node scripts/seed-throwdowns.js
require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');


// Minimal Gym schema
const gymSchema = new mongoose.Schema({
  name: String,
  location: String,
});
const Gym = mongoose.model('Gym', gymSchema, 'gyms');


// Minimal User schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String, // camelCase for compatibility
  lastName: String,  // camelCase for compatibility
  homeGym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym' },
});
const User = mongoose.model('User', userSchema, 'users');

// Minimal Throwdown schema
const throwdownSchema = new mongoose.Schema({
  name: String,
  startDate: Date,
  duration: Number,
  endDate: Date,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  workout: String,
  scale: String,
  participants: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, homeGym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym' }, score: Number }],
});
const Throwdown = mongoose.model('Throwdown', throwdownSchema, 'throwdowns');

async function main() {
  await mongoose.connect(process.env.MONGO_URI, {});
  console.log('Connected to MongoDB');


  // Ensure at least one gym exists
  let gym = await Gym.findOne();
  if (!gym) {
    gym = await Gym.create({ name: 'Demo Gym', location: 'Demo City' });
    console.log('Seeded demo gym');
  }

  // Fetch all users to use as participants
  const users = await User.find();
  if (users.length === 0) {
    console.error('No users found. Please seed users first.');
    process.exit(1);
  }
  const author = users[0];
  const homeGym = author.homeGym || gym._id;

  // Remove all throwdowns
  await Throwdown.deleteMany({});

  // List of 20 throwdown names
  const names = [
    'Spring Showdown', 'Summer Slam', 'Autumn Clash', 'Winter Warrior', 'Iron Gauntlet',
    'Power Surge', 'Battle of the Boxes', 'WOD Wars', 'The Open Throwdown', 'Hero Hustle',
    'Masters Mayhem', 'Rookie Rumble', 'Endurance Elite', 'Strength Summit', 'Metcon Madness',
    'Flex Fest', 'Grind Games', 'FitFest Challenge', 'Barbell Bash', 'Engine Invitational'
  ];
  const workouts = [
    '21-15-9 Deadlifts and Box Jumps',
    'AMRAP 20: 5 Pull-ups, 10 Push-ups, 15 Air Squats',
    'For time: 100 Burpees',
    '5 rounds: 400m Run, 15 Kettlebell Swings',
    'Chipper: 50 Wall Balls, 40 Sit-ups, 30 Box Jumps',
    'EMOM 12: 10 Cal Row, 10 Push Press',
    '3 rounds: 20 Lunges, 15 Pull-ups, 10 Power Cleans',
    'AMRAP 10: 10 Thrusters, 10 Burpees',
    'For time: 2k Row',
    'Ladder: 1-10 Clean & Jerk',
    '4 rounds: 25 Double Unders, 10 Toes-to-Bar',
    'AMRAP 15: 5 Muscle-ups, 10 Deadlifts',
    'For time: 50 Cal Bike',
    'Chipper: 100 DU, 50 Sit-ups, 25 HSPU',
    '5 rounds: 10 OHS, 10 Box Jumps',
    'AMRAP 8: 8 Snatches, 8 Pull-ups',
    'For time: 1 Mile Run',
    'Ladder: 2-20 Wall Balls',
    '3 rounds: 15 Burpees, 15 KBS',
    'AMRAP 12: 12 Push-ups, 12 Air Squats'
  ];
  const scales = ['beginner', 'intermediate', 'rx'];
  const throwdowns = names.map((name, i) => {
    const start = new Date(2025, 7, 1 + i * 2); // Aug 1, 2025 + i*2 days
    const duration = (i % 3) + 1;
    const end = new Date(start);
    end.setDate(start.getDate() + duration - 1);
    return {
      name,
      startDate: start,
      duration,
      endDate: end,
      author: author._id,
      workout: workouts[i % workouts.length],
      scale: scales[i % scales.length],
      participants: users.map(u => ({ user: u._id, score: Math.floor(Math.random() * 200) + 50 })),
    };
  });

  await Throwdown.insertMany(throwdowns);
  console.log('Seeded 20 throwdowns!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
