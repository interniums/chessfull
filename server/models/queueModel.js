const mongoose = require('mongoose')

const QueueSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '',
  },
  blitz: {
    type: Array,
    default: [],
  },
  rapid: {
    type: Array,
    default: [],
  },
  bullet: {
    type: Array,
    default: [],
  },
})

module.exports = mongoose.model('Queue', QueueSchema)
