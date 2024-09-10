const User = require('../models/userModel')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const handleLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Invalid data' })
  }

  const user = await User.findOne({ email }).exec()
  if (!user) {
    return res.status(404).json({ message: 'Invalid email' })
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    return res.status(400).json({ message: 'Invalid password' })
  }

  const accessToken = jwt.sign(
    {
      userInfo: {
        username: user.username,
      },
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '10s' }
  )

  const refreshToken = jwt.sign({ username: user.username }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })

  user.refreshToken = refreshToken
  const result = await user.save()

  res.clearCookie('jwt')
  res.cookie('jwt', refreshToken, {
    sameSite: false,
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  })

  res.json({ accessToken, username: result.username })
})

module.exports = { handleLogin }
