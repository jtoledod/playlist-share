const express = require('express')
const router = express.Router()
const geminiService = require('../services/gemini.service')

const playlists = []

router.post('/', async (req, res) => {
  try {
    const { url } = req.body
    
    if (!url || !url.includes('youtube.com/playlist')) {
      return res.status(400).json({ error: 'Invalid YouTube playlist URL' })
    }

    const playlistId = extractPlaylistId(url)
    
    const mockPlaylist = {
      id: Date.now(),
      yt_id: playlistId,
      title: 'New Playlist (Mock)',
      songCount: 5,
      songs: [
        { id: 1, title: 'Song 1', artist: 'Artist 1', yt_url: 'https://youtube.com/watch?v=abc' },
        { id: 2, title: 'Song 2', artist: 'Artist 2', yt_url: 'https://youtube.com/watch?v=def' }
      ]
    }

    const songsWithAI = await Promise.all(
      mockPlaylist.songs.map(async (song) => {
        const aiData = await geminiService.analyzeSong(song.title, song.artist)
        return { ...song, ai_data: aiData }
      })
    )

    mockPlaylist.songs = songsWithAI
    playlists.push(mockPlaylist)

    res.json(mockPlaylist)
  } catch (error) {
    console.error('Error creating playlist:', error)
    res.status(500).json({ error: 'Failed to create playlist' })
  }
})

router.get('/', (req, res) => {
  res.json(playlists)
})

function extractPlaylistId(url) {
  const urlObj = new URL(url)
  return urlObj.searchParams.get('list')
}

module.exports = router
