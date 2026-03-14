const supabase = require('../index')

const songModel = {
  async create({ title, artist, yt_id, yt_url, thumbnail }) {
    const { data, error } = await supabase
      .from('songs')
      .insert([{
        title,
        artist,
        yt_id,
        yt_url,
        thumbnail,
        load_status: 'pending',
        ai_data: {}
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByTitleAndArtist(title, artist) {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .ilike('title', title)
      .ilike('artist', artist)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async updateAiData(id, aiData) {
    const { data, error } = await supabase
      .from('songs')
      .update({
        ai_data: aiData,
        load_status: 'completed'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('songs')
      .update({ load_status: status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async findOrCreate({ title, artist, yt_id, yt_url, thumbnail }) {
    let song = await this.getByTitleAndArtist(title, artist)

    if (!song) {
      song = await this.create({ title, artist, yt_id, yt_url, thumbnail })
    }

    return song
  }
}

module.exports = songModel
