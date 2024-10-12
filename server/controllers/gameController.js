const Room = require('../models/gameRoomModel')
const User = require('../models/userModel')
const asyncHandler = require('express-async-handler')

const getGameState = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  if (!id) {
    return res.status(400).json({ message: 'No id provided' })
  }

  const room = await Room.findOne({ id: id })
  console.log(room)
  if (!room) {
    return res.status(404).json({ message: 'Invalid id' })
  }

  const state = room.state
  const winner = room.winner
  const endState = room.endState
  const players = room.players
  const history = room.history

  return res.status(200).json({ state, winner, endState, players, history })
})

const getReconnectRoom = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  if (!id) {
    return res.status(400).json({ message: 'No id provided' })
  }

  const room = await Room.find({ 'players.id': id })
  if (!room) {
    console.log('no rooms to reconnect')
    return res.status(100).json({ message: 'No room to reconnect' })
  }
  const activeRooms = room.filter((room) => room.active)
  if (activeRooms.length < 1) {
    return res.status(100).json({ message: 'No room to reconnect' })
  }

  res.status(200).json({
    roomId: activeRooms[0].id,
    players: activeRooms[0].players,
    mode: activeRooms[0].mode,
    orientation: activeRooms[0].orientation,
  })
})

module.exports = {
  getGameState,
  getReconnectRoom,
}
