import { Request, Response } from 'express'
import { getYouTubeService } from '../services/youtube.service'
import { getSupabase } from '../db/index'
import { playlistModel } from '../db/models/playlist.model'
import { songModel } from '../db/models/song.model'
import { getMetadataWorkerService } from '../services/worker.metadata.service'
import { getAiWorkerService } from '../services/worker.ai.service'
import { Song } from '../types'
import { createLogger } from '../logger.js'

const logger = createLogger('playlist')

export class PlaylistController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const playlists = await playlistModel.findAll()

      const playlistsWithCount = await Promise.all(
        playlists.map(async (playlist) => {
          const { count } = await getSupabase()
            .from('playlist_songs')
            .select('*', { count: 'exact', head: true })
            .eq('playlist_id', playlist.id)

          return {
            id: playlist.id,
            title: playlist.title,
            description: playlist.description,
            thumbnail: playlist.thumbnail,
            provider: playlist.provider,
            track_count: count || 0,
            created_at: playlist.created_at
          }
        })
      )

      res.json(playlistsWithCount)
    } catch (error: any) {
      logger.error({ error: error?.message || error }, 'Error listing playlists')
      res.status(500).json({ error: 'Failed to list playlists', details: error?.message })
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const playlistId = parseInt(id)

      if (isNaN(playlistId)) {
        res.status(400).json({ error: 'Invalid playlist ID' })
        return
      }

      const playlist = await playlistModel.findByIdWithSongs(playlistId)

      if (!playlist) {
        res.status(404).json({ error: 'Playlist not found' })
        return
      }

      res.json(playlist)
    } catch (error: any) {
      logger.error({ error: error?.message || error }, 'Error getting playlist')
      res.status(500).json({ error: 'Failed to get playlist', details: error?.message })
    }
  }

  async import(req: Request, res: Response): Promise<void> {
    try {
      const { url, process_ai = true } = req.body

      if (!url || (!url.includes('youtube.com/playlist') && !url.includes('music.youtube.com/playlist'))) {
        res.status(400).json({ error: 'Invalid YouTube playlist URL' })
        return
      }

      const playlistData = await getYouTubeService().getPlaylistTracks(url)

      const playlist = await playlistModel.create({
        provider: playlistData.provider,
        external_id: playlistData.external_id,
        title: playlistData.title,
        description: playlistData.description,
        thumbnail: playlistData.thumbnail
      })

      const songs: Song[] = []

      for (const track of playlistData.tracks) {
        const song = await songModel.findOrCreate({
          title: track.title,
          artist: track.artist,
          thumbnail: track.thumbnail
        })

        await playlistModel.addSong({
          playlist_id: playlist.id,
          song_id: song.id,
          music_provider: playlistData.provider,
          external_id: track.external_id,
          external_url: track.external_url,
          thumbnail: track.thumbnail
        })
        songs.push(song)
      }

      setTimeout(() => {
        getMetadataWorkerService().processMetadataBatch(songs).catch(err => {
          logger.error({ error: err }, 'Metadata worker error')
        })

        if (process_ai) {
          getAiWorkerService().processPlaylistSongs(songs).catch(err => {
            logger.error({ error: err }, 'AI worker error')
          })
        }
      }, 100)

      res.status(202).json({
        playlistId: playlist.id,
        status: 'importing'
      })
    } catch (error: any) {
      logger.error({ error: error?.message || error }, 'Error importing playlist')
      res.status(500).json({ error: 'Failed to import playlist', details: error?.message })
    }
  }
}

export const playlistController = new PlaylistController()
