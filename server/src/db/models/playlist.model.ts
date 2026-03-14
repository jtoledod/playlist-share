import supabase from '../index'
import { Playlist, PlaylistCreateInput, PlaylistSong } from '../../types'

const playlistModel = {
  async create(input: PlaylistCreateInput): Promise<Playlist> {
    const { data, error } = await supabase
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
  },

  async getByExternalId(provider: string, externalId: string): Promise<Playlist | null> {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('provider', provider)
      .eq('external_id', externalId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as Playlist | null
  },

  async getById(id: number): Promise<Playlist | null> {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as Playlist | null
  },

  async addSong(playlistId: number, songId: number): Promise<PlaylistSong> {
    const { data, error } = await supabase
      .from('playlist_songs')
      .insert([{ playlist_id: playlistId, song_id: songId }])
      .select()
      .single()

    if (error) throw error
    return data as PlaylistSong
  },

  async getSongs(playlistId: number): Promise<PlaylistSong[]> {
    const { data, error } = await supabase
      .from('playlist_songs')
      .select(`
        id,
        playlist_id,
        song_id,
        song:songs(*)
      `)
      .eq('playlist_id', playlistId)

    if (error) throw error
    return data as PlaylistSong[]
  }
}

export default playlistModel
