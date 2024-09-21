const { Server } = require('socket.io')
const Room = require('./models/gameRoomModel')
const { v4: uuidV4 } = require('uuid')

const TIME_TO_RECONNECT = 20000
const queues = {
  bullet: [],
  rapid: [],
  blitz: [],
}

let winner
let timeToReconnect

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

    // Handle player joining a queue
    socket.on('joinQueue', async ({ gameMode, id }) => {
      if (queues[gameMode].some(([socketId]) => socketId === id)) {
        console.log('already in queue')
        return
      }

      queues[gameMode].push([socket, id, socket.id])
      console.log(`user ${id} joined ${gameMode} queue`)

      if (queues[gameMode].length >= 2) {
        startGame(gameMode)
      }
    })

    socket.on('move', async ({ roomId, move, fen }) => {
      await handleMove(roomId, move, fen)
    })

    // Reconnection logic
    handleReconnection(dbId, socket)

    socket.on('sendFen', async (data) => {
      const room = await Room.findOne({ id: data.roomId })

      room.state = data.fen
      room.save()
    })

    socket.on('offerDraw', async (data) => {
      console.log('draw offered')
      console.log(data)
      const room = await Room.findOne({ id: data.roomId })
      console.log('socket id', socket.id)
      console.log(room)

      const opponent = room.socketId.filter((id) => id !== data.socketId)
      socket.to(opponent[0]).emit('offerDraw')
    })

    socket.on('refuseDraw', async (data) => {
      console.log('draw refused')
      const room = await Room.findOne({ id: data.roomId })

      const opponent = room.socketId.filter((id) => id !== data.socketId)
      socket.to(opponent[0]).emit('drawRefused')
    })

    socket.on('acceptDraw', async (data) => {
      console.log('draw accepted')
      const room = await Room.findOne({ id: data.roomId })

      endGame(data.roomId, null, 'Draw by agreement')
    })

    // Handle socket disconnection
    socket.on('disconnect', async () => {
      handleSocketDisconnect(socket.id)
      await handleDisconnection(socket.id, dbId)
    })
  })

  async function startGame(gameMode) {
    const player1 = getPlayerFromQueue(gameMode)
    const player2 = getPlayerFromQueue(gameMode)

    const roomId = uuidV4()
    const orientation = Math.random() < 0.5 ? 'white' : 'black'

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

    console.log(`${gameMode} game created in ${roomId} between ${player1.id} and ${player2.id}`)
  }

  function getPlayerFromQueue(gameMode) {
    const player = {
      socket: queues[gameMode][0][0],
      id: queues[gameMode][0][1],
      socketId: queues[gameMode][0][2],
    }
    queues[gameMode].shift()
    return player
  }

  async function handleMove(roomId, move, fen) {
    const room = await Room.findOne({ id: roomId })
    room.state = fen
    await room.save()
    console.log(`move ${move} in ${roomId}`)
    io.to(roomId).emit('move', move)
  }

  async function handleReconnection(dbId, socket) {
    const existingRooms = await Room.find({ players: { $in: [dbId] } })

    const roomToReconnect = existingRooms.filter((item) => item.active)
    if (roomToReconnect.length) {
      if (roomToReconnect[0].socketId.includes(socket.id)) {
        return
      } else {
        console.log('calling reconnection')
        clearTimeout(timeToReconnect)
        await reconnectToRoom(roomToReconnect[0], socket)
      }
    }
  }

  async function reconnectToRoom(room, socket) {
    const roomToEdit = await Room.findById(room._id)
    roomToEdit.socketId.push(socket.id)
    socket.join(room.id)
    io.to(socket.id).emit('useFen')
    io.to(roomToEdit.socketId[0]).emit('opponentReconnected')
    console.log(`user reconnected`)

    await roomToEdit.save()
    const connectedSockets = io.sockets.adapter.rooms.get(room.id)
    console.log(connectedSockets)
  }

  function handleSocketDisconnect(socketId) {
    for (const [key, queue] of Object.entries(queues)) {
      const index = queue.findIndex((subArray) => subArray.includes(socketId))
      if (index !== -1) {
        queue.splice(index, 1)
        console.log(`Removed from ${key} queue`)
      }
    }
  }

  async function handleDisconnection(socketId, dbId) {
    console.log(`socket disconnected ${socketId}`)
    const room = await Room.findOne({ socketId: { $in: [socketId] } })
    if (!room) return

    room.socketId = room.socketId.filter((id) => id !== socketId)
    await room.save()
    io.to(room.socketId[0]).emit('opponentDisconnected')

    timeToReconnect = setTimeout(async () => {
      await endGame(room, dbId)
    }, TIME_TO_RECONNECT)
  }

  async function endGame(roomId, dbId, reason) {
    const room = await Room.findOne({ id: roomId })
    if (!room) {
      console.log('room to end the game not found')
      return
    }
    room.active = false

    if (dbId) {
      room.disconnected = dbId
      room.endState = 'Abandon'

      const winner = room.players.filter((id) => id !== dbId)
      room.winner = winner[0]
    }

    if (reason == 'Draw by agreement') {
      room.endState = 'Draw by agreement'
      room.winner = 'Draw'
    }

    const result = await room.save()

    io.to(roomId).emit('gameEnd', { winner: result.winner, endState: result.endState })
    console.log(`game eneded`)
  }
}

module.exports = setupSocketIO
