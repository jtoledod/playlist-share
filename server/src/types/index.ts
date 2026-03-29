export type LoadStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type MusicProvider = 'youtube' | 'spotify' | 'apple_music' | 'other'

export interface AiData {
  adjectives: string[]
  meaning: string
  trivia: string[]
}

export interface Playlist {
  id: number
  provider: MusicProvider
  external_id: string
  title: string
  description: string | null
  thumbnail: string | null
  created_at: string
}

export interface PlaylistCreateInput {
  provider: MusicProvider
  external_id: string
  title: string
  description: string | null
  thumbnail: string | null
}

export interface Song {
  id: number
  provider: MusicProvider
  title: string
  artist: string
  external_id: string
  external_url: string
  thumbnail: string | null
  load_status: LoadStatus
  ai_data: AiData
  genius_id?: number
  album_name?: string
  album_art?: string
  release_date?: string
  created_at: string
}

export interface SongCreateInput {
  provider: MusicProvider
  title: string
  artist: string
  external_id: string
  external_url: string
  thumbnail: string | null
  genius_id?: number
  album_name?: string
  album_art?: string
  release_date?: string
}

export interface PlaylistSong {
  id: number
  playlist_id: number
  song_id: number
  song: Song | Song[]
}

export interface ProviderTrackItem {
  title: string
  artist: string
  external_id: string
  external_url: string
  thumbnail: string | null
}

export interface ProviderPlaylistData {
  provider: MusicProvider
  external_id: string
  title: string
  description: string | null
  thumbnail: string | null
  tracks: ProviderTrackItem[]
}

export interface ImportPlaylistResponse {
  playlistId: number
  status: 'importing'
}

export interface ErrorResponse {
  error: string
}
