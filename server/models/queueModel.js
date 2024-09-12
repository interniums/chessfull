const mongoose = require('mongoose')

const QueueSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '',
  },
  blitz: {
    type: [String],
    default: [],
  },
  rapid: {
    type: [String],
    default: [],
  },
  bullet: {
    type: [String],
    default: [],
  },
})

module.exports = mongoose.model('Queue', QueueSchema)
