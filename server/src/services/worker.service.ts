import songModel from '../db/models/song.model'
import { getGeminiService } from './gemini.service'
import { Song } from '../types'

const DEFAULT_THROTTLE_DELAY_MS = 2000

export class WorkerService {
  private throttleDelayMs: number

  constructor(throttleDelayMs: number = DEFAULT_THROTTLE_DELAY_MS) {
    this.throttleDelayMs = throttleDelayMs
  }

  async processPlaylistSongs(songs: Song[]): Promise<void> {
    const geminiService = getGeminiService()

    for (const song of songs) {
      try {
        await songModel.updateStatus(song.id, 'processing')

        const aiData = await geminiService.analyzeSong(song.title, song.artist)

        await songModel.updateAiData(song.id, aiData)

        console.log(`Processed song: ${song.title}`)
      } catch (error) {
        console.error(`Error processing song ${song.title}:`, error instanceof Error ? error.message : 'Unknown error')
        await songModel.updateStatus(song.id, 'failed')
      }

      await this.sleep(this.throttleDelayMs)
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

let workerService: WorkerService | null = null

export function getWorkerService(): WorkerService {
  if (!workerService) {
    workerService = new WorkerService()
  }
  return workerService
}
