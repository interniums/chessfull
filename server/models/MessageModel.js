const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // User who sent the message
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
})

messageSchema.index({ conversationId: 1, createdAt: -1 }) // Index for fetching messages in order

module.exports = mongoose.model('Message', messageSchema)
