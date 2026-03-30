import { AiData } from '../services/gemini.service'

export type LoadStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type MetadataStatus = 'pending' | 'enriching' | 'completed' | 'failed'

export type AiStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type MusicProvider = 'youtube' | 'spotify' | 'apple_music' | 'other'

export type MetadataProvider = 'genius' | null

export type { AiData }

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

export interface Album {
  id: number
  metadata_provider: MetadataProvider
  external_id: string | null
  name: string | null
  cover_art: string | null
  release_date: string | null
  created_at: string
}

export interface Song {
  id: number
  metadata_provider: MetadataProvider
  title: string
  artist: string
  external_id: string | null
  thumbnail: string | null
  load_status: LoadStatus
  metadata_status: MetadataStatus
  ai_status: AiStatus
  ai_data: AiData
  album_id: number | null
  album: Album | null
  created_at: string
}

export interface SongCreateInput {
  title: string
  artist: string
  thumbnail: string | null
  metadata_provider?: MetadataProvider
  external_id?: string
  album_id?: number
}

export interface PlaylistSong {
  id: number
  playlist_id: number
  song_id: number
  music_provider: MusicProvider
  external_id: string
  external_url: string
  thumbnail: string | null
  song: Song | Song[]
}

export interface PlaylistSongCreateInput {
  playlist_id: number
  song_id: number
  music_provider: MusicProvider
  external_id: string
  external_url: string
  thumbnail: string | null
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
