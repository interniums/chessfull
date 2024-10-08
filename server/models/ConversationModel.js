const mongoose = require('mongoose')

const conversationSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming you have a User model
    },
  ],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: {
      content: '',
    },
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
})

conversationSchema.index({ participants: 1 }) // Indexing for faster queries

module.exports = mongoose.model('Conversation', conversationSchema)
