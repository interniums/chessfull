const express = require('express')
const userRoutes = express.Router()
const userController = require('../controllers/userController')

userRoutes.route('/').get(userController.getAllUsers)

userRoutes.route('/:id').get(userController.getUser)

userRoutes.route('/update/preferences').patch(userController.changeUserPreferences)

userRoutes.route('/:id/getPreferences').get(userController.getUserPreferences)

userRoutes.route('/:id/profile').get(userController.getProfile)

userRoutes.route('/:id/updatePwd').patch(userController.changePassword)

userRoutes.route('/:id/updateEmail').patch(userController.changeEmail)

userRoutes.route('/:id/updateUsername').patch(userController.changeUsername)

userRoutes.route('/:id/getFriends').get(userController.getFriends)

userRoutes.route('/:id/removeFriend').post(userController.removeFriend)

userRoutes.route('/:id/addFriend').post(userController.addFriend)

userRoutes.route('/:id/acceptFriend').post(userController.acceptFriend)

userRoutes.route('/:id/rejectFriend').post(userController.rejectFriend)

module.exports = userRoutes
