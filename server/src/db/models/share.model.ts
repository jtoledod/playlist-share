import { getSupabase } from '../index'
import { Share, ShareCreateInput } from '../../types'

export class ShareModel {
  async create(input: ShareCreateInput, senderId: string): Promise<Share> {
    const { data, error } = await getSupabase()
      .from('shares')
      .insert({
        playlist_id: input.playlist_id,
        sender_id: senderId,
        receiver_id: input.receiver_id
      })
      .select()
      .single()

    if (error) throw error
    return data as Share
  }

  async getById(id: number): Promise<Share | null> {
    const { data, error } = await getSupabase()
      .from('shares')
      .select('*, playlist:playlists(*)')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as Share | null
  }

  async getBySender(senderId: string): Promise<Share[]> {
    const { data, error } = await getSupabase()
      .from('shares')
      .select('*, playlist:playlists(*), receiver:receiver_id(*)')
      .eq('sender_id', senderId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Share[]
  }

  async getByReceiver(receiverId: string): Promise<Share[]> {
    const { data, error } = await getSupabase()
      .from('shares')
      .select('*, playlist:playlists(*), sender:sender_id(*)')
      .eq('receiver_id', receiverId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Share[]
  }

  async getUserShareAccess(shareId: number, userId: string): Promise<Share | null> {
    const { data, error } = await getSupabase()
      .from('shares')
      .select('*')
      .eq('id', shareId)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as Share | null
  }

  async delete(id: number): Promise<void> {
    const { error } = await getSupabase()
      .from('shares')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

export const shareModel = new ShareModel()
