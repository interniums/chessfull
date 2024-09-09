const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  gamesPlayed: {
    type: Number,
  },
  bulletElo: {
    type: Number,
    default: 1000,
  },
  blitzElo: {
    type: Number,
    default: 1000,
  },
  rapidElo: {
    type: Number,
    default: 1000,
  },
  timeSpent: {
    type: Number,
    default: 0,
  },
  premissions: {
    type: Boolean,
    default: false,
  },
  refreshToken: {
    type: String,
    default: '',
  },
})

module.exports = mongoose.model('User', UserSchema)
