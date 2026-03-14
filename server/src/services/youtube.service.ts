import axios from 'axios'
import { YouTubePlaylistData, YouTubePlaylistItem } from '../types'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || ''
const BASE_URL = 'https://www.googleapis.com/youtube/v3'

export function extractPlaylistId(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.get('list')
  } catch {
    return null
  }
}

async function fetchPlaylistDetails(playlistId: string): Promise<{ title: string; description: string | null; thumbnail: string | null }> {
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
    description: item.snippet.description || null,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || null
  }
}

async function fetchPlaylistTracks(playlistId: string): Promise<YouTubePlaylistItem[]> {
  const tracks: YouTubePlaylistItem[] = []
  let nextPageToken: string | null = null

  do {
    const response: { data: { items: any[], nextPageToken?: string | null } } = await axios.get(`${BASE_URL}/playlistItems`, {
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
        thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || null
      })
    }

    nextPageToken = response.data.nextPageToken ?? null
  } while (nextPageToken)

  return tracks
}

export async function getPlaylistTracks(url: string): Promise<YouTubePlaylistData> {
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
    title: details.title,
    description: details.description,
    thumbnail: details.thumbnail,
    tracks
  }
}
