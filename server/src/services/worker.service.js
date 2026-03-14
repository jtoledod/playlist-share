const songModel = require('../db/models/song.model')
const geminiService = require('./gemini.service')

const THROTTLE_DELAY_MS = 2000

async function processPlaylistSongs(songs) {
  for (const song of songs) {
    try {
      await songModel.updateStatus(song.id, 'processing')

      const aiData = await geminiService.analyzeSong(song.title, song.artist)

      await songModel.updateAiData(song.id, aiData)

      console.log(`Processed song: ${song.title}`)
    } catch (error) {
      console.error(`Error processing song ${song.title}:`, error.message)
      await songModel.updateStatus(song.id, 'failed')
    }

    await sleep(THROTTLE_DELAY_MS)
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = {
  processPlaylistSongs
}
