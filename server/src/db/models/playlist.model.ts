import { getSupabase } from '../index'
import { Playlist, PlaylistCreateInput, PlaylistSong, PlaylistSongCreateInput } from '../../types'

export class PlaylistModel {
  async create(input: PlaylistCreateInput): Promise<Playlist> {
    const { data, error } = await getSupabase()
      .from('playlists')
      .insert([{ 
        provider: input.provider,
        external_id: input.external_id, 
        title: input.title, 
        description: input.description, 
        thumbnail: input.thumbnail 
      }])
      .select()
      .single()

    if (error) throw error
    return data as Playlist
  }

  async getByExternalId(provider: string, externalId: string): Promise<Playlist | null> {
    const { data, error } = await getSupabase()
      .from('playlists')
      .select('*')
      .eq('provider', provider)
      .eq('external_id', externalId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as Playlist | null
  }

  async getById(id: number): Promise<Playlist | null> {
    const { data, error } = await getSupabase()
      .from('playlists')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as Playlist | null
  }

  async addSong(input: PlaylistSongCreateInput): Promise<PlaylistSong> {
    const { data, error } = await getSupabase()
      .from('playlist_songs')
      .insert([{ 
        playlist_id: input.playlist_id, 
        song_id: input.song_id,
        music_provider: input.music_provider,
        external_id: input.external_id,
        external_url: input.external_url,
        thumbnail: input.thumbnail || null
      }])
      .select()
      .single()

    if (error) throw error
    return data as PlaylistSong
  }

  async getSongs(playlistId: number): Promise<PlaylistSong[]> {
    const { data, error } = await getSupabase()
      .from('playlist_songs')
      .select(`
        id,
        playlist_id,
        song_id,
        music_provider,
        external_id,
        external_url,
        thumbnail,
        song:songs(*, album:albums(*))
      `)
      .eq('playlist_id', playlistId)

    if (error) throw error
    return data as PlaylistSong[]
  }

  async findAll(): Promise<Playlist[]> {
    const { data, error } = await getSupabase()
      .from('playlists')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Playlist[]
  }

  async findByIdWithSongs(id: number): Promise<(Playlist & { songs: PlaylistSong[] }) | null> {
    const playlist = await this.getById(id)
    if (!playlist) return null

    const songs = await this.getSongs(id)
    return { ...playlist, songs }
  }
}

export const playlistModel = new PlaylistModel()
