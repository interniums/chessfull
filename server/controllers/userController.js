const User = require('../models/userModel')
const Room = require('../models/gameRoomModel')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

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

  const joinedDate = new Date(user?.joined)
  const formattedDate = joinedDate.toLocaleDateString()

  // user.friends = [
  //   // '66e4691593519af7091aff78',
  //   // '66d98bf297f5ce7332b067d7',
  //   // // '66e4691593519af7091aff78',
  //   // // '66d98bf297f5ce7332b067d7',
  //   // // '66e4691593519af7091aff78',
  //   // // '66d98bf297f5ce7332b067d7',
  //   // // '66e4691593519af7091aff78',
  //   // // '66d98bf297f5ce7332b067d7',
  //   // // '66e4691593519af7091aff78',
  //   // // '66d98bf297f5ce7332b067d7',
  //   // // '66e4691593519af7091aff78',
  //   // // '66d98bf297f5ce7332b067d7',
  //   // // '66e4691593519af7091aff78',
  //   // // '66d98bf297f5ce7332b067d7',
  //   // // '66e4691593519af7091aff78',
  //   // // '66d98bf297f5ce7332b067d7',
  //   // // '66e4691593519af7091aff78',
  //   // // '66d98bf297f5ce7332b067d7',
  // ]

  // await user.save()

  // user.friendsInvites = [
  //   '66e4691593519af7091aff78',
  //   '66d98bf297f5ce7332b067d7',
  //   // '66e4691593519af7091aff78',
  //   // '66d98bf297f5ce7332b067d7',
  //   // '66e4691593519af7091aff78',
  //   // '66d98bf297f5ce7332b067d7',
  //   // '66e4691593519af7091aff78',
  //   // '66d98bf297f5ce7332b067d7',
  //   // '66e4691593519af7091aff78',
  //   // '66d98bf297f5ce7332b067d7',
  //   // '66e4691593519af7091aff78',
  //   // '66d98bf297f5ce7332b067d7',
  //   // '66e4691593519af7091aff78',
  //   // '66d98bf297f5ce7332b067d7',
  //   // '66e4691593519af7091aff78',
  //   // '66d98bf297f5ce7332b067d7',
  //   // '66e4691593519af7091aff78',
  //   // '66d98bf297f5ce7332b067d7',
  // ]
  // await user.save()

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
      email: user.email,
      friends: user.friends,
      friendsInvites: user.friendsInvites,
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

const changePassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const { oldPassword, newPassword } = req.body

  console.log(oldPassword, newPassword, id)

  if (!oldPassword || !id || !newPassword) {
    return res.status(400).json({ mesage: 'Invalid data' })
  }

  const user = await User.findById(id)
  if (!user) {
    return res.status(404).json({ message: 'Invalid id' })
  }

  const match = await bcrypt.compare(oldPassword, user.password)
  if (!match) {
    return res.status(401).json({ message: 'Invalid password' })
  }

  const hash = await bcrypt.hash(newPassword, 10)
  if (!hash) {
    return res.status(400).json({ message: 'Error with hashing password' })
  }

  user.password = hash
  const result = await user.save()
  return res.status(200).json({ message: 'Successs' })
})

const changeEmail = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const { email } = req.body

  if (!email || !id) {
    return res.status(400).json({ mesage: 'Invalid data' })
  }

  const user = await User.findById(id)
  if (!user) {
    return res.status(404).json({ message: 'Invalid id' })
  }

  if (email == user.email) {
    return res.status(401).json({ message: 'Dublicate email' })
  }
  const dublicateEmail = await User.findOne({ email }).lean().exec()
  if (dublicateEmail) {
    return res.status(409).json({ message: 'Email already registred' })
  }

  user.email = email
  const result = await user.save()
  return res.status(200).json({ message: 'Successs' })
})

const changeUsername = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const { name } = req.body

  if (!name || !id) {
    return res.status(400).json({ mesage: 'Invalid data' })
  }

  const user = await User.findById(id)
  if (!user) {
    return res.status(404).json({ message: 'Invalid id' })
  }

  if (name == user.username) {
    return res.status(401).json({ message: 'Dublicate name' })
  }
  const dublicateName = await User.findOne({ username: name }).lean().exec()
  if (dublicateName) {
    return res.status(409).json({ message: 'Username already registred' })
  }

  user.username = name
  const result = await user.save()
  return res.status(200).json({ message: 'Successs' })
})

