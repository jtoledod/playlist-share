import songModel from '../db/models/song.model'
import { analyzeSong } from './gemini.service'
import { Song } from '../types'

const THROTTLE_DELAY_MS = 2000

export async function processPlaylistSongs(songs: Song[]): Promise<void> {
  for (const song of songs) {
    try {
      await songModel.updateStatus(song.id, 'processing')

      const aiData = await analyzeSong(song.title, song.artist)

      await songModel.updateAiData(song.id, aiData)

      console.log(`Processed song: ${song.title}`)
    } catch (error) {
      console.error(`Error processing song ${song.title}:`, error instanceof Error ? error.message : 'Unknown error')
      await songModel.updateStatus(song.id, 'failed')
    }

    await sleep(THROTTLE_DELAY_MS)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
