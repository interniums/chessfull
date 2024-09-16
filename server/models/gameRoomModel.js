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
  mode: {
    type: String,
    default: '',
  },
  state: {
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
})

module.exports = mongoose.model('Room', RoomSchema)
