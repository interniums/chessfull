const User = require('../models/userModel')
const asyncHandler = require('express-async-handler')

const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find()

  if (!users) {
    return res.status(404).json({ message: 'Users not found' })
  }
  res.status(200).json(users)
})

module.exports = {
  getAllUsers,
}
