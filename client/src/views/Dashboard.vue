<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-8">Playlist Share</h1>
    
    <div class="bg-gray-800 rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Add a YouTube Music Playlist</h2>
      <div class="flex gap-4">
        <input 
          v-model="playlistUrl" 
          type="text" 
          placeholder="Paste YouTube Music playlist URL..."
          class="flex-1 px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
        />
        <button 
          @click="addPlaylist"
          :disabled="loading"
          class="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold disabled:opacity-50"
        >
          {{ loading ? 'Processing...' : 'Add Playlist' }}
        </button>
      </div>
    </div>

    <div v-if="playlists.length === 0" class="text-center text-gray-500 py-12">
      No playlists yet. Add one above to get started!
    </div>

    <div v-else class="grid gap-6">
      <div v-for="playlist in playlists" :key="playlist.id" class="bg-gray-800 rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-2">{{ playlist.title }}</h3>
        <p class="text-gray-400 text-sm mb-4">{{ playlist.songCount }} songs</p>
        <button class="text-purple-400 hover:text-purple-300">View Playlist →</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const playlistUrl = ref('')
const loading = ref(false)
const playlists = ref([])

const addPlaylist = async () => {
  if (!playlistUrl.value) return
  
  loading.value = true
  try {
    const response = await axios.post('/api/playlists', { url: playlistUrl.value })
    playlists.value.push(response.data)
    playlistUrl.value = ''
  } catch (error) {
    console.error('Error adding playlist:', error)
    alert('Failed to add playlist')
  } finally {
    loading.value = false
  }
}

const fetchPlaylists = async () => {
  try {
    const response = await axios.get('/api/playlists')
    playlists.value = response.data
  } catch (error) {
    console.error('Error fetching playlists:', error)
  }
}

onMounted(fetchPlaylists)
</script>
