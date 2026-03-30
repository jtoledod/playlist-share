import { getSupabase } from '../index'
import { ReviewComment, ReviewCommentCreateInput } from '../../types'

export class ShareCommentModel {
  async create(input: ReviewCommentCreateInput): Promise<ReviewComment> {
    const { data, error } = await getSupabase()
      .from('share_comments')
      .insert({
        share_id: input.share_id,
        song_id: input.song_id,
        parent_id: input.parent_id || null,
        user_id: input.user_id,
        content: input.content
      })
      .select()
      .single()

    if (error) throw error
    return data as ReviewComment
  }

  async getByShare(shareId: number): Promise<ReviewComment[]> {
    const { data, error } = await getSupabase()
      .from('share_comments')
      .select('*')
      .eq('share_id', shareId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data as ReviewComment[]
  }

  async getByShareWithReplies(shareId: number): Promise<ReviewComment[]> {
    const comments = await this.getByShare(shareId)
    
    const parentComments = comments.filter(c => !c.parent_id)
    const replies = comments.filter(c => c.parent_id)

    return parentComments.map(parent => ({
      ...parent,
      replies: replies.filter(reply => reply.parent_id === parent.id)
    }))
  }

  async getById(id: number): Promise<ReviewComment | null> {
    const { data, error } = await getSupabase()
      .from('share_comments')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as ReviewComment | null
  }

  async update(id: number, content: string): Promise<ReviewComment> {
    const { data, error } = await getSupabase()
      .from('share_comments')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as ReviewComment
  }

  async delete(id: number): Promise<void> {
    const { error } = await getSupabase()
      .from('share_comments')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

export const shareCommentModel = new ShareCommentModel()
