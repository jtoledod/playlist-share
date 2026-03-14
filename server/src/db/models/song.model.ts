import supabase from '../index'
import { Song, SongCreateInput, AiData, LoadStatus } from '../../types'

const songModel = {
  async create(input: SongCreateInput): Promise<Song> {
    const { data, error } = await supabase
      .from('songs')
      .insert([{
        title: input.title,
        artist: input.artist,
        yt_id: input.yt_id,
        yt_url: input.yt_url,
        thumbnail: input.thumbnail,
        load_status: 'pending',
        ai_data: {}
      }])
      .select()
      .single()

    if (error) throw error
    return data as Song
  },

  async getByTitleAndArtist(title: string, artist: string): Promise<Song | null> {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .ilike('title', title)
      .ilike('artist', artist)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as Song | null
  },

  async getById(id: number): Promise<Song | null> {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as Song | null
  },

  async updateAiData(id: number, aiData: AiData): Promise<Song> {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
