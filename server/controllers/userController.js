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
  const { id } = req.params
  if (!id) {
    return res.status(400).json({ message: 'Invalid id' })
  }

  const user = await User.findById(id)
  if (!user) {
    return res.status(404).json({ message: 'Invalid user id' })
  }

  res
    .json({
      name: user.username,
      blitzElo: user.blitzElo,
      bulletElo: user.bulletElo,
      rapidElo: user.rapidElo,
    })
    .status(200)
})

const changeUserPreferences = asyncHandler(async (req, res, next) => {
  if (!req.body.id) {
    return res.status(400).json({ message: 'No id provided' })
  }

  const user = await User.findById(req.body.id)
  if (!user) {
    return res.status(404).json({ message: 'No user found' })
  }

  const userPreferences = {
    pieceSpeedAnimation: req.body.pieceSpeedAnimation,
    pieceMoveType: req.body.pieceMoveType,
    premovesAllowed: req.body.premovesAllowed,
    queenPromotion: req.body.queenPromotion,
  }

  user.userPreferences = userPreferences
  const result = await user.save()

  res.status(200).json({ message: 'User updated' })
})

const getUserPreferences = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  if (!id) {
    return res.status(400).json({ message: 'Invalid id' })
  }

  const user = await User.findById(id)
  if (!user) {
    return res.status(404).json({ message: 'Invalid user id' })
  }

  res.status(200).json(user.userPreferences)
})

module.exports = {
  getAllUsers,
  getUser,
  changeUserPreferences,
  getUserPreferences,
}
