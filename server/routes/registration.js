const express = require('express')
const router = express.Router()
const registrationController = require('../controllers/registrationController')

router.get('/', registrationController.registrationHandler)

module.exports = router
