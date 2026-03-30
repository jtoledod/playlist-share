import songModel from '../db/models/song.model'
import { getGeminiService } from './gemini.service'
import { Song } from '../types'
import { createLogger } from '../logger.js'

const logger = createLogger('ai-worker')

const DEFAULT_THROTTLE_DELAY_MS = 2000

export class AiWorkerService {
  private throttleDelayMs: number

  constructor(throttleDelayMs: number = DEFAULT_THROTTLE_DELAY_MS) {
    this.throttleDelayMs = throttleDelayMs
  }

  async processPlaylistSongs(songs: Song[]): Promise<void> {
    for (const song of songs) {
      try {
        await songModel.updateAiStatus(song.id, 'processing')
        
        const aiData = await getGeminiService().analyzeSong(song.title, song.artist)
        
        await songModel.updateAiDataWithStatus(song.id, aiData, 'completed')
        
        logger.info({ songId: song.id, title: song.title }, 'AI analysis completed')
      } catch (error) {
        logger.error({ songId: song.id, title: song.title, error }, 'AI analysis failed')
        await songModel.updateAiDataWithStatus(song.id, {} as any, 'failed')
      }

      await this.sleep(this.throttleDelayMs)
    }
  }

  async processPendingAi(limit: number = 50): Promise<void> {
    const songs = await songModel.findPendingAi(limit)
    if (songs.length === 0) {
      logger.debug('No pending AI analysis to process')
      return
    }
    logger.info({ count: songs.length }, 'Processing pending AI analysis')
    await this.processPlaylistSongs(songs)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

let aiWorkerService: AiWorkerService | null = null

export function getAiWorkerService(): AiWorkerService {
  if (!aiWorkerService) {
    aiWorkerService = new AiWorkerService()
  }
  return aiWorkerService
}
