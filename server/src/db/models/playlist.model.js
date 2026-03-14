const supabase = require('../index')

const playlistModel = {
  async create({ yt_id, title, description, thumbnail }) {
    const { data, error } = await supabase
      .from('playlists')
      .insert([{ yt_id, title, description, thumbnail }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByYoutubeId(yt_id) {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('yt_id', yt_id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async addSong(playlistId, songId) {
    const { data, error } = await supabase
      .from('playlist_songs')
      .insert([{ playlist_id: playlistId, song_id: songId }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getSongs(playlistId) {
    const { data, error } = await supabase
      .from('playlist_songs')
      .select(`
        id,
        song:songs(*)
      `)
      .eq('playlist_id', playlistId)

    if (error) throw error
    return data
  }
}

module.exports = playlistModel
