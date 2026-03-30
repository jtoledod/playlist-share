import { Response } from 'express'
import { shareModel } from '../db/models/share.model'
import { playlistModel } from '../db/models/playlist.model'
import { shareSongReactionModel } from '../db/models/share-song-reaction.model'
import { shareCommentModel } from '../db/models/share-comment.model'
import { AuthRequest } from '../middleware/auth'
import { createLogger } from '../logger.js'

const logger = createLogger('share')

export class ShareController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { playlist_id, receiver_id } = req.body

      if (!playlist_id || !receiver_id) {
        res.status(400).json({ error: 'playlist_id and receiver_id are required' })
        return
      }

      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const playlist = await playlistModel.getById(playlist_id)
      if (!playlist) {
        res.status(404).json({ error: 'Playlist not found' })
        return
      }

      const share = await shareModel.create({ playlist_id, receiver_id }, req.userId)

      logger.info({ shareId: share.id, playlistId: playlist_id, senderId: req.userId, receiverId: receiver_id }, 'Share created')
      res.status(201).json(share)
    } catch (error: any) {
      logger.error({ error: error.message }, 'Error creating share')
      res.status(500).json({ error: 'Failed to create share' })
    }
  }

  async getSent(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const shares = await shareModel.getBySender(req.userId)
      res.json(shares)
    } catch (error: any) {
      logger.error({ error: error.message }, 'Error getting sent shares')
      res.status(500).json({ error: 'Failed to get sent shares' })
    }
  }

  async getReceived(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const shares = await shareModel.getByReceiver(req.userId)
      res.json(shares)
    } catch (error: any) {
      logger.error({ error: error.message }, 'Error getting received shares')
      res.status(500).json({ error: 'Failed to get received shares' })
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const shareId = parseInt(req.params.id)

      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const share = await shareModel.getUserShareAccess(shareId, req.userId)
      if (!share) {
        res.status(404).json({ error: 'Share not found or access denied' })
        return
      }

      const songs = await playlistModel.getSongs(share.playlist_id)
      const reactions = await shareSongReactionModel.getByShare(shareId)
      const comments = await shareCommentModel.getByShareWithReplies(shareId)

      res.json({
        ...share,
        songs,
        reactions,
        comments
      })
    } catch (error: any) {
      logger.error({ error: error.message }, 'Error getting share')
      res.status(500).json({ error: 'Failed to get share' })
    }
  }

  async addReaction(req: AuthRequest, res: Response): Promise<void> {
    try {
      const shareId = parseInt(req.params.id)
      const { song_id, reaction } = req.body

      if (!song_id || reaction === undefined) {
        res.status(400).json({ error: 'song_id and reaction are required' })
        return
      }

      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const share = await shareModel.getUserShareAccess(shareId, req.userId)
      if (!share) {
        res.status(404).json({ error: 'Share not found or access denied' })
        return
      }

      const validReactions = ['do_not_like', 'like', 'love', null]
      if (!validReactions.includes(reaction)) {
        res.status(400).json({ error: 'Invalid reaction' })
        return
      }

      if (reaction === null) {
        await shareSongReactionModel.delete(shareId, song_id, req.userId)
        res.json({ message: 'Reaction removed' })
      } else {
        const result = await shareSongReactionModel.upsert({
          share_id: shareId,
          song_id,
          user_id: req.userId,
          reaction
        })
        res.json(result)
      }
    } catch (error: any) {
      logger.error({ error: error.message }, 'Error adding reaction')
      res.status(500).json({ error: 'Failed to add reaction' })
    }
  }

  async addComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const shareId = parseInt(req.params.id)
      const { song_id, content, parent_id } = req.body

      if (!song_id || !content) {
        res.status(400).json({ error: 'song_id and content are required' })
        return
      }

      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const share = await shareModel.getUserShareAccess(shareId, req.userId)
      if (!share) {
        res.status(404).json({ error: 'Share not found or access denied' })
        return
      }

      const comment = await shareCommentModel.create({
        share_id: shareId,
        song_id,
        user_id: req.userId,
        content,
        parent_id: parent_id || null
      })

      res.status(201).json(comment)
    } catch (error: any) {
      logger.error({ error: error.message }, 'Error adding comment')
      res.status(500).json({ error: 'Failed to add comment' })
    }
  }

  async updateComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const commentId = parseInt(req.params.commentId)
      const { content } = req.body

      if (!content) {
        res.status(400).json({ error: 'content is required' })
        return
      }

      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const comment = await shareCommentModel.getById(commentId)
      if (!comment) {
        res.status(404).json({ error: 'Comment not found' })
        return
      }

      if (comment.user_id !== req.userId) {
        res.status(403).json({ error: 'Not authorized to edit this comment' })
        return
      }

      const updated = await shareCommentModel.update(commentId, content)
      res.json(updated)
    } catch (error: any) {
      logger.error({ error: error.message }, 'Error updating comment')
      res.status(500).json({ error: 'Failed to update comment' })
    }
  }

  async deleteComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const commentId = parseInt(req.params.commentId)

      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const comment = await shareCommentModel.getById(commentId)
      if (!comment) {
        res.status(404).json({ error: 'Comment not found' })
        return
      }

      if (comment.user_id !== req.userId) {
        res.status(403).json({ error: 'Not authorized to delete this comment' })
        return
      }

      await shareCommentModel.delete(commentId)
      res.json({ message: 'Comment deleted' })
    } catch (error: any) {
      logger.error({ error: error.message }, 'Error deleting comment')
      res.status(500).json({ error: 'Failed to delete comment' })
    }
  }

  async replyToComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const shareId = parseInt(req.params.id)
      const commentId = parseInt(req.params.commentId)
      const { content } = req.body

      if (!content) {
        res.status(400).json({ error: 'content is required' })
        return
      }

      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const share = await shareModel.getUserShareAccess(shareId, req.userId)
      if (!share) {
        res.status(404).json({ error: 'Share not found or access denied' })
        return
      }

      const parentComment = await shareCommentModel.getById(commentId)
      if (!parentComment || parentComment.share_id !== shareId) {
        res.status(404).json({ error: 'Parent comment not found' })
        return
      }

      const reply = await shareCommentModel.create({
        share_id: shareId,
        song_id: parentComment.song_id,
        parent_id: commentId,
        user_id: req.userId,
        content
      })

      res.status(201).json(reply)
    } catch (error: any) {
      logger.error({ error: error.message }, 'Error replying to comment')
      res.status(500).json({ error: 'Failed to reply to comment' })
    }
  }
}

export const shareController = new ShareController()
