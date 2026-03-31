# playlist-share (Alpha)

**playlist-share** is a collaborative web platform for music enthusiasts. Users can import YouTube playlists, which are enriched with AI-generated insights (via Gemini), and share them with friends to exchange reactions and comments on individual songs.

---

## 🚀 MVP Definition

The core goal is creating a structured feedback loop for shared music discovery.

* **Playlist Importing:** Automated track fetching from YouTube Music URLs.
* **AI Musicology:** Gemini 1.5 Flash provides 3 adjectives, core meaning, and trivia for each song.
* **Direct Sharing:** Sender-to-Receiver model for targeted recommendations.
* **Song Reactions:** Users can react to each song with 'do_not_like', 'like', or 'love'.
* **Per-Song Comments:** Both users can comment on songs and reply to each other.
* **Privacy:** Shared playlists are only visible to sender and receiver.

---

## Current Status

**Phase 3: Frontend Development** - In Progress

---

## Development Phases

### Phase 1: Infrastructure ✅

- Database schema (playlists, songs, albums, artists, playlist_songs)
- Sharing system (shares, song_reactions, review_comments)
- Supabase Auth with Google OAuth
- Auth middleware & endpoints (8 routes)

### Phase 2: Core Engine ✅

- YouTube Playlist Parser
- Metadata Enrichment (Genius API)
- AI Processing Pipeline (Gemini 1.5 Flash)
- Smart Caching (in-memory)
- Fuzzy Matching (Jaccard + Levenshtein)
- Background Workers (metadata + AI)

### Phase 3: Frontend Development 🔄

- [x] Basic Dashboard (add playlist)
- [ ] Login/Logout UI with Google OAuth
- [ ] My Shared Playlists view (Sent)
- [ ] Received Playlists view
- [ ] Playlist detail with reactions UI
- [ ] Comments UI with replies
- [ ] AI Insight Cards display

### Phase 4: Future Enhancements

- [ ] Spotify Playlist Parser
- [ ] Apple Music Parser
- [ ] Real-time updates (Supabase Realtime)
