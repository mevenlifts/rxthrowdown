// Usage: node scripts/seed-users.js
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
  firstName: String,
  lastName: String,
  homeGym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym' },
});
const User = mongoose.model('User', userSchema, 'users');

async function main() {
  await mongoose.connect(process.env.MONGO_URI, {});
  console.log('Connected to MongoDB');

  // Ensure at least one gym exists
  let gym = await Gym.findOne();
  if (!gym) {
    gym = await Gym.create({ name: 'Demo Gym', location: 'Demo City' });
    console.log('Seeded demo gym');
  }

  // Remove all users
  await User.deleteMany({});

// Seed 10 users with hashed passwords
  const bcrypt = require('bcryptjs');
  const userDocs = [];
  for (let i = 1; i <= 10; i++) {
    const hashed = await bcrypt.hash('password', 10);
    userDocs.push({
      email: `user${i}@demo.com`,
      password: hashed,
      firstName: `User`,
      lastName: `${i}`,
      homeGym: gym._id,
    });
  }
  await User.insertMany(userDocs);
  console.log('Seeded 10 users!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
