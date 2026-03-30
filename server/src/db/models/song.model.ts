import { getSupabase } from '../index'
import { Song, SongCreateInput, AiData, MetadataStatus, AiStatus } from '../../types'

const songModel = {
  async create(input: SongCreateInput): Promise<Song> {
    const { data, error } = await getSupabase()
      .from('songs')
      .insert([{
        title: input.title,
        artist: input.artist,
        thumbnail: input.thumbnail || null,
        metadata_provider: input.metadata_provider || 'genius',
        external_id: input.external_id || '',
        metadata_status: 'pending',
        ai_status: 'pending',
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
        ai_data: aiData
      })
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
  },

  async findPendingMetadata(limit: number = 50): Promise<Song[]> {
    const { data, error } = await getSupabase()
      .from('songs')
      .select('*, album:albums(*)')
      .eq('metadata_status', 'pending')
      .limit(limit)

    if (error) throw error
    return data as Song[]
  },

  async findPendingAi(limit: number = 50): Promise<Song[]> {
    const { data, error } = await getSupabase()
      .from('songs')
      .select('*, album:albums(*)')
      .eq('ai_status', 'pending')
      .limit(limit)

    if (error) throw error
    return data as Song[]
  },

  async updateMetadataStatus(id: number, status: MetadataStatus): Promise<Song> {
    const { data, error } = await getSupabase()
      .from('songs')
      .update({ metadata_status: status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Song
  },

  async updateAiStatus(id: number, status: AiStatus): Promise<Song> {
    const { data, error } = await getSupabase()
      .from('songs')
      .update({ ai_status: status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Song
  },

  async updateWithMetadata(id: number, metadata: {
    metadata_provider: string
    external_id: string
    album_id: number
  }): Promise<Song> {
    const { data, error } = await getSupabase()
      .from('songs')
      .update({
        metadata_provider: metadata.metadata_provider,
        external_id: metadata.external_id,
        album_id: metadata.album_id
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Song
  },

  async updateAiDataWithStatus(id: number, aiData: AiData, aiStatus: AiStatus): Promise<Song> {
    const { data, error } = await getSupabase()
      .from('songs')
      .update({
        ai_data: aiData,
        ai_status: aiStatus
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Song
  }
}

export default songModel
