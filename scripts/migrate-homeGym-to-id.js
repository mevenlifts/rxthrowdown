// This script migrates user.homeGym from string to ObjectId reference to gyms collection

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rxthrowdown';

const gymSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: String
});
const Gym = mongoose.model('Gym', gymSchema, 'gyms');

const userSchema = new mongoose.Schema({
  homeGym: mongoose.Schema.Types.Mixed // could be string or ObjectId
}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

async function migrate() {
  await mongoose.connect(MONGO_URI);
  // Find the 12th State Crossfit gym
  const gym = await Gym.findOne({ name: '12th State Crossfit' });
  if (!gym) {
    console.error('12th State Crossfit gym not found!');
    process.exit(1);
  }
  // Update all users to reference this gym
  const result = await User.updateMany({}, { homeGym: gym._id });
  console.log(`Updated ${result.modifiedCount || result.nModified} users to homeGym ${gym._id}`);
  await mongoose.disconnect();
  console.log('Migration complete.');
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
