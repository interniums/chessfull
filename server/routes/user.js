const express = require('express')
const userRoutes = express.Router()
const userController = require('../controllers/userController')

userRoutes.route('/').get(userController.getAllUsers)

userRoutes.route('/:id').get(userController.getUser)

module.exports = userRoutes
