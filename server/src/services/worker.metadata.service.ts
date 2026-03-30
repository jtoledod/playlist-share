import songModel from '../db/models/song.model'
import albumModel from '../db/models/album.model'
import { getGeniusService } from './genius.service'
import { Song } from '../types'
import { createLogger } from '../logger.js'

const logger = createLogger('metadata-worker')

const DEFAULT_THROTTLE_DELAY_MS = 1000
const MAX_RETRIES = 1

export class MetadataWorkerService {
  private throttleDelayMs: number
  private retryCount: Map<number, number> = new Map()

  constructor(throttleDelayMs: number = DEFAULT_THROTTLE_DELAY_MS) {
    this.throttleDelayMs = throttleDelayMs
  }

  async processMetadataBatch(songs: Song[]): Promise<void> {
    for (const song of songs) {
      await this.enrichSongMetadata(song, 0)
      await this.sleep(this.throttleDelayMs)
    }
  }

  async processPendingMetadata(limit: number = 50): Promise<void> {
    const songs = await songModel.findPendingMetadata(limit)
    if (songs.length === 0) {
      logger.debug('No pending metadata to process')
      return
    }
    logger.info({ count: songs.length }, 'Processing pending metadata')
    await this.processMetadataBatch(songs)
  }

  private async enrichSongMetadata(song: Song, attempt: number): Promise<void> {
    try {
      await songModel.updateMetadataStatus(song.id, 'enriching')
      logger.debug({ songId: song.id, title: song.title, artist: song.artist }, 'Enriching metadata')

      const geniusService = getGeniusService()
      const query = `${song.title} ${song.artist}`.trim()

      const result = await geniusService.searchSong(query, song.title, song.artist)

      if (!result) {
        logger.info({ songId: song.id, title: song.title }, 'No Genius results, proceeding to AI')
        await songModel.updateMetadataStatus(song.id, 'completed')
        return
      }

      const details = await geniusService.getSongDetails(result.id)

      if (details?.album) {
        const album = await albumModel.upsert({
          metadata_provider: 'genius',
          external_id: String(result.id),
          name: details.album,
          cover_art: details.albumArt || null,
          release_date: details.releaseDate || null
        })

        await songModel.updateWithMetadata(song.id, {
          metadata_provider: 'genius',
          external_id: String(result.id),
          album_id: album.id
        })

        logger.info({ songId: song.id, title: song.title, album: details.album }, 'Metadata enriched')
      }

      await songModel.updateMetadataStatus(song.id, 'completed')
    } catch (error) {
      logger.error({ songId: song.id, title: song.title, error, attempt }, 'Error enriching metadata')
      
      if (attempt < MAX_RETRIES) {
        await this.retryEnrichment(song, attempt + 1)
      } else {
        logger.warn({ songId: song.id, title: song.title }, 'Max retries reached, marking as failed')
        try {
          await songModel.updateMetadataStatus(song.id, 'failed')
          await songModel.updateAiStatus(song.id, 'pending')
        } catch (dbError) {
          logger.error({ songId: song.id, error: dbError }, 'Failed to update status in DB')
        }
      }
    }
  }

  private async retryEnrichment(song: Song, attempt: number): Promise<void> {
    try {
      await this.enrichSongMetadata(song, attempt)
    } catch {
      logger.warn({ songId: song.id, title: song.title, attempt }, 'Retry failed')
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

let metadataWorkerService: MetadataWorkerService | null = null

export function getMetadataWorkerService(): MetadataWorkerService {
  if (!metadataWorkerService) {
    metadataWorkerService = new MetadataWorkerService()
  }
  return metadataWorkerService
}
