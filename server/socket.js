const { Server } = require('socket.io')
const Room = require('./models/gameRoomModel')
const { v4: uuidV4 } = require('uuid')

const queues = {
  bullet: [],
  rapid: [],
  blitz: [],
}

const TIME_TO_RECONNECT = 20000

function setupSocketIO(server) {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      allowedHeaders: ['Authorization'],
    },
  })

  io.on('connection', async (socket) => {
    const dbId = socket.handshake.query.data
    console.log('A user connected:', socket.id, `database id: ${dbId}`)

    socket.on('joinQueue', async ({ gameMode, id }) => {
      queues[gameMode].push([socket, id, socket.id])
      console.log(`user ${id} joined ${gameMode} queue`)

      if (queues[gameMode].length >= 2) {
        const player1 = {
          socket: queues[gameMode][0][0],
          id: queues[gameMode][0][1],
          socketId: queues[gameMode][0][2],
        }
        queues[gameMode].shift()

        const player2 = {
          socket: queues[gameMode][0][0],
          id: queues[gameMode][0][1],
          socketId: queues[gameMode][0][2],
        }
        queues[gameMode].shift()

        const roomId = uuidV4()
        const chooseColor = () => (Math.random() < 0.5 ? 'white' : 'black')
        const orientation = chooseColor()

        const room = await Room.create({
          id: roomId,
          players: [player1.id, player2.id],
          mode: gameMode,
          orientation,
          socketId: [player1.socketId, player2.socketId],
        })

        player1.socket.join(roomId)
        player2.socket.join(roomId)

        io.to(roomId).emit('startGame', {
          roomId: roomId,
          players: room.players,
          mode: gameMode,
          orientation: room.orientation,
        })
        console.log(`${gameMode} game created in ${roomId} between ${player1.id} and ${player2.id}`)
      }

      socket.on('makeMove', ({ roomId, move }) => {
        console.log(`move ${move} in ${roomId}`)
        socket.to(roomId).emit('opponentMove', move)
      })
    })

    let timeToReconnect
    // handling reconnections
    const existingRooms = await Room.findOne({ players: { $in: [dbId] } })
    if (existingRooms) {
      const nonExistingSocket = existingRooms.socketId.includes(socket.id)
      if (existingRooms && !nonExistingSocket && existingRooms.active) {
        clearTimeout(timeToReconnect)
        console.log(`user ${dbId} reconnected`)
        socket.join(existingRooms.id)
      }
    }

    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id)
      const room = await Room.findOne({ socketId: { $in: [socket.id] } })

      if (room) {
        const withoutDisconnectedSocket = room.socketId.filter((id) => id !== socket.id)
        room.socketId = withoutDisconnectedSocket
        const updatedRoom = await room.save()
        console.log('without disconnected socket:', updatedRoom.socketId)
        io.to(withoutDisconnectedSocket[0]).emit('opponentDisconnected')

        timeToReconnect = setTimeout(async () => {
          room.active = false
          const roomInactive = await room.save()
          console.log('player don`t reconnected, room active: ', roomInactive.active)
        }, TIME_TO_RECONNECT)
      }
    })
  })
}

module.exports = setupSocketIO
