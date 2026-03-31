import { Router, Response } from 'express'
import { getSupabase } from '../db/index'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'
import { createLogger } from '../logger.js'

const logger = createLogger('auth-routes')
const router = Router()

router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    const { data, error } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback`
      }
    })

    if (error) {
      logger.warn({ error, email }, 'Registration failed')
      res.status(400).json({ error: error.message })
      return
    }

    logger.info({ userId: data.user?.id }, 'User registered successfully')
    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: data.user
    })
  } catch (error) {
    logger.error({ error }, 'Registration error')
    res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    const { data, error } = await getSupabase().auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      logger.warn({ error, email }, 'Login failed')
      res.status(401).json({ error: error.message })
      return
    }

    logger.info({ userId: data.user.id }, 'User logged in successfully')
    res.json({
      user: data.user,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in
      }
    })
  } catch (error) {
    logger.error({ error }, 'Login error')
    res.status(500).json({ error: 'Login failed' })
  }
})

router.post('/login/google', async (req: AuthRequest, res: Response) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

    const { data, error } = await getSupabase().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${frontendUrl}/auth/callback`,
        scopes: 'email profile'
      }
    })

    if (error) {
      logger.warn({ error }, 'Google OAuth failed')
      res.status(400).json({ error: error.message })
      return
    }

    res.json({ url: data.url })
  } catch (error) {
    logger.error({ error }, 'Google OAuth error')
    res.status(500).json({ error: 'Google login failed' })
  }
})

router.post('/logout', authMiddleware.handle, async (req: AuthRequest, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    const { error } = await getSupabase().auth.signOut(token || '')

    if (error) {
      logger.warn({ error }, 'Logout failed')
      res.status(400).json({ error: error.message })
      return
    }

    logger.info({ userId: req.userId }, 'User logged out')
    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    logger.error({ error }, 'Logout error')
    res.status(500).json({ error: 'Logout failed' })
  }
})

router.get('/me', authMiddleware.handle, async (req: AuthRequest, res: Response) => {
  try {
    const { data: { user }, error } = await getSupabase().auth.getUser(req.headers.authorization?.replace('Bearer ', ''))

    if (error || !user) {
      res.status(401).json({ error: 'User not found' })
      return
    }

    res.json({ user })
  } catch (error) {
    logger.error({ error }, 'Get user error')
    res.status(500).json({ error: 'Failed to get user' })
  }
})

router.post('/refresh', async (req: AuthRequest, res: Response) => {
  try {
    const { refresh_token } = req.body

    if (!refresh_token) {
      res.status(400).json({ error: 'Refresh token is required' })
      return
    }

    const { data, error } = await getSupabase().auth.refreshSession({
      refresh_token
    })

    if (error) {
      logger.warn({ error }, 'Token refresh failed')
      res.status(401).json({ error: error.message })
      return
    }

    res.json({
      user: data.user,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in
      }
    })
  } catch (error) {
    logger.error({ error }, 'Token refresh error')
    res.status(500).json({ error: 'Token refresh failed' })
  }
})

router.post('/forgot-password', async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body

    if (!email) {
      res.status(400).json({ error: 'Email is required' })
      return
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

    const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${frontendUrl}/auth/reset-password`
    })

    if (error) {
      logger.warn({ error, email }, 'Forgot password failed')
      res.status(400).json({ error: error.message })
      return
    }

    res.json({ message: 'Password reset email sent. Check your inbox.' })
  } catch (error) {
    logger.error({ error }, 'Forgot password error')
    res.status(500).json({ error: 'Failed to send reset email' })
  }
})

router.post('/reset-password', async (req: AuthRequest, res: Response) => {
  try {
    const { password } = req.body

    if (!password) {
      res.status(400).json({ error: 'New password is required' })
      return
    }

    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      res.status(400).json({ error: 'Reset token is required' })
      return
    }

    const { data, error } = await getSupabase().auth.updateUser(token, {
      password
    })

    if (error) {
      logger.warn({ error }, 'Reset password failed')
      res.status(400).json({ error: error.message })
      return
    }

    logger.info({ userId: data.user.id }, 'Password reset successfully')
    res.json({ message: 'Password reset successfully', user: data.user })
  } catch (error) {
    logger.error({ error }, 'Reset password error')
    res.status(500).json({ error: 'Failed to reset password' })
  }
})

export default router
