const allowedOrigins = require('./allowedOrigins')

const corsOptions = {
  origin: allowedOrigins,
  optionsSuccessStatus: 200,
  credentials: true,
}

module.exports = corsOptions
