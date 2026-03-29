import axios from 'axios'
import { ProviderPlaylistData, ProviderTrackItem } from '../types'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || ''
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3'
const YOUTUBE_MUSIC_BASE_URL = 'https://www.music.youtube.com'

export interface YouTubePlaylistDetails {
  title: string
  description: string | null
  thumbnail: string | null
}

export class YouTubeService {
  private apiKey: string

  constructor(apiKey: string = YOUTUBE_API_KEY) {
    this.apiKey = apiKey
  }

  private cleanArtistName(artist: string): string {
    return artist.replace(/ - Topic$/, '').trim()
  }

  extractPlaylistId(url: string): string | null {
    try {
      const urlObj = new URL(url)
      return urlObj.searchParams.get('list')
    } catch {
      return null
    }
  }

  async fetchPlaylistDetails(playlistId: string): Promise<YouTubePlaylistDetails> {
    console.log(`[YouTube] GET ${YOUTUBE_API_BASE_URL}/playlists?part=snippet&id=${playlistId}`)
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/playlists`, {
      params: {
        part: 'snippet',
        id: playlistId,
        key: this.apiKey
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

  async fetchPlaylistTracks(playlistId: string): Promise<ProviderTrackItem[]> {
    const tracks: ProviderTrackItem[] = []
    let nextPageToken: string | null = null

    do {
      console.log(`[YouTube] GET ${YOUTUBE_API_BASE_URL}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&pageToken=${nextPageToken || 'none'}`)
      const response: { data: { items: any[], nextPageToken?: string | null } } = await axios.get(`${YOUTUBE_API_BASE_URL}/playlistItems`, {
        params: {
          part: 'snippet',
          playlistId: playlistId,
          maxResults: 50,
          pageToken: nextPageToken,
          key: this.apiKey
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
          artist: this.cleanArtistName(snippet.videoOwnerChannelTitle) || 'Unknown Artist',
          external_id: videoId,
          external_url: `${YOUTUBE_MUSIC_BASE_URL}/watch?v=${videoId}`,
          thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || null
        })
      }

      nextPageToken = response.data.nextPageToken ?? null
    } while (nextPageToken)

    return tracks
  }

  async getPlaylistTracks(url: string): Promise<ProviderPlaylistData> {
    const playlistId = this.extractPlaylistId(url)

    if (!playlistId) {
      throw new Error('Invalid YouTube playlist URL')
    }

    const [details, tracks] = await Promise.all([
      this.fetchPlaylistDetails(playlistId),
      this.fetchPlaylistTracks(playlistId)
    ])

    return {
      provider: 'youtube',
      external_id: playlistId,
      title: details.title,
      description: details.description,
      thumbnail: details.thumbnail,
      tracks
    }
  }
}

let youtubeService: YouTubeService | null = null

export function getYouTubeService(): YouTubeService {
  if (!youtubeService) {
    youtubeService = new YouTubeService()
  }
  return youtubeService
}
