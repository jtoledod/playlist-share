import { Request, Response } from 'express'
import { getYouTubeService } from '../services/youtube.service'
import { getGeniusService } from '../services/genius.service'
import playlistModel from '../db/models/playlist.model'
import songModel from '../db/models/song.model'
import { getWorkerService } from '../services/worker.service'
import { Song } from '../types'

export async function importPlaylist(req: Request, res: Response): Promise<void> {
  try {
    const { url } = req.body

    if (!url || !url.includes('youtube.com/playlist')) {
      res.status(400).json({ error: 'Invalid YouTube playlist URL' })
      return
    }

    const playlistData = await getYouTubeService().getPlaylistTracks(url)

    const existingPlaylist = await playlistModel.getByExternalId(playlistData.provider, playlistData.external_id)
    if (existingPlaylist) {
      res.status(409).json({ error: 'Playlist already imported', playlistId: existingPlaylist.id })
      return
    }

    const playlist = await playlistModel.create({
      provider: playlistData.provider,
      external_id: playlistData.external_id,
      title: playlistData.title,
      description: playlistData.description,
      thumbnail: playlistData.thumbnail
    })

    const songs: Song[] = []
    const geniusService = getGeniusService()

    for (const track of playlistData.tracks) {
      let artist = track.artist
      let albumName: string | undefined
      let albumArt: string | undefined
      let releaseDate: string | undefined
      let geniusId: number | undefined

      const searchQuery = `${track.title} ${track.artist}`.trim()
      const geniusResult = await geniusService.searchSong(searchQuery)

      if (geniusResult) {
        artist = geniusResult.artist
        albumName = geniusResult.album
        albumArt = geniusResult.albumArt
        releaseDate = geniusResult.releaseDate
        geniusId = geniusResult.id
        console.log(`[Import] Enhanced with Genius: ${track.title} -> ${artist} (${albumName || 'unknown album'})`)
      } else {
        console.log(`[Import] Using YouTube data: ${track.title} by ${artist}`)
      }

      const song = await songModel.findOrCreate({
        provider: playlistData.provider,
        title: track.title,
        artist: artist,
        external_id: track.external_id,
        external_url: track.external_url,
        thumbnail: track.thumbnail,
        genius_id: geniusId,
        album_name: albumName,
        album_art: albumArt,
        release_date: releaseDate
      })

      await playlistModel.addSong(playlist.id, song.id)
      songs.push(song)
    }

    setTimeout(() => {
      getWorkerService().processPlaylistSongs(songs).catch(err => {
        console.error('Background worker error:', err)
      })
    }, 100)

    res.status(202).json({
      playlistId: playlist.id,
      status: 'importing'
    })
  } catch (error) {
    console.error('Error importing playlist:', error)
    res.status(500).json({ error: 'Failed to import playlist' })
  }
}
