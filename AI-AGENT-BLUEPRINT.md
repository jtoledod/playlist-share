# 🤖 AI Agent Blueprint: playlist-share

## 🎯 Technical Context & Constraints

- **Performance:** AI analysis must be ASYNCHRONOUS. Do not block the import response.
- **Cost Efficiency:** Prioritize Free Tiers. Use **Caching**: If a song `external_url` exists in the `songs` table with `completed` status, do not re-call Gemini.
- **JSON Enforcement:** Always use Gemini's JSON Mode to ensure frontend compatibility.
- **Throttling:** Implement a 2-second delay between AI requests to respect Rate Limits (RPM).
- **Provider Agnostic:** The system supports multiple music providers (YouTube, Spotify, Apple Music, etc.) through a unified schema using `provider` and `external_id` fields.

## 🗄️ Database Schema Requirements (Supabase/Postgres)

- **profiles:** `id` (UUID), `username`, `avatar_url`.
- **songs:** `id`, `provider`, `external_id`, `external_url`, `title`, `artist`, `thumbnail`, `load_status`, `ai_data` (JSONB), `created_at`.
- **playlists:** `id`, `provider`, `external_id`, `title`, `description`, `thumbnail`, `created_at`.
- **playlist_songs:** `id`, `playlist_id`, `song_id` (Many-to-Many).
- **shares:** `playlist_id`, `sender_id`, `receiver_id`.
- **reviews:** `song_id`, `user_id`, `playlist_id`, `rating` (1-5), `comment`.

## 🎵 Music Providers

Supported providers:

- `youtube`
- `spotify`
- `apple_music`
- `other`

All external IDs and URLs are provider-agnostic through `external_id` and `external_url` fields.

## 🛣️ API Routing Map

### Playlists & Shares

- `POST /api/playlists/import`: Extract provider + external ID -> Fetch Tracks -> Save Basic Meta -> Trigger Background Worker. Accepts optional `provider` field (defaults to youtube).
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

## Analysis Status Logic (load_status)

- `pending`: Track imported, awaiting worker.
- `processing`: Worker currently calling AI.
- `completed`: ai_data populated successfully.
- `failed`: Process failed (API error or lyrics not found)

## 🔧 Build System

- **Module System:** ES Modules (ESM) with `"type": "module"` in package.json
- **Bundler:** esbuild with config file (esbuild.config.mjs)
- **Config Details:**
  - Auto-externalizes all dependencies from package.json
  - Format: ESM for Node.js
  - Platform: node
- **Dev:** tsx for development with nodemon
- **TypeScript:** Uses `"module": "ESNext"` and `"moduleResolution": "bundler"`

## 🛠️ Middleware Requirement

All routes (except Auth) must validate the Supabase JWT to identify the user_id.
