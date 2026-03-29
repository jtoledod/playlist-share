import { getSupabase } from '../index'
import { Song, SongCreateInput, AiData, LoadStatus } from '../../types'

const songModel = {
  async create(input: SongCreateInput): Promise<Song> {
    const { data, error } = await getSupabase()
      .from('songs')
      .insert([{
        title: input.title,
        artist: input.artist,
        thumbnail: input.thumbnail || null,
        metadata_provider: input.metadata_provider || null,
        external_id: input.external_id || null,
        load_status: 'pending',
        ai_data: {},
        album_id: input.album_id || null
      }])
      .select()
      .single()

    if (error) throw error
    return data as Song
  },

  async getByTitleAndArtist(title: string, artist: string): Promise<Song | null> {
    const { data, error } = await getSupabase()
      .from('songs')
      .select('*, album:albums(*)')
      .ilike('title', title)
      .ilike('artist', artist)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as Song | null
  },

  async getById(id: number): Promise<Song | null> {
    const { data, error } = await getSupabase()
      .from('songs')
      .select('*, album:albums(*)')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as Song | null
  },

  async updateAiData(id: number, aiData: AiData): Promise<Song> {
    const { data, error } = await getSupabase()
      .from('songs')
      .update({
        ai_data: aiData,
        load_status: 'completed'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Song
  },

  async updateStatus(id: number, status: LoadStatus): Promise<Song> {
    const { data, error } = await getSupabase()
      .from('songs')
      .update({ load_status: status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Song
  },

  async findOrCreate(input: SongCreateInput): Promise<Song> {
    let song = await this.getByTitleAndArtist(input.title, input.artist)

    if (!song) {
      song = await this.create(input)
    }

    return song
  }
}

export default songModel
