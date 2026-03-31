# playlist-share Blueprint

Technical Source of Truth for AI agents and developers.

---

## Overview

Provider-agnostic playlist import → Metadata enrichment → AI analysis → Share with friends → React & Comment

```
Import Playlist (YouTube/Spotify/Apple Music) → Enrich metadata (Genius) → AI Analysis (Gemini) → Share → React/Comment
```

---

## Stack

**Backend:** Node.js 22+, Express 5 (ESM), TypeScript, Pino, Supabase (PostgreSQL)

**Frontend:** Vue.js 3 (Composition API), Pinia, Tailwind CSS, Vite

**External APIs:** YouTube Data API, Spotify API, Apple Music API, Genius API, Google Gemini 1.5 Flash

---

## Project Structure

```
server/src/
├── index.ts                    # Express entry
├── env.ts                      # Environment config
├── logger.ts                   # Pino logger
├── types/index.ts              # TypeScript interfaces
├── db/
│   ├── index.ts                # Supabase client
│   └── models/                 # Database models
├── middleware/
│   └── auth.ts                 # JWT validation
├── services/
│   ├── youtube.service.ts      # YouTube playlist fetching
│   ├── spotify.service.ts      # Spotify playlist fetching
│   ├── apple-music.service.ts  # Apple Music playlist fetching
│   ├── genius.service.ts       # Metadata enrichment
│   ├── gemini.service.ts       # AI analysis
│   ├── worker.metadata.service.ts
│   └── worker.ai.service.ts
├── controllers/
│   ├── playlist.controller.ts
│   ├── share.controller.ts
│   └── auth.controller.ts
└── routes/
    ├── playlist.routes.ts
    ├── share.routes.ts
    └── auth.routes.ts
```

---

## Database Schema (PostgreSQL)

### playlists

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | PK |
| provider | TEXT | 'youtube' \| 'spotify' \| 'apple_music' \| 'other' |
| external_id | TEXT | External playlist ID from provider |
| title | TEXT | Playlist title |
| description | TEXT | Playlist description |
| thumbnail | TEXT | Playlist cover image |
| created_at | TIMESTAMP | Creation timestamp |

### songs

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | PK |
| metadata_provider | TEXT | Source of metadata (nullable) |
| title | TEXT | Song title |
| artist | TEXT | Artist name |
| artist_id | INTEGER | FK to artists (nullable) |
| external_id | TEXT | External song ID (nullable) |
| thumbnail | TEXT | Song thumbnail |
| metadata_status | TEXT | 'pending'→'enriching'→'completed'/'failed' |
| ai_status | TEXT | 'pending'→'processing'→'completed'/'failed' |
| ai_data | JSONB | Gemini response ({ adjectives, meaning, trivia }) |
| album_id | INTEGER | FK to albums (nullable) |

### artists

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | PK |
| metadata_provider | TEXT | Source of metadata |
| external_id | TEXT | External ID (nullable) |
| name | TEXT | Artist name |
| thumbnail | TEXT | Artist image (nullable) |
| bio | TEXT | Artist bio (nullable) |

### albums

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | PK |
| metadata_provider | TEXT | Source of metadata (nullable) |
| external_id | TEXT | External ID (nullable) |
| name | TEXT | Album name |
| thumbnail | TEXT | Album cover (nullable) |
| release_date | TEXT | Release date (nullable) |

### playlist_songs

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | PK |
| playlist_id | INTEGER | FK to playlists |
| song_id | INTEGER | FK to songs |
| music_provider | TEXT | Provider for this specific track |
| external_id | TEXT | External track ID |
| external_url | TEXT | Link to track on provider |
| thumbnail | TEXT | Track thumbnail override |

### shares

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | PK |
| playlist_id | INTEGER | FK to playlists |
| sender_id | UUID | FK to auth.users |
| receiver_id | UUID | FK to auth.users |
| created_at | TIMESTAMP | Creation timestamp |

### share_song_reactions

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | PK |
| share_id | INTEGER | FK to shares |
| song_id | INTEGER | FK to songs |
| user_id | UUID | FK to auth.users |
| reaction | TEXT | 'do_not_like' \| 'like' \| 'love' |

### share_comments

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | PK |
| share_id | INTEGER | FK to shares |
| song_id | INTEGER | FK to songs |
| parent_id | INTEGER | FK to self (nullable - for replies) |
| user_id | UUID | FK to auth.users |
| content | TEXT | Comment text |
| created_at | TIMESTAMP | Creation timestamp |

