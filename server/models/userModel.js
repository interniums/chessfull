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
  joined: {
    type: Date,
    default: Date.now(),
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
  avatar: {
    type: String,
    default: '',
  },
  friends: {
    type: Array,
    default: [],
  },
  friendsInvites: {
    type: Array,
    default: [],
  },
  accountLevel: {
    type: Number,
    default: 1,
  },
  userPreferences: {
    type: Object,
    default: {
      pieceSpeedAnimation: 300,
      pieceMoveType: 1,
      premovesAllowed: true,
      queenPromotion: false,
      pieceSet: 'cardinal',
      board: { lightSquare: '#eeeed2', darkSquare: '#769656', name: 'Green' },
    },
  },
  inGame: {
    type: Boolean,
    default: false,
  },
})

module.exports = mongoose.model('User', UserSchema)
