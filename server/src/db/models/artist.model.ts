import { getSupabase } from '../index'
import { Artist, ArtistCreateInput, MetadataProvider } from '../../types'

export class ArtistModel {
  async upsert(input: ArtistCreateInput): Promise<Artist> {
    if (input.metadata_provider && input.external_id) {
      const existing = await this.getByMetadataProviderAndExternalId(input.metadata_provider, input.external_id)
      if (existing) {
        const { data, error } = await getSupabase()
          .from('artists')
          .update({
            name: input.name,
            thumbnail: input.thumbnail || existing.thumbnail,
            bio: input.bio || existing.bio
          })
          .eq('id', existing.id)
          .select()
          .single()
        if (error) throw error
        return data as Artist
      }
    }

    const insertData: any = {
      name: input.name,
      metadata_provider: input.metadata_provider || 'genius',
      external_id: input.external_id || null,
      thumbnail: input.thumbnail || null,
      bio: input.bio || null
    }

    const { data, error } = await getSupabase()
      .from('artists')
      .insert([insertData])
      .select()
      .single()

    if (error) throw error
    return data as Artist
  }

  async getById(id: number): Promise<Artist | null> {
    const { data, error } = await getSupabase()
      .from('artists')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as Artist | null
  }

  async getByMetadataProviderAndExternalId(metadataProvider: MetadataProvider, externalId: string): Promise<Artist | null> {
    const { data, error } = await getSupabase()
      .from('artists')
      .select('*')
      .eq('metadata_provider', metadataProvider)
      .eq('external_id', externalId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as Artist | null
  }

  async getByName(name: string): Promise<Artist | null> {
    const { data, error } = await getSupabase()
      .from('artists')
      .select('*')
      .ilike('name', name)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as Artist | null
  }
}

export const artistModel = new ArtistModel()
