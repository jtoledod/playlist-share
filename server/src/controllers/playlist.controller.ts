import { Request, Response } from 'express'
import { getYouTubeService } from '../services/youtube.service'
import { getGeniusService } from '../services/genius.service'
import playlistModel from '../db/models/playlist.model'
import songModel from '../db/models/song.model'
import albumModel from '../db/models/album.model'
import { getWorkerService } from '../services/worker.service'
import { Song } from '../types'

export async function importPlaylist(req: Request, res: Response): Promise<void> {
  try {
    const { url, process_ai = true } = req.body

    if (!url || !url.includes('youtube.com/playlist')) {
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
    const geniusService = getGeniusService()

    for (const track of playlistData.tracks) {
      let artist = track.artist
      let albumId: number | undefined
      let metadataProvider: 'genius' | undefined
      let geniusExternalId: string | undefined

      const searchQuery = `${track.title} ${track.artist}`.trim()
      const geniusResult = await geniusService.searchSong(searchQuery, track.title, track.artist)

      if (geniusResult) {
        const detailedInfo = await geniusService.getSongDetails(geniusResult.id)

        if (detailedInfo && detailedInfo.album) {
          const album = await albumModel.upsert({
            metadata_provider: 'genius',
            external_id: String(geniusResult.id),
            name: detailedInfo.album,
            cover_art: detailedInfo.albumArt || null,
            release_date: detailedInfo.releaseDate || null
          })
          albumId = album.id
        }

        metadataProvider = 'genius'
        geniusExternalId = String(geniusResult.id)
        artist = detailedInfo?.artist || geniusResult.artist
        console.log(`[Import] Enhanced with Genius: ${track.title} -> ${artist} (${detailedInfo?.album || 'unknown album'})`)
      } else {
        console.log(`[Import] Using YouTube data: ${track.title} by ${artist}`)
      }

      const song = await songModel.findOrCreate({
        title: track.title,
        artist: artist,
        thumbnail: track.thumbnail,
        metadata_provider: metadataProvider,
        external_id: geniusExternalId,
        album_id: albumId
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

    if (process_ai) {
      setTimeout(() => {
        getWorkerService().processPlaylistSongs(songs).catch(err => {
          console.error('Background worker error:', err)
        })
      }, 100)
    }

    res.status(202).json({
      playlistId: playlist.id,
      status: 'importing'
    })
  } catch (error) {
    console.error('Error importing playlist:', error)
    res.status(500).json({ error: 'Failed to import playlist' })
  }
}
