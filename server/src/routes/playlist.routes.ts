import { Router } from 'express'
import { importPlaylist } from '../controllers/playlist.controller'

const router = Router()

router.post('/import', importPlaylist)

export default router