---

## TypeScript Types

```typescript
// Music Providers
type MusicProvider = 'youtube' | 'spotify' | 'apple_music' | 'other'
type MetadataProvider = 'genius' | null
type MetadataStatus = 'pending' | 'enriching' | 'completed' | 'failed'
type AiStatus = 'pending' | 'processing' | 'completed' | 'failed'
type Reaction = 'do_not_like' | 'like' | 'love' | null

// Gemini Output Contract
interface AiData {
  adjectives: string[]   // 3 adjectives describing the song
  meaning: string         // core meaning of the song
  trivia: string[]       // interesting facts about the song
}

// Core Interfaces
interface Playlist { id, provider, external_id, title, description, thumbnail, created_at }
interface Song { id, metadata_provider, title, artist, artist_id, external_id, thumbnail, metadata_status, ai_status, ai_data, album_id }
interface Share { id, playlist_id, sender_id, receiver_id, created_at }
interface SongReaction { id, share_id, song_id, user_id, reaction }
interface ReviewComment { id, share_id, song_id, parent_id, user_id, content, created_at, replies? }
```

---

## API Routes

### Health

| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| GET | `/api/health` | No |

### Authentication (Supabase JWT)

| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| POST | `/api/auth/login/google` | No |
| POST | `/api/auth/logout` | Yes |
| GET | `/api/auth/me` | Yes |
| POST | `/api/auth/refresh` | No |
| POST | `/api/auth/forgot-password` | No |
| POST | `/api/auth/reset-password` | No |

### Playlists

| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| GET | `/api/playlists` | No |
| GET | `/api/playlists/:id` | No |
| POST | `/api/playlists/import` | Yes |

### Shares

| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| POST | `/api/shares` | Yes |
| GET | `/api/shares/sent` | Yes |
| GET | `/api/shares/received` | Yes |
| GET | `/api/shares/:id` | Yes |

### Reactions

| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| POST | `/api/shares/:id/reactions` | Yes |
| DELETE | `/api/shares/:id/reactions/:songId` | Yes |

### Comments

| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| POST | `/api/shares/:id/comments` | Yes |
| PATCH | `/api/shares/:id/comments/:commentId` | Yes |
| DELETE | `/api/shares/:id/comments/:commentId` | Yes |
| POST | `/api/shares/:id/comments/:commentId/reply` | Yes |

---

## Background Workers

### MetadataWorkerService

```typescript
class MetadataWorkerService {
  processMetadataBatch(songs: Song[]): Promise<void>
  processPendingMetadata(limit?: number): Promise<void>
}
```

- **Throttle:** 1 second between requests
- **Retries:** Retries once on error
- **No results:** Proceeds to AI processing (graceful degradation)
- **Updates:** `metadata_status`, links `artist_id`, creates/links `album` data

### AiWorkerService

```typescript
class AiWorkerService {
  processPlaylistSongs(songs: Song[]): Promise<void>
  processPendingAi(limit?: number): Promise<void>
}
```

- **Throttle:** 2 seconds between requests
- **Retries:** No retry
- **Updates:** `ai_status`, `ai_data` (AiData JSON)

---

## External APIs

| API | Purpose | Rate Limit |
|-----|---------|------------|
| YouTube Data API v3 | Playlist fetching | 10,000 quota units/day |
| Spotify Web API | Playlist fetching | Varies by plan |
| Apple Music API | Playlist fetching | Varies by plan |
| Genius API | Song metadata enrichment | 60 requests/minute |
| Google Gemini 1.5 Flash | AI song analysis | 15 requests/minute (free) |

---

## Build Commands

```bash
# Development
npm run dev              # Run both client and server

# Server
cd server
npm run dev              # nodemon + tsx
npm run build            # esbuild → dist/
npm run start            # node dist/index.js

# Client
cd client
npm run dev              # Vite dev server
npm run build            # Vite build
npm run preview          # Preview production build
```

---

## Architecture Decisions

1. **ES6 Classes** - All services, models, controllers use singleton exports
2. **Async Workers** - Never block HTTP responses; workers run in background
3. **Rate Limiting** - 1s (metadata), 2s (AI) to respect external APIs
4. **Graceful Degradation** - AI runs even if metadata enrichment fails
5. **Provider Agnostic** - `provider` and `external_id` fields support multiple music platforms
6. **Token Refresh** - Access tokens expire; refresh token maintains session
7. **Structured Logging** - Pino with service context
8. **JSON Mode** - Gemini returns typed JSON via response schema
