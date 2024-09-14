const User = require('../models/userModel')
const asyncHandler = require('express-async-handler')

const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find()

  if (!users) {
    return res.status(404).json({ message: 'Users not found' })
  }
  res.status(200).json(users)
})

const getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.body
  const user = await User.findById(id)
  if (!user) {
    return res.status(404).json({ message: 'Invalid user id' })
  }

  res
    .json({ name: user.username, blitzElo: user.blitzElo, bulletElo: user.bulletElo, rapidElo: user.rapidElo })
    .status(200)
})

module.exports = {
  getAllUsers,
  getUser,
}
