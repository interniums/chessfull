const { Server } = require('socket.io')
const Room = require('./models/gameRoomModel')
const { v4: uuidV4 } = require('uuid')

const queues = {
  bullet: [],
  rapid: [],
  blitz: [],
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

    socket.on('joinQueue', async ({ gameMode, id }) => {
      queues[gameMode].push([socket, id])
      console.log(`user ${id} joined ${gameMode} queue`)

      if (queues[gameMode].length >= 2) {
        const player1 = {
          socket: queues[gameMode][0][0],
          id: queues[gameMode][0][1],
        }
        queues[gameMode].shift()
        const player2 = {
          socket: queues[gameMode][0][0],
          id: queues[gameMode][0][1],
        }
        queues[gameMode].shift()

        const roomId = uuidV4()
        const chooseColor = () => (Math.random() < 0.5 ? 'white' : 'black')
        const color = chooseColor()

        const room = await Room.create({
          id: roomId,
          players: [player1.id, player2.id],
          mode: gameMode,
          color,
        })

        player1.socket.join(roomId)
        player2.socket.join(roomId)

        io.to(roomId).emit('startGame', {
          id: roomId,
          players: room.players,
          mode: gameMode,
          color: room.color,
        })
        console.log(
          `${gameMode} game created in ${roomId} between ${player1.id} and ${player2.id}`
        )
      }
    })
  })
}

module.exports = setupSocketIO
