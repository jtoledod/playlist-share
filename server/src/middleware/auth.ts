import { Request, Response, NextFunction } from 'express'
import { getSupabase } from '../db/index'
import { createLogger } from '../logger.js'

const logger = createLogger('auth')

export interface AuthRequest extends Request {
  userId?: string
}

export class AuthMiddleware {
  async handle(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No authorization token provided' })
        return
      }

      const token = authHeader.replace('Bearer ', '')

      const { data: { user }, error } = await getSupabase().auth.getUser(token)

      if (error || !user) {
        logger.warn({ error }, 'Invalid token')
        res.status(401).json({ error: 'Invalid or expired token' })
        return
      }

      req.userId = user.id
      next()
    } catch (error) {
      logger.error({ error }, 'Auth middleware error')
      res.status(500).json({ error: 'Authentication error' })
    }
  }

  handleOptional(req: AuthRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next()
      return
    }

    this.handle(req, res, next)
  }
}

export const authMiddleware = new AuthMiddleware()
