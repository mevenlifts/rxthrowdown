// migrate-throwdown-scoreType.js
// This script updates all throwdown documents to reference a valid ScoreType ObjectId.
// Usage: node server/src/scripts/migrate-throwdown-scoreType.js

const mongoose = require('mongoose');
const Throwdown = require('../models/throwdown.model').default || require('../models/throwdown.model');
const ScoreType = require('../models/scoreType.model').default || require('../models/scoreType.model');

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
    // If scoreType is missing or invalid, assign a random valid scoreType
    const valid = scoreTypes.some(st => st._id.equals(td.scoreType));
    if (!valid) {
      const randomScoreType = scoreTypes[Math.floor(Math.random() * scoreTypes.length)];
      td.scoreType = randomScoreType._id;
      await td.save();
      console.log(`Updated throwdown ${td._id} with scoreType ${randomScoreType.name}`);
    }
  }
  console.log('Migration complete.');
  mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
