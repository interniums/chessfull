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
  let timeToReconnect
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      allowedHeaders: ['Authorization'],
    },
  })

  io.on('connection', async (socket) => {
    // line for clearing rooms
    // const deleteRooms = await Room.deleteMany()
    let gameActive
    let winner

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
          disconnected: '',
          mode: gameMode,
          orientation,
          socketId: [player1.socketId, player2.socketId],
          active: true,
        })

        player1.socket.join(roomId)
        player2.socket.join(roomId)

        io.to(roomId).emit('startGame', {
          roomId: roomId,
          players: room.players,
          mode: gameMode,
          orientation: room.orientation,
        })
        gameActive = true
        console.log(`${gameMode} game created in ${roomId} between ${player1.id} and ${player2.id}`)
      }

      socket.on('makeMove', ({ roomId, move }) => {
        console.log(`move ${move} in ${roomId}`)
        socket.to(roomId).emit('opponentMove', move)
      })
    })

    // handling reconnections
    const existingRooms = await Room.find({ players: { $in: [dbId] } })
    if (existingRooms) {
      if (existingRooms.forEach((item) => item.socketId.includes(socket.id))) {
        console.log('reconnection not needed')
        return
      } else {
        const roomToReconnect = existingRooms.filter((item) => item.active)
        if (roomToReconnect.length >= 1) {
          clearTimeout(timeToReconnect)
          console.log(`user ${dbId} reconnected`)
          socket.join(roomToReconnect.id)
          io.to(roomToReconnect[0].socketId[0]).emit('opponentReconnected')

          const roomToEdit = await Room.findOne({ _id: roomToReconnect[0]._id })
          roomToEdit.socketId.push(socket.id)
          await roomToEdit.save()
        } else {
          console.log('no room to reconnect')
        }
      }
    }

    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id)
      const room = await Room.findOne({ socketId: { $in: [socket.id] } })

      if (room) {
        const withoutDisconnectedSocket = room.socketId.filter((id) => id !== socket.id)
        room.socketId = withoutDisconnectedSocket
        const updatedRoom = await room.save()
        io.to(withoutDisconnectedSocket[0]).emit('opponentDisconnected')

        const endGame = async () => {
          room.active = false
          room.disconnected = dbId
          const roomInactive = await room.save()
          console.log('room active state: ', roomInactive.active)

          winner = room.players.filter((item) => item !== dbId)
          io.to(room.id).emit('gameEnd', { winner: winner })
        }

        timeToReconnect = setTimeout(() => {
          endGame()
        }, TIME_TO_RECONNECT)
      }

      if (room?.socketId.length < 1 && !timeToReconnect) {
        room.active = false
        const closeRoom = await room.save()
        console.log(closeRoom)

        io.to(room.id).emit('gameEnd', { winner: winner })
      }
    })
  })
}

module.exports = setupSocketIO
