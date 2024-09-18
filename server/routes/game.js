const express = require('express')
const router = express.Router()
const gameController = require('../controllers/gameController')

router.get('/state/:id', gameController.getGameState)

router.get('/reconnect/:id', gameController.getReconnectRoom)

module.exports = router
