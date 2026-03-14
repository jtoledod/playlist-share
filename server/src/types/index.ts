export type LoadStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface AiData {
  adjectives: string[]
  meaning: string
  trivia: string[]
}

export interface Playlist {
  id: number
  yt_id: string
  title: string
  description: string | null
  thumbnail: string | null
  created_at: string
}

export interface PlaylistCreateInput {
  yt_id: string
  title: string
  description: string | null
  thumbnail: string | null
}

export interface Song {
  id: number
  title: string
  artist: string
  yt_id: string
  yt_url: string
  thumbnail: string | null
  load_status: LoadStatus
  ai_data: AiData
  created_at: string
}

export interface SongCreateInput {
  title: string
  artist: string
  yt_id: string
  yt_url: string
  thumbnail: string | null
}

export interface PlaylistSong {
  id: number
  playlist_id: number
  song_id: number
  song: Song | Song[]
}

export interface YouTubePlaylistItem {
  title: string
  artist: string
  yt_id: string
  yt_url: string
  thumbnail: string | null
}

export interface YouTubePlaylistData {
  yt_id: string
  title: string
  description: string | null
  thumbnail: string | null
  tracks: YouTubePlaylistItem[]
}

export interface ImportPlaylistResponse {
  playlistId: number
  status: 'importing'
}

export interface ErrorResponse {
  error: string
}
