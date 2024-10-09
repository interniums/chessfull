const express = require('express')
const messageRoutes = express.Router()
const messageController = require('../controllers/messageController')

messageRoutes.route('/:conversationId').get(messageController.getMessage)

messageRoutes.route('/conversations/:userId').get(messageController.getConverstation)

messageRoutes.route('/conversations/new').post(messageController.createConversation)

messageRoutes.route('/conversations/:id/delete').delete(messageController.deleteConversation)

module.exports = messageRoutes
