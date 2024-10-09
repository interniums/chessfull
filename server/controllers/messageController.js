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
    .sort({ updatedAt: 1 })
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

  const existingConversation = await Conversation.findOne({
    participants: { $all: [id1, id2], $size: 2 }, // Ensures both participants exist in the conversation
  })

  // If a conversation exists, return it instead of creating a new one
  if (existingConversation) {
    return res.status(200)
  }

  const newConversation = new Conversation({ participants: [id1, id2] })
  await newConversation.save()

  const populatedConversation = await Conversation.findById(newConversation._id)
    .populate('participants', 'username')
    .populate('lastMessage')

  // Respond with the populated conversation
  return res.status(200).json(populatedConversation)
})

const deleteConversation = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  if (!id) {
    return res.status(400).json({ message: 'Invalid data' })
  }

  const deletedConversation = await Conversation.findByIdAndDelete(id)
  if (!deletedConversation) {
    return res.status(404).json({ message: 'Invalid id' })
  }

  return res.status(200).json({ message: 'Success' })
})

module.exports = {
  getMessage,
  getConverstation,
  createConversation,
  deleteConversation,
}
