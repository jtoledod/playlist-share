const youtubeService = require('../services/youtube.service')
const playlistModel = require('../db/models/playlist.model')
const songModel = require('../db/models/song.model')
const workerService = require('../services/worker.service')

async function importPlaylist(req, res) {
  try {
    const { url } = req.body

    if (!url || !url.includes('youtube.com/playlist')) {
      return res.status(400).json({ error: 'Invalid YouTube playlist URL' })
    }

    const playlistData = await youtubeService.getPlaylistTracks(url)

    const existingPlaylist = await playlistModel.getByYoutubeId(playlistData.yt_id)
    if (existingPlaylist) {
      return res.status(409).json({ error: 'Playlist already imported', playlistId: existingPlaylist.id })
    }

    const playlist = await playlistModel.create({
      yt_id: playlistData.yt_id,
      title: playlistData.title,
      description: playlistData.description,
      thumbnail: playlistData.thumbnail
    })

    const songs = []
    for (const track of playlistData.tracks) {
      const song = await songModel.findOrCreate({
        title: track.title,
        artist: track.artist,
        yt_id: track.yt_id,
        yt_url: track.yt_url,
        thumbnail: track.thumbnail
      })

      await playlistModel.addSong(playlist.id, song.id)
      songs.push(song)
    }

    setTimeout(() => {
      workerService.processPlaylistSongs(songs).catch(err => {
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

module.exports = {
  importPlaylist
}
