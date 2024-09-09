const User = require('../models/userModel')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

const registrationHandler = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Invalid data' })
  }

  const dublicateEmail = await User.findOne({ email }).lean().exec()
  if (dublicateEmail) {
    return res.status(409).json({ message: 'Email already registred' })
  }
  const dublicateUsername = await User.findOne({ username }).lean().exec()
  if (dublicateUsername) {
    return res.status(409).json({ message: 'Username already taken' })
  }

  const hash = await bcrypt.hash(password, 10)
  if (!hash) {
    return res.status(400).json({ message: 'Error with hashing password' })
  }

  const user = await User.create({ username, email, password: hash })
  if (!user) {
    return res.status(400).json({ message: 'Error with creating user' })
  }
  res.status(200).json({ message: `New user created. ID: ${user._id}` })
})

module.exports = {
  registrationHandler,
}
