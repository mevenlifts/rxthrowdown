import mongoose from 'mongoose';
import ScoreType from '../models/scoreType.model';

const scoreTypes = [
  {
    name: 'rounds-reps',
    description: 'Rounds and reps. Highest rounds win, then most reps.',
    inputFields: ['rounds', 'reps'],
    compareLogic: 'roundsThenReps',
  },
  {
    name: 'time',
    description: 'Time (minutes and seconds). Fastest time wins.',
    inputFields: ['minutes', 'seconds'],
    compareLogic: 'lowest',
  },
  {
    name: 'reps',
    description: 'Total reps. Highest number wins.',
    inputFields: ['reps'],
    compareLogic: 'highest',
  },
];

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/rxthrowdown');
  await ScoreType.deleteMany({});
  await ScoreType.insertMany(scoreTypes);
  console.log('Score types seeded');
  await mongoose.disconnect();
}

seed();
