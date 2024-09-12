const jwt = require('jsonwebtoken')

const jwtVerify = async (req, res, next) => {
  const authHeader = req.headers.authorization

  // Skip auth if 'skip-auth' is passed in the Authorization header
  if (authHeader && authHeader === 'skip-auth') {
    // console.log('Authorization skipped')
    return next()
  }

  // Check if Authorization header is missing or has incorrect format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Authorization failed: No token provided or invalid format')
    return res.status(401).json({ message: 'Invalid token.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    req.email = decoded.email
    req.id = decoded.id
    next() // Proceed to the next middleware if the token is valid
  } catch (err) {
    console.log('Token verification failed:', err.message)
    return res.sendStatus(403) // Forbidden if token is invalid
  }
}

module.exports = jwtVerify
