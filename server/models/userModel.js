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
    default: [
      '66e4691593519af7091aff78',
      '66ffc921a41d74f61edd3597',
      '66ffc947a41d74f61edd35a5',
      '66ffc979cf24d6deafd4ef6f',
      '66ffc9b1cf24d6deafd4ef80',
      '66ffc9ffcf24d6deafd4ef91',
      '66ffca25cf24d6deafd4efa2',
      '66ffca4ccf24d6deafd4efb3',
      '66ffca89cf24d6deafd4efc5',
    ],
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
})

module.exports = mongoose.model('User', UserSchema)
