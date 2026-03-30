import { getSupabase } from '../index'
import { Album, MetadataProvider } from '../../types'

export interface AlbumCreateInput {
  metadata_provider?: MetadataProvider | null
  external_id?: string | null
  name: string | null
  cover_art?: string | null
  release_date?: string | null
}

const albumModel = {
  async upsert(input: AlbumCreateInput): Promise<Album> {
    const insertData: any = {
      name: input.name
    }

    if (input.metadata_provider) insertData.metadata_provider = input.metadata_provider
    if (input.external_id) insertData.external_id = input.external_id
    if (input.cover_art) insertData.cover_art = input.cover_art
    if (input.release_date) insertData.release_date = input.release_date

    const { data, error } = await getSupabase()
      .from('albums')
      .insert([insertData])
      .select()
      .single()

    if (error) throw error
    return data as Album
  },

  async getById(id: number): Promise<Album | null> {
    const { data, error } = await getSupabase()
      .from('albums')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as Album | null
  },

  async getByMetadataProviderAndExternalId(metadataProvider: string, externalId: string): Promise<Album | null> {
    const { data, error } = await getSupabase()
      .from('albums')
      .select('*')
      .eq('metadata_provider', metadataProvider)
      .eq('external_id', externalId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as Album | null
  }
}

export default albumModel
