const mongoose = require('mongoose')

const RoomSchema = new mongoose.Schema({
  id: {
    type: String,
    default: '',
  },
  winner: {
    type: String,
    default: '',
  },
  endState: {
    type: String,
    default: '',
  },
  mode: {
    type: String,
    default: '',
  },
  state: {
    type: String,
    default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  },
  history: {
    type: Array,
    default: [],
  },
  players: {
    type: Array,
    default: '',
  },
  orientation: {
    type: String,
    default: '',
  },
  socketId: {
    type: Array,
    default: [],
  },
  active: {
    type: Boolean,
    default: true,
  },
  disconnected: {
    type: String,
    default: '',
  },
  timer: {
    type: Object,
    default: {
      whiteTime: 99,
      blackTime: 99,
      activePlayer: 'white',
    },
  },
})

module.exports = mongoose.model('Room', RoomSchema)
