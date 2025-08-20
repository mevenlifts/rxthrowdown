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

  // New seed data matching updated model
  // Helper to get random score type
  const getScoreTypeId = (typeName: string) => scoreTypes.find(st => st.name === typeName)?._id || scoreTypes[0]?._id;
  // Helper to get random user
  const getUserId = (idx: number) => users[idx % users.length]?._id;
  // Helper to get random participants
  const getParticipants = (count: number) => {
    return users.slice(0, count).map(u => ({ user: u._id, score: 0 }));
  };

  const throwdownData = [
    // 4 throwdowns with at least 2 workouts
    {
      title: 'RX Classic',
      startDate: new Date(),
      duration: 30,
      author: getUserId(0),
      workouts: [
        {
          description: 'AMRAP 10: 10 Thrusters, 10 Pull-ups',
          timeCap: 10,
          scoreType: getScoreTypeId('reps'),
        },
        {
          description: 'Max Deadlift',
          timeCap: 5,
          scoreType: getScoreTypeId('lbs'),
        },
      ],
      videoRequired: true,
      scale: 'rx',
      participants: getParticipants(3),
    },
    {
      title: 'Intermediate Challenge',
      startDate: new Date(),
      duration: 20,
      author: getUserId(1),
      workouts: [
        {
          description: 'For time: 50 burpees',
          timeCap: 12,
          scoreType: getScoreTypeId('time'),
        },
        {
          description: 'Max Clean',
          timeCap: 6,
          scoreType: getScoreTypeId('lbs'),
        },
      ],
      videoRequired: false,
      scale: 'intermediate',
      participants: getParticipants(2),
    },
    {
      title: 'Beginner Double',
      startDate: new Date(),
      duration: 10,
      author: getUserId(2),
      workouts: [
        {
          description: 'AMRAP 8: 8 Air Squats, 8 Sit-ups',
          timeCap: 8,
          scoreType: getScoreTypeId('reps'),
        },
        {
          description: 'Max Plank Hold',
          timeCap: 5,
          scoreType: getScoreTypeId('time'),
        },
      ],
      videoRequired: false,
      scale: 'beginner',
      participants: getParticipants(2),
    },
    {
      title: 'RX Power Pair',
      startDate: new Date(),
      duration: 25,
      author: getUserId(3),
      workouts: [
        {
          description: 'AMRAP 12: 12 Deadlifts, 12 Box Jumps',
          timeCap: 12,
          scoreType: getScoreTypeId('reps'),
        },
        {
          description: 'Max Bench Press',
          timeCap: 7,
          scoreType: getScoreTypeId('lbs'),
        },
      ],
      videoRequired: true,
      scale: 'rx',
      participants: getParticipants(4),
    },
    // 6 more throwdowns with single workouts and varied scoring types
    {
      title: 'Speed RX',
      startDate: new Date(),
      duration: 7,
      author: getUserId(4),
      workouts: [
        {
          description: 'For time: 100 Double Unders',
          timeCap: 5,
          scoreType: getScoreTypeId('time'),
        },
      ],
      videoRequired: false,
      scale: 'rx',
      participants: getParticipants(2),
    },
    {
      title: 'Rep Battle',
      startDate: new Date(),
      duration: 12,
      author: getUserId(5),
      workouts: [
        {
          description: 'AMRAP 15: 15 Push-ups, 15 Sit-ups',
          timeCap: 15,
          scoreType: getScoreTypeId('reps'),
        },
      ],
      videoRequired: false,
      scale: 'intermediate',
      participants: getParticipants(3),
    },
    {
      title: 'Weight Challenge',
      startDate: new Date(),
      duration: 18,
      author: getUserId(6),
      workouts: [
        {
          description: 'Max Snatch',
          timeCap: 6,
          scoreType: getScoreTypeId('lbs'),
        },
      ],
      videoRequired: true,
      scale: 'rx',
      participants: getParticipants(2),
    },
    {
      title: 'Rounds & Reps',
      startDate: new Date(),
      duration: 14,
      author: getUserId(7),
      workouts: [
        {
          description: 'AMRAP 20: 20 Wall Balls, 20 Lunges',
          timeCap: 20,
          scoreType: getScoreTypeId('rounds-reps'),
        },
      ],
      videoRequired: false,
      scale: 'intermediate',
      participants: getParticipants(2),
    },
    {
      title: 'Beginner Burn',
      startDate: new Date(),
      duration: 9,
      author: getUserId(8),
      workouts: [
        {
          description: 'AMRAP 10: 10 Step-ups, 10 Sit-ups',
          timeCap: 10,
          scoreType: getScoreTypeId('reps'),
        },
      ],
      videoRequired: false,
      scale: 'beginner',
      participants: getParticipants(1),
    },
    {
      title: 'RX Endurance',
      startDate: new Date(),
      duration: 21,
      author: getUserId(9),
      workouts: [
        {
          description: 'For time: 5k Run',
          timeCap: 30,
          scoreType: getScoreTypeId('time'),
        },
      ],
      videoRequired: true,
      scale: 'rx',
      participants: getParticipants(2),
    },
  ];

  await Throwdown.deleteMany({});
  await Throwdown.insertMany(throwdownData);
  console.log('Throwdowns seeded');
  await mongoose.disconnect();
}

seed();
