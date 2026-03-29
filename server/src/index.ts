import './env'

import express, { Request, Response } from 'express'
import cors from 'cors'
import playlistRoutes from './routes/playlist.routes'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api/playlists', playlistRoutes)

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
