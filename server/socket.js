const { Server } = require('socket.io')
const Queue = require('./models/queueModel')

function setupSocketIO(server) {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      allowedHeaders: ['Authorization'],
    },
  })

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id)

    socket.on('joinQueue', async ({ gameMode, id }) => {
      const q = await Queue.findOne({ name: 'mainQueue' })

      q[gameMode].push(id)
      console.log(`user ${id} joined ${gameMode} queue`)
    })
  })
}

module.exports = setupSocketIO
