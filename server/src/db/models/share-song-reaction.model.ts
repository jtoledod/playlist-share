import { getSupabase } from '../index'
import { SongReaction, SongReactionCreateInput, Reaction } from '../../types'

export class ShareSongReactionModel {
  async upsert(input: SongReactionCreateInput): Promise<SongReaction> {
    const { data, error } = await getSupabase()
      .from('share_song_reactions')
      .upsert({
        share_id: input.share_id,
        song_id: input.song_id,
        user_id: input.user_id,
        reaction: input.reaction,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'share_id,song_id,user_id'
      })
      .select()
      .single()

    if (error) throw error
    return data as SongReaction
  }

  async getByShare(shareId: number): Promise<SongReaction[]> {
    const { data, error } = await getSupabase()
      .from('share_song_reactions')
      .select('*')
      .eq('share_id', shareId)

    if (error) throw error
    return data as SongReaction[]
  }

  async getByShareAndUser(shareId: number, userId: string): Promise<SongReaction[]> {
    const { data, error } = await getSupabase()
      .from('share_song_reactions')
      .select('*')
      .eq('share_id', shareId)
      .eq('user_id', userId)

    if (error) throw error
    return data as SongReaction[]
  }

  async delete(shareId: number, songId: number, userId: string): Promise<void> {
    const { error } = await getSupabase()
      .from('share_song_reactions')
      .delete()
      .eq('share_id', shareId)
      .eq('song_id', songId)
      .eq('user_id', userId)

    if (error) throw error
  }
}

export const shareSongReactionModel = new ShareSongReactionModel()
