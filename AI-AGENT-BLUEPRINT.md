# 🤖 AI Agent Blueprint: playlist-share

## 🎯 Technical Context & Constraints

- **Performance:** AI analysis must be ASYNCHRONOUS. Do not block the import response.
- **Cost Efficiency:** Prioritize Free Tiers. Use **Caching**: If a song `yt_url` exists in the `songs` table with `completed` status, do not re-call Gemini.
- **JSON Enforcement:** Always use Gemini's JSON Mode to ensure frontend compatibility.
- **Throttling:** Implement a 2-second delay between AI requests to respect Rate Limits (RPM).

## 🗄️ Database Schema Requirements (Supabase/Postgres)

- **profiles:** `id` (UUID), `username`, `avatar_url`.
- **songs:** `id`, `yt_url` (unique), `title`, `artist`, `ai_data` (JSONB), `ai_status` (pending, processing, completed, failed).
- **playlists:** `id`, `yt_playlist_id`, `creator_id`.
- **playlist_songs:** `playlist_id`, `song_id` (Many-to-Many).
- **shares:** `playlist_id`, `sender_id`, `receiver_id`.
- **reviews:** `song_id`, `user_id`, `playlist_id`, `rating` (1-5), `comment`.

## 🛣️ API Routing Map

### Playlists & Shares

- `POST /api/playlists/import`: Extract YT ID -> Fetch Tracks -> Save Basic Meta -> Trigger Background Worker.
- `GET /api/playlists/inbox`: Fetch shared playlists for current user.
- `POST /api/shares`: Create link between playlist, sender, and receiver.

### Songs & AI

- `GET /api/songs/:id/analysis`: Return cached `ai_data` or status.
- `POST /api/songs/:id/refresh`: Force re-analysis.

### Reviews

- `POST /api/reviews`: Upsert rating/comment for a song in a specific playlist.
- `GET /api/reviews/:playlistId`: Get all reviews for comparison.

## 🧠 Data Contracts

### Gemini Output Schema

```json
{
  "adjectives": ["string", "string", "string"],
  "meaning": "1-3 sentences explaining the song's message",
  "trivia": ["fact 1", "fact 2"]
}
```

## Analysis Status Logic

- pending: Track imported, awaiting worker.
- processing: Worker currently calling AI.
- completed: ai_data populated successfully.
- failed: Process failed (API error or lyrics not found)

## 🛠️ Middleware Requirement

All routes (except Auth) must validate the Supabase JWT to identify the user_id.
