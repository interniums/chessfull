const express = require('express')
const userRoutes = express.Router()
const userController = require('../controllers/userController')

userRoutes.route('/').get(userController.getAllUsers)

module.exports = userRoutes
