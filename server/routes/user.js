const express = require('express')
const userRoutes = express.Router()
const userController = require('../controllers/userController')

userRoutes.route('/').get(userController.getAllUsers)

userRoutes.route('/:id').get(userController.getUser)

userRoutes.route('/update/preferences').patch(userController.changeUserPreferences)

userRoutes.route('/:id/getPreferences').get(userController.getUserPreferences)

userRoutes.route('/:id/profile').get(userController.getProfile)

module.exports = userRoutes
