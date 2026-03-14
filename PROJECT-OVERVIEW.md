# Project Overview: **playlist-share** (Alpha)

**playlist-share** is a collaborative web platform designed for music enthusiasts to go beyond simple link-sharing. It allows users to import existing **YouTube Music playlists**, enrich them with **AI-generated insights** (meaning, adjectives, and trivia), and share them with specific friends to compare ratings and reviews.

---

## 🚀 MVP Definition (Minimum Viable Product)

The core goal is to create a structured feedback loop for shared music discovery.

* **Playlist Importing:** Users paste a YouTube Music playlist URL; the app fetches all tracks automatically.
* **Direct Sharing:** A "Sender-to-Receiver" model where you pick a registered user to share a specific playlist with.
* **AI Musicology:** Powered by **Gemini 1.5 Flash**, every song is analyzed to provide:
  * **3 Adjectives:** Capturing the lyrical/emotional vibe.
  * **Core Meaning:** A concise 1–3 sentence explanation of the message.
  * **Trivia:** 2–3 interesting facts about the song, artist, or production.
* **Dual Review System:** Both users can independently rate (1–5 stars) and write comments for every track.
* **Progress Tracking:** Real-time indicators of how many songs the receiver has reviewed.

---

## 🛠 Technical Stack

* **Frontend:** Vue.js 3 (Composition API) + Vite + Pinia (State Management).
* **Backend:** Node.js + Express.
* **Intelligence:** Google Gemini 1.5 Flash (via SDK).
* **Data APIs:** YouTube Data API v3 (Track fetching) & Genius API (Lyrics context).
* **Database & Auth:** Supabase (PostgreSQL + Realtime + Auth).

---

## 📋 Development Roadmap

### 1. Database & Security (Supabase)

* [ ] **Schema Design:**
  * `profiles`: User data (username, avatar).
  * `songs`: Master table for songs (acts as a cache for AI data).
  * `playlists`: Stores the YouTube Playlist metadata.
  * `playlist_songs`: Join table linking songs to specific playlists.
  * `shares`: Tracks which sender shared which playlist with which receiver.
  * `reviews`: User-specific ratings and comments linked to a song and a playlist.
* [ ] **Authentication:** Implement email/password login flow in Vue.

### 2. The Analysis Engine (Node.js)

* [ ] **YouTube Integration:** Create a service to parse playlist URLs and fetch the tracklist.
* [ ] **AI Pipeline:**
  * Fetch lyrics from Genius API.
  * Execute the Gemini "Musicologist" prompt.
  * **Smart Caching:** Before calling Gemini, check if the song exists in the `songs` table to save tokens.
* [ ] **Sharing Logic:** Create the `POST /share` endpoint to link playlists between users.

### 3. User Interface (Vue.js)

* [ ] **Import Dashboard:** A clean UI to paste links and select a friend to share with.
* [ ] **Playlist Feed:** Separate views for "Sent to me" and "My Shares."
* [ ] **Review Component:** An interactive list where clicking a song reveals the **AI Insight Card** and the rating form.

---

## 🧠 AI Data Structure

To ensure a seamless Vue.js integration, the backend will force Gemini to return a strict JSON object:

```json
{
  "adjectives": ["Nostalgic", "Gritty", "Atmospheric"],
  "meaning": "A brief explanation of the lyrical theme and emotional weight.",
  "trivia": [
    "A fact about the recording process.",
    "A note on the artist's inspiration."
  ]
}
```

## ⚠️ Important Items to Remember

* JSON Enforcement: Use Gemini's "JSON Mode" to prevent the frontend from breaking during parsing.

* Cost Efficiency: Leverage the free tiers of Supabase and Gemini to keep the project at zero cost, preserving your savings goals.

* Asynchronous Processing: Since a playlist might have many songs, use a "loading" state for individual songs so the user can start reviewing while the rest of the list is still being analyzed by the AI.

* Component Architecture: Build modular Vue components (e.g., SongCard.vue, AiInsight.vue) for better maintainability.
