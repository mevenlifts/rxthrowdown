import mongoose from 'mongoose';
import Throwdown from '../models/throwdown.model';
import ScoreType from '../models/scoreType.model';
import User from '../models/user.model';

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/rxthrowdown');

  // Get all users
  const users = await User.find();
  // Get all score types
  const scoreTypes = await ScoreType.find();

  // Example: assign score types in round-robin fashion
  const throwdownData = [
    {
      name: 'RX Throwdown 1',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      duration: 7,
      workout: 'AMRAP 20: 5 pull-ups, 10 push-ups, 15 squats',
      scale: 'rx',
      author: users[0]._id,
      scoreType: scoreTypes[0]._id,
      participants: users.map(u => ({ user: u._id, score: 0 })),
    },
    {
      name: 'RX Throwdown 2',
      startDate: new Date(),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      duration: 5,
      workout: 'For time: 100 burpees',
      scale: 'intermediate',
      author: users[1]._id,
      scoreType: scoreTypes[1]._id,
      participants: users.map(u => ({ user: u._id, score: 0 })),
    },
    {
      name: 'RX Throwdown 3',
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      duration: 3,
      workout: 'Max reps in 10 minutes: kettlebell swings',
      scale: 'beginner',
      author: users[2]._id,
      scoreType: scoreTypes[2]._id,
      participants: users.map(u => ({ user: u._id, score: 0 })),
    },
  ];

  await Throwdown.deleteMany({});
  await Throwdown.insertMany(throwdownData);
  console.log('Throwdowns seeded');
  await mongoose.disconnect();
}

seed();
