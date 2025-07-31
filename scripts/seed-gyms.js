// Usage: node scripts/seed-gyms.js
// Make sure MongoDB is running and update the MONGO_URI if needed

const mongoose = require('mongoose');

const gyms = [
  { name: 'CrossFit Invictus', location: 'San Diego, CA' },
  { name: 'Brick New York', location: 'New York, NY' },
  { name: 'NorCal CrossFit', location: 'San Jose, CA' },
  { name: 'Reebok CrossFit One', location: 'Boston, MA' },
  { name: 'CrossFit Mayhem', location: 'Cookeville, TN' },
  { name: 'DogTown CrossFit', location: 'Los Angeles, CA' },
  { name: 'CrossFit New England', location: 'Natick, MA' },
  { name: 'CrossFit Oahu', location: 'Honolulu, HI' },
  { name: 'CrossFit Central', location: 'Austin, TX' },
  { name: 'CrossFit Dallas Central', location: 'Dallas, TX' },
  { name: '12th State Crossfit', location: 'Raleigh, NC' }
];

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rxthrowdown';

const gymSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: String
});

const Gym = mongoose.model('Gym', gymSchema);


async function seed() {
  await mongoose.connect(MONGO_URI);
  // Wipe gyms table before seeding
  await Gym.deleteMany({});
  await Gym.insertMany(gyms);
  console.log('Gyms seeded!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
