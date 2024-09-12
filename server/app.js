const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const createError = require('http-errors')
const http = require('http')
const connectDB = require('./config/db')
const corsOptions = require('./config/cors-options')
const jwtVerify = require('./middleware/jwtVerify')
const credentials = require('./middleware/credentials')
const cors = require('cors')
const setupSocketIO = require('./socket') // Modularized Socket.io setup

// Routers
const indexRouter = require('./routes/index')
const userRouter = require('./routes/user')
const refreshRouter = require('./routes/refresh')
const logoutRouter = require('./routes/logout')
const loginRouter = require('./routes/login')
const registrationRouter = require('./routes/registration')

const app = express()

// Middleware Setup
app.use(credentials)
app.use(cors(corsOptions))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Database Connection
connectDB()

// View Engine Setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.set('trust proxy', true)

// HTTP Server
const server = http.createServer(app)

// Setup Socket.io
setupSocketIO(server)

// Routes
app.use('/', indexRouter)
app.use('/refresh', refreshRouter)
app.use('/logout', logoutRouter)
app.use('/login', loginRouter)
app.use('/registration', registrationRouter)

// Protected Routes
app.use(jwtVerify)
app.use('/user', userRouter)

// Catch 404 and Forward to Error Handler
app.use(function (req, res, next) {
  next(createError(404))
})

// Error Handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
