const express = require('express')
const router = express.Router()
const playlistController = require('../controllers/playlist.controller')

router.post('/import', playlistController.importPlaylist)

module.exports = router
