import './env'

import express, { Request, Response } from 'express'
import cors from 'cors'
import playlistRoutes from './routes/playlist.routes'
import { logger } from './logger.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api/playlists', playlistRoutes)

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server started')
})
