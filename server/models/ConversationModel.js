const mongoose = require('mongoose')
const Message = require('./MessageModel')

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
    default: null,
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
})

conversationSchema.index({ participants: 1 })
conversationSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    // Delete all messages associated with the conversation
    await Message.deleteMany({ conversationId: doc._id })
  }
})

module.exports = mongoose.model('Conversation', conversationSchema)
