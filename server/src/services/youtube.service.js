const axios = require('axios')

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const BASE_URL = 'https://www.googleapis.com/youtube/v3'

function extractPlaylistId(url) {
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.get('list')
  } catch {
    return null
  }
}

async function fetchPlaylistDetails(playlistId) {
  const response = await axios.get(`${BASE_URL}/playlists`, {
    params: {
      part: 'snippet',
      id: playlistId,
      key: YOUTUBE_API_KEY
    }
  })

  const item = response.data.items[0]
  if (!item) throw new Error('Playlist not found')

  return {
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url
  }
}

async function fetchPlaylistTracks(playlistId) {
  const tracks = []
  let nextPageToken = null

  do {
    const response = await axios.get(`${BASE_URL}/playlistItems`, {
      params: {
        part: 'snippet',
        playlistId: playlistId,
        maxResults: 50,
        pageToken: nextPageToken,
        key: YOUTUBE_API_KEY
      }
    })

    for (const item of response.data.items) {
      const snippet = item.snippet
      if (snippet.title === 'Private video' || snippet.title === 'Deleted video') {
        continue
      }

      const videoId = snippet.resourceId.videoId
      tracks.push({
        title: snippet.title,
        artist: snippet.videoOwnerChannelTitle || 'Unknown Artist',
        yt_id: videoId,
        yt_url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url
      })
    }

    nextPageToken = response.data.nextPageToken
  } while (nextPageToken)

  return tracks
}

async function getPlaylistTracks(url) {
  const playlistId = extractPlaylistId(url)

  if (!playlistId) {
    throw new Error('Invalid YouTube playlist URL')
  }

  const [details, tracks] = await Promise.all([
    fetchPlaylistDetails(playlistId),
    fetchPlaylistTracks(playlistId)
  ])

  return {
    yt_id: playlistId,
    ...details,
    tracks
  }
}

module.exports = {
  extractPlaylistId,
  getPlaylistTracks
}
