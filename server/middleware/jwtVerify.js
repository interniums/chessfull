const jwt = require('jsonwebtoken')

const jwtVerify = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Invalid token.' })
  }

  const token = authHeader.split(' ')[1]
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403)
    req.email = decoded.email
    req.id = decoded.id
    next()
  })
}

module.exports = jwtVerify
