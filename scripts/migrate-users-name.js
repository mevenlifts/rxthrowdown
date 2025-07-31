// Script to migrate existing users: split 'name' into 'firstName' and 'lastName' if needed
// Usage: node scripts/migrate-users-name.js

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/rxthrowdown').then(async () => {
  const users = await mongoose.connection.db.collection('user').find({}).toArray();
  console.log(users.length, 'users found');
  process.exit();
});

// In your model definition
// const UserSchema = new Schema({...}, { collection: 'users', timestamps: true });
// (Removed invalid/incomplete schema definition; not needed in this migration script)

module.exports = mongoose.model('User', UserSchema);
