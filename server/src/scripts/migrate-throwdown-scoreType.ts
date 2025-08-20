// migrate-throwdown-scoreType.ts
// This script updates all throwdown documents to reference a valid ScoreType ObjectId.
// Usage: npx ts-node server/src/scripts/migrate-throwdown-scoreType.ts

import mongoose from 'mongoose';
import Throwdown from '../models/throwdown.model';
import ScoreType from '../models/scoreType.model';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rxthrowdown';

async function migrate() {
  await mongoose.connect(MONGO_URI);
  const scoreTypes = await ScoreType.find();
  if (!scoreTypes.length) {
    console.error('No score types found. Migration aborted.');
    process.exit(1);
  }
  const throwdowns = await Throwdown.find();
  for (const td of throwdowns) {
    let updated = false;
    if (Array.isArray(td.workouts)) {
      for (let i = 0; i < td.workouts.length; i++) {
        const workout = td.workouts[i];
        const valid = scoreTypes.some(st => (st._id as mongoose.Types.ObjectId).equals(workout.scoreType as mongoose.Types.ObjectId));
        if (!valid) {
          const randomScoreType = scoreTypes[Math.floor(Math.random() * scoreTypes.length)];
          workout.scoreType = randomScoreType._id as mongoose.Types.ObjectId;
          updated = true;
          console.log(`Updated throwdown ${td._id} workout ${i} with scoreType ${randomScoreType.name}`);
        }
      }
      if (updated) await td.save();
    }
  }
  console.log('Migration complete.');
  mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
