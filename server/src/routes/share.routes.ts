import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { shareController } from '../controllers/share.controller'

const router = Router()

router.post('/', (req, res, next) => authMiddleware.handle(req, res, next), (req, res) => shareController.create(req, res))
router.get('/sent', (req, res, next) => authMiddleware.handle(req, res, next), (req, res) => shareController.getSent(req, res))
router.get('/received', (req, res, next) => authMiddleware.handle(req, res, next), (req, res) => shareController.getReceived(req, res))
router.get('/:id', (req, res, next) => authMiddleware.handle(req, res, next), (req, res) => shareController.getById(req, res))

router.post('/:id/reactions', (req, res, next) => authMiddleware.handle(req, res, next), (req, res) => shareController.addReaction(req, res))

router.post('/:id/comments', (req, res, next) => authMiddleware.handle(req, res, next), (req, res) => shareController.addComment(req, res))
router.patch('/:id/comments/:commentId', (req, res, next) => authMiddleware.handle(req, res, next), (req, res) => shareController.updateComment(req, res))
router.delete('/:id/comments/:commentId', (req, res, next) => authMiddleware.handle(req, res, next), (req, res) => shareController.deleteComment(req, res))
router.post('/:id/comments/:commentId/reply', (req, res, next) => authMiddleware.handle(req, res, next), (req, res) => shareController.replyToComment(req, res))

export default router
