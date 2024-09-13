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
  color: {
    type: String,
    default: '',
  },
})

module.exports = mongoose.model('Room', RoomSchema)
