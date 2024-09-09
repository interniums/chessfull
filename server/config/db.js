const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const mongodb = process.env.MONGO_URI
mongoose.set('strictQuery', false)

const connectDB = async () => {
  await mongoose
    .connect(mongodb)
    .then(() => console.log('connected db'))
    .catch((err) => console.error('db connecting error', err))
}

module.exports = connectDB
