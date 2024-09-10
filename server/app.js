var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var connectDB = require('./config/db')
var cors = require('cors')
var corsOptions = require('./config/cors-options')
var jwtVerify = require('./middleware/jwtVerify')
var credentials = require('./middleware/credentials')

var indexRouter = require('./routes/index')
var userRouter = require('./routes/user')
var refreshRouter = require('./routes/refresh')
var logoutRouter = require('./routes/logout')
var loginRouter = require('./routes/login')
var registrationRouter = require('./routes/registration')

var app = express()

connectDB()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.set('trust proxy', true)

app.use(credentials)
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/refresh', refreshRouter)
app.use('/logout', logoutRouter)
app.use('/login', loginRouter)
app.use('/registration', registrationRouter)

// PROTECTED ROUTES
app.use(jwtVerify)
app.use('/user', userRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
