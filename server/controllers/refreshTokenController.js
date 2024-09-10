const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies
  if (!cookies?.jwt) return res.sendStatus(401)
  const refreshToken = cookies.jwt

  const foundUser = await User.findOne({ refreshToken }).exec()
  if (!foundUser) return res.sendStatus(403) //Forbidden
  // evaluate jwt
  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err || foundUser.username !== decoded.username) return res.sendStatus(403)
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: decoded.username,
        },
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '10s' }
    )
    res.json({ accessToken })
  })
}

module.exports = { handleRefreshToken }
