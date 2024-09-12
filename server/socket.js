const { Server } = require('socket.io')

const queues = {
  bullet: [],
  blitz: [],
  rapid: [],
}

function setupSocketIO(server) {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      allowedHeaders: ['Authorization'],
    },
  })

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id)

    // Handle joining a queue
    socket.on('joinQueue', (mode) => {
      if (!queues[mode]) {
        return
      }

      console.log(`User ${socket.id} joined ${mode} queue`)
      queues[mode].push(socket)

      // Match players if at least 2 are in the queue
      if (queues[mode].length >= 2) {
        const player1 = queues[mode].shift()
        const player2 = queues[mode].shift()
        const roomId = `${player1.id}-${player2.id}`

        player1.join(roomId)
        player2.join(roomId)

        // Notify both players that the game is starting
        io.to(roomId).emit('startGame', { roomId, players: [player1.id, player2.id], mode })
        console.log(`Game started between ${player1.id} and ${player2.id} in room ${roomId}`)
      }
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
      Object.keys(queues).forEach((mode) => {
        queues[mode] = queues[mode].filter((player) => player.id !== socket.id)
      })
    })
  })
}

module.exports = setupSocketIO
