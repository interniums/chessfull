const Message = require('../models/MessageModel')
const Conversation = require('../models/ConversationModel')
const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose')

const getMessage = asyncHandler(async (req, res, next) => {
  const { conversationId } = req.params
  if (!conversationId) {
    return res.status(400).json({ message: 'Invalid data' })
  }

  const messages = await Message.find({
    conversationId: conversationId,
  })
    .populate('sender', 'username')
    .sort({ createdAt: 1 })
  if (!messages) {
    return res.status(404).json({ message: 'No messages found' })
  }
  return res.json(messages)
})

const getConverstation = asyncHandler(async (req, res, next) => {
  const { userId } = req.params
  if (!userId) {
    return res.status(400).json({ message: 'Invalid data' })
  }

  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate('participants', 'username')
    .populate('lastMessage')
    .sort({ updatedAt: -1 })
  if (!conversations) {
    return res.status(101).json({ message: 'Invalid id or no conversatitons' })
  }

  return res.status(200).json(conversations)
})

const createConversation = asyncHandler(async (req, res, next) => {
  const { id1, id2 } = req.body
  if (!id1 || !id2) {
    return res.status(400).json({ message: 'Invalid data' })
  }

  const newConversation = new Conversation({ participants: [id1, id2] })
  await newConversation.save()

  return res.status(200).json(newConversation)
})

module.exports = {
  getMessage,
  getConverstation,
  createConversation,
}
