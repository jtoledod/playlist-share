import { Router } from 'express'
import { playlistController } from '../controllers/playlist.controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.get('/', (req, res) => playlistController.list(req, res))
router.get('/:id', (req, res) => playlistController.getById(req, res))
router.post('/import', (req, res, next) => authMiddleware.handle(req, res, next), (req, res) => playlistController.import(req, res))

export default router