const getFriends = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  if (!id) {
    return res.status(400).json({ message: 'Invalid data' })
  }

  const user = await User.findById(id)
  if (!user) {
    return res.status(404).json({ message: 'User nor found' })
  }

  const userFriendsInfo = []
  const userInvitesInfo = []

  const getFriendInfo = async (id, mode) => {
    try {
      const user = await User.findById(id)
      if (!user) {
        return
      }

      if (mode === 'friends') {
        userFriendsInfo.push({ accountLevel: user.accountLevel, id: user._id, name: user.username })
      }
      if (mode === 'invites') {
        userInvitesInfo.push({ accountLevel: user.accountLevel, id: user._id, name: user.username })
      }
    } catch (err) {
      console.error('Error fetching friend info:', err)
    }
  }

  const getAllFriendsInfo = async () => {
    for (const friendId of user.friends) {
      await getFriendInfo(friendId, 'friends')
    }
    for (const inviteId of user.friendsInvites) {
      await getFriendInfo(inviteId, 'invites')
    }
    return res.json({ userFriendsInfo, userInvitesInfo }).status(200)
  }
  getAllFriendsInfo()
})

const addFriend = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const { friendId } = req.body
  if (!id || !friendId) {
    return res.status(400).json({ message: 'Invalid data' })
  }

  const user = await User.findById(friendId)
  if (!user) {
    return res.status(404).json({ message: 'Invalid id' })
  }

  if (user.friendsInvites.includes(id)) {
    return res.status(101).json({ message: 'Invite already sent' })
  }

  user.friendsInvites.push(id)
  await user.save()
  return res.status(200).json({ message: 'Success' })
})

const removeFriend = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const { deleteId } = req.body
  console.log(id, deleteId)

  if (!id || !deleteId) {
    return res.status(400).json({ message: 'Invalid data' })
  }

  const user = await User.findById(id)
  if (!user) {
    return res.status(404).json({ message: 'Invalid id' })
  }
  const deleteUser = await User.findById(deleteId)
  if (!user) {
    return res.status(400).json({ message: 'Invalid id' })
  }

  const newFriends = user.friends.filter((item) => item !== deleteId)
  const newDeleteUserFriends = deleteUser.friends.filter((item) => item !== id)

  deleteUser.friends = newDeleteUserFriends
  user.friends = newFriends
  await user.save()
  await deleteUser.save()
  return res.status(200).json({ message: 'success' })
})

const acceptFriend = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const { acceptedId } = req.body
  if (!id || !acceptedId) {
    return res.status(400).json({ message: 'Invalid data' })
  }

  const user = await User.findById(id)
  if (!user) {
    return res.status(404).json({ message: 'Invalid id' })
  }
  const acceptedUser = await User.findById(acceptedId)
  if (!acceptedUser) {
    return res.status(404).json({ message: 'Invalid id' })
  }

  user.friendsInvites = user.friendsInvites.filter((item) => item !== acceptedId)
  user.friends.push(acceptedId)
  await user.save()

  acceptedUser.friends.push(id)
  await acceptedUser.save()

  return res.status(200).json({ message: 'Success' })
})

const rejectFriend = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const { rejectedId } = req.body

  if (!id || !rejectedId) {
    return res.status(400).json({ message: 'Invalid data' })
  }

  const user = await User.findById(id)
  if (!user) {
    return res.status(404).json({ message: 'Invalid id' })
  }

  console.log(user.friendsInvites.filter((item) => item !== rejectedId))

  user.friendsInvites = user.friendsInvites.filter((item) => item !== rejectedId)
  await user.save()

  return res.status(200).json({ message: 'Success' })
})

const userSearch = asyncHandler(async (req, res, next) => {
  const { input } = req.body
  if (!input) {
    return res.status(400).json({ message: 'Invalid data' })
  }

  const users = await User.find({ username: new RegExp(input, 'i') }).select('username _id accountLevel')

  if (!users) {
    return res.status(404).json({ message: 'No users found' })
  }

  return res.json(users).status(200)
})

module.exports = {
  getAllUsers,
  getUser,
  changeUserPreferences,
  getUserPreferences,
  getProfile,
  changePassword,
  changeEmail,
  changeUsername,
  getFriends,
  removeFriend,
  addFriend,
  acceptFriend,
  rejectFriend,
  userSearch,
}
