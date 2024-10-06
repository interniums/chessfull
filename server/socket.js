const { Server } = require('socket.io')
const Room = require('./models/gameRoomModel')
const User = require('./models/userModel')
const { v4: uuidV4 } = require('uuid')

const TIME_TO_RECONNECT = 20000
const queues = {
  bullet: [],
  rapid: [],
  blitz: [],
}
let games = {}
let timeToReconnect

async function setupSocketIO(server) {
  // await Room.deleteMany({})
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

    handleReconnection(dbId, socket)

    socket.on('move', async ({ roomId, move, fen }) => {
      await handleMove(roomId, move, fen)
    })

    socket.on('updateHistory', async (data) => {
      const room = await Room.findOne({ id: data.roomId })
      if (!room) {
        console.log('invalid roomId in history update')
        return
      }

      await Room.findByIdAndUpdate(room._id, { $set: { history: data.history } })
    })

    socket.on('gameInvite', ({ from, to, gamemode }) => {
      console.log('server got invite')
      io.emit('gameInviteForAll', { from, to, gamemode })
    })

    socket.on('sendFen', async (data) => {
      const room = await Room.findOne({ id: data.roomId })

      room.state = data.fen
      room.save()
    })

    socket.on('offerDraw', async (data) => {
      console.log('draw offered')
      socket.to(data.roomId).emit('offerDraw')
    })

    socket.on('refuseDraw', async (data) => {
      console.log('draw refused')
      socket.to(data.roomId).emit('drawRefused')
    })

    socket.on('acceptDraw', async (data) => {
      console.log('draw accepted')
      endGame(data.roomId, null, 'Draw by agreement', data.mode)
    })

    socket.on('resign', async (data) => {
      console.log(`user ${data?.id} resigned`)
      endGame(data.roomId, data.id, 'Resign', data.mode)
    })

    socket.on('checkmate', (data) => {
      console.log('game end due to checkmate', data)
      endGame(data.roomId, data.winner, 'Checkmate', data.mode)
    })

    socket.on('insufficient material', (data) => {
      console.log('game end due to insufficient material', data)
      endGame(data.roomId, '', 'insufficient material', data.mode)
    })

    socket.on('stalemate', (data) => {
      console.log('game end due to stalemate', data)
      endGame(data.roomId, '', 'stalemate', data.mode)
    })

    socket.on('threefold repetition', (data) => {
      console.log('game end due to threefold repetition', data)
      endGame(data.roomId, '', 'threefold repetition', data.mode)
    })

    socket.on('cancel queue', () => {
      console.log(`User ${socket.id} left queue`)
      handleSocketDisconnect(socket.id)
    })

    // Handle socket disconnection
    socket.on('disconnect', async () => {
      handleSocketDisconnect(socket.id)
      await handleDisconnection(socket.id, dbId)
    })
  })

  async function startGame(gameMode) {
    const timeControl = gameMode == 'bullet' ? 60 : gameMode == 'blitz' ? 180 : gameMode == 'rapid' ? 600 : 999

    const player1 = await getPlayerFromQueue(gameMode)
    const player2 = await getPlayerFromQueue(gameMode)

    const roomId = uuidV4()
    const orientation = Math.random() < 0.5 ? 'white' : 'black'

    const room = await Room.create({
      id: roomId,
      players: [
        { id: player1.id, name: player1.name, elo: player1.elo },
        { id: player2.id, name: player2.name, elo: player2.elo },
      ],
      disconnected: '',
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

    const playerInfo = [{ id: player1.id }, { id: player2.id }]
    games[roomId] = {
      whiteTime: timeControl,
      blackTime: timeControl,
      activePlayer: 'white',
      timerInterval: null,
    }
    startTimer(roomId, gameMode, orientation, playerInfo)

    console.log(`${gameMode} game created in ${roomId} between ${player1.id} and ${player2.id}`)
  }

  async function startTimer(roomId, mode, orientation, playerInfo) {
    const game = games[roomId]
    clearInterval(game?.timerInterval)

    const room = await Room.findOne({ id: roomId })
    if (!room) {
      console.log('no room finded with provided id')
      return
    }

    game.timerInterval = setInterval(async () => {
      if (game.activePlayer === 'white') {
        game.whiteTime = Math.max(game.whiteTime - 1, 0)
      } else {
        game.blackTime = Math.max(game.blackTime - 1, 0)
      }

      io.to(roomId).emit('timerUpdate', {
        whiteTime: game.whiteTime,
        blackTime: game.blackTime,
        activePlayer: game.activePlayer,
      })

      // Check for time expiry
      if (game.whiteTime === 0 || game.blackTime === 0) {
        clearInterval(game.timerInterval)
        const winner = game.whiteTime === 0 ? 'black' : 'white'
        const winnerId = orientation == winner ? playerInfo[0].id : playerInfo[1].id
        endGame(roomId, winnerId, 'time', mode)
      } else {
        room.timer = {
          whiteTime: game.whiteTime,
          blackTime: game.blackTime,
          activePlayer: game.activePlayer,
        }
        await room.save()
      }
    }, 1000)
  }

  async function getPlayerFromQueue(gameMode) {
    const getPlayer = await User.findById(queues[gameMode][0][1])
    if (!getPlayer) {
      console.log('invalid user id provided')
      return
    }

    const player = {
      socket: queues[gameMode][0][0],
      id: queues[gameMode][0][1],
      socketId: queues[gameMode][0][2],
      name: getPlayer.username,
      elo:
        gameMode == 'blitz'
          ? getPlayer.blitzElo
          : gameMode === 'rapid'
          ? getPlayer.rapidElo
          : gameMode === 'bullet'
          ? getPlayer.bulletElo
          : null,
    }
    queues[gameMode].shift()
    return player
  }

  async function handleMove(roomId, move, fen) {
    const room = await Room.findOne({ id: roomId })
    if (room.winner.length > 1) {
      return
    }

    const game = games[roomId]
    if (game.activePlayer === 'white') {
      game.activePlayer = 'black'
    } else {
      game.activePlayer = 'white'
    }

    room.state = fen
    await room.save()
    console.log(`move ${move} in ${roomId}`)
    io.to(roomId).emit('move', move)
  }

  async function handleReconnection(dbId, socket) {
    const existingRooms = await Room.find({ 'players.id': dbId })

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
    if (room.winner.length > 1) {
      return
    }

    room.socketId = room.socketId.filter((id) => id !== socketId)
    await room.save()
    io.to(room.socketId[0]).emit('opponentDisconnected')

    timeToReconnect = setTimeout(async () => {
      await endGame(room.id, dbId, '', room.mode)
    }, TIME_TO_RECONNECT)
  }

  async function endGame(roomId, dbId, reason, mode) {
    const game = games[roomId]
    clearInterval(game?.timerInterval)

    const room = await Room.findOne({ id: roomId })
    if (!room) {
      console.log('room to end the game not found')
      return
    }
    room.active = false

    // If a player abandoned the game
    if (dbId && reason !== 'Resign' && reason !== 'Checkmate') {
      room.disconnected = dbId
      room.endState = 'Abandon'

      const winner = room.players.find((player) => player.id !== dbId)
      room.winner = winner.id

      // Adjust ELO for the winner and the player who abandoned
      const winnerUser = await User.findById(winner.id)
      const loserUser = await User.findById(dbId)

      if (winnerUser && loserUser) {
        updateElo(winnerUser, loserUser, mode, true)
      }
    }

    if (reason == 'Resign') {
      const winner = room.players.find((player) => player.id !== dbId)

      room.endState = 'Resign'
      room.winner = winner.id

      const winnerUser = await User.findById(winner.id)
      const loserUser = await User.findById(dbId)

      if (winnerUser && loserUser) {
        updateElo(winnerUser, loserUser, mode, true)
      }
    }

    // If the game ended in a draw
    if (reason == 'Draw by agreement') {
      room.endState = 'Draw by agreement'
      room.winner = 'Draw'

      const player1 = await User.findById(room.players[0].id)
      const player2 = await User.findById(room.players[1].id)

      if (player1 && player2) {
        updateElo(player1, player2, mode, false)
      }
    }

    if (reason == 'Checkmate') {
      room.endState = 'Checkmate'
      room.winner = dbId

      const loserId = room.players.find((player) => player.id !== dbId)
      const loserUser = await User.findById(loserId.id)
      const winnerUser = await User.findById(dbId)
      if (winnerUser && loserUser) {
        updateElo(winnerUser, loserUser, mode, true)
      }
    }

    if (reason == 'insufficient material') {
      room.endState = 'Insufficient material'
      room.winner = 'Draw'

      const player1 = await User.findById(room.players[0].id)
      const player2 = await User.findById(room.players[1].id)
      if (player1 && player2) {
        updateElo(player1, player2, mode, false)
      }
    }

    if (reason == 'stalemate') {
      room.endState = 'Stalemate'
      room.winner = 'Draw'

      const player1 = await User.findById(room.players[0].id)
      const player2 = await User.findById(room.players[1].id)
      if (player1 && player2) {
        updateElo(player1, player2, mode, false)
      }
    }

    if (reason == 'threefold repetition') {
      room.endState = 'threefold repetition'
      room.winner = 'Draw'

      const player1 = await User.findById(room.players[0].id)
      const player2 = await User.findById(room.players[1].id)
      if (player1 && player2) {
        updateElo(player1, player2, mode, false)
      }
    }

    if (reason == 'time') {
      room.endState = 'time'
      room.winner = dbId

      const loserId = room.players.find((player) => player.id !== dbId)
      const loserUser = await User.findById(loserId.id)
      const winnerUser = await User.findById(dbId)
      if (winnerUser && loserUser) {
        updateElo(winnerUser, loserUser, mode, true)
      }
    }

    const result = await room.save()

    // Emit game end event to the clients
    io.to(roomId).emit('gameEnd', { winner: result.winner, endState: result.endState })
    console.log('game ended')

    const socketsInRoom = await io.in(roomId).fetchSockets() // Fetch all sockets in the room

    // Make all sockets leave the room
    socketsInRoom.forEach((socket) => {
      socket.leave(roomId)
    })
  }

  async function updateElo(player1, player2, mode, isWinLose) {
    const modes = {
      blitz: 'blitzElo',
      bullet: 'bulletElo',
      rapid: 'rapidElo',
    }

    const eloKey = modes[mode]

    if (isWinLose) {
      player1[eloKey] += 25
      player2[eloKey] -= 25
    } else {
      player1[eloKey] += 1
      player2[eloKey] += 1
    }

    await player1.save()
    await player2.save()
  }
}

module.exports = setupSocketIO
