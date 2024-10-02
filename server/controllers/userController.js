const User = require('../models/userModel')
const Room = require('../models/gameRoomModel')
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
      accountLevel: user.accountLevel,
    })
    .status(200)
})

const getProfile = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  if (!id) {
    return res.status(400).json({ message: 'Invalid id' })
  }

  const user = await User.findById(id)
  if (!user) {
    return res.status(404).json({ message: 'Invalid user id' })
  }

  const userRooms = await Room.find({
    players: { $elemMatch: { id: id } },
  })

  // Overall wins and win percentage
  const wins = userRooms.filter((room) => room.winner === id)
  const winPrecentage = (wins.length / userRooms.length) * 100 || 0

  // Blitz games and win percentage
  const blitzGames = userRooms.filter((room) => room.mode === 'blitz')
  const blitzWins = blitzGames.filter((room) => room.winner === id)
  const blitzWinPrecentage = (blitzWins.length / blitzGames.length) * 100 || 0

  // Bullet games and win percentage
  const bulletGames = userRooms.filter((room) => room.mode === 'bullet')
  const bulletWins = bulletGames.filter((room) => room.winner === id)
  const bulletWinPrecentage = (bulletWins.length / bulletGames.length) * 100 || 0

  // Rapid games and win percentage
  const rapidGames = userRooms.filter((room) => room.mode === 'rapid')
  const rapidWins = rapidGames.filter((room) => room.winner === id)
  const rapidWinPrecentage = (rapidWins.length / rapidGames.length) * 100 || 0

  console.log(user.joined)
  const joinedDate = new Date(user?.joined)
  const formattedDate = joinedDate.toLocaleDateString()

  res
    .json({
      name: user.username,
      blitzElo: user.blitzElo,
      bulletElo: user.bulletElo,
      rapidElo: user.rapidElo,
      accountLevel: user.accountLevel,
      gamesPlayed: userRooms?.length,
      winPrecentage: Math.round(winPrecentage),
      blitzGames: blitzGames?.length,
      blitzWinPrecentage: Math.round(blitzWinPrecentage),
      rapidGames: rapidGames?.length,
      rapidWinPrecentage: Math.round(rapidWinPrecentage),
      bulletGames: bulletGames?.length,
      bulletWinPrecentage: Math.round(bulletWinPrecentage),
      joined: formattedDate,
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
    pieceSet: req.body.pieceSet,
    board: req.body.board,
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
  getProfile,
}
