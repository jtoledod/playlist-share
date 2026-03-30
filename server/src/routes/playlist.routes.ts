import { Router } from 'express'
import { playlistController } from '../controllers/playlist.controller'

const router = Router()

router.post('/import', (req, res) => playlistController.import(req, res))

export default router
