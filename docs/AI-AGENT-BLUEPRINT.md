# playlist-share

## Overview

Import YouTube playlists → Enrich metadata (Genius) → Share with friends → React & Comment on songs

## Stack

Node.js 22+, Express 5 (ESM), TypeScript, Supabase (PostgreSQL), Pino, Google Gemini

## Frontend Stack

Vue.js 3 (Composition API), Pinia (state management), Tailwind CSS, Vite

## Structure

```
server/src/
├── index.ts              # Express entry
├── env.ts                # Environment config
├── logger.ts             # Pino logger
├── types/index.ts        # TypeScript interfaces
├── middleware/auth.ts    # Supabase auth middleware
├── services/
│   ├── genius.service.ts     # Metadata enrichment
│   ├── youtube.service.ts    # Playlist fetching
│   ├── gemini.service.ts     # AI analysis
│   ├── worker.metadata.service.ts  # Metadata worker
│   └── worker.ai.service.ts       # AI worker
├── controllers/
│   ├── playlist.controller.ts
│   └── share.controller.ts
├── routes/
│   ├── playlist.routes.ts
│   ├── share.routes.ts
│   └── auth.routes.ts
└── db/models/            # song, playlist, album, artist, share, shareSongReaction, shareComment models
```

## Database Schema (PostgreSQL)

### songs

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | PK |
| metadata_provider | TEXT | Source of metadata (nullable) |
| title, artist | TEXT | Song info |
| artist_id | INTEGER | FK to artists (nullable) |
| external_id | TEXT | External data (nullable) |
| thumbnail | TEXT | Song thumbnail |
| metadata_status | TEXT | pending→enriching→completed/failed |
| ai_status | TEXT | pending→processing→completed/failed |
| ai_data | JSONB | Gemini response |
| album_id | FK | To albums (nullable) |

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

### shares

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | PK |
| playlist_id | INTEGER | FK to playlists |
| sender_id | UUID | FK to auth.users |
| receiver_id | UUID | FK to auth.users |

### share_song_reactions

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | PK |
| share_id | INTEGER | FK to shares |
| song_id | INTEGER | FK to songs |
| user_id | UUID | FK to auth.users |
| reaction | TEXT | 'do_not_like' \| 'like' \| 'love' \| null |

### share_comments

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | PK |
| share_id | INTEGER | FK to shares |
| song_id | INTEGER | FK to songs |
| parent_id | INTEGER | FK to self (nullable - for replies) |
| user_id | UUID | FK to auth.users |
| content | TEXT | Comment text |

Migrations: `001` → `013` (apply in order)

## Types

```typescript
type MetadataStatus = 'pending' | 'enriching' | 'completed' | 'failed'
type AiStatus = 'pending' | 'processing' | 'completed' | 'failed'
type MusicProvider = 'youtube' | 'spotify' | 'apple_music' | 'other'
type MetadataProvider = 'genius' | null
type Reaction = 'do_not_like' | 'like' | 'love' | null

interface AiData { adjectives: string[]; meaning: string; trivia: string[] }

interface Share {
  id: number
  playlist_id: number
  sender_id: string
  receiver_id: string
  created_at: string
}

interface SongReaction {
  id: number
  share_id: number
  song_id: number
  user_id: string
  reaction: Reaction
}

interface ReviewComment {
  id: number
  share_id: number
  song_id: number
  parent_id: number | null
  user_id: string
  content: string
  replies?: ReviewComment[]
}
```

## API Routes

### GET /api/health

```json
{ "status": "ok" }
```

### Auth

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

### Shares (Auth Required)

| Method | Endpoint |
|--------|----------|
| POST | `/api/shares` |
| GET | `/api/shares/sent` |
| GET | `/api/shares/received` |
| GET | `/api/shares/:id` |

### Reactions (Auth Required)

| Method | Endpoint |
|--------|----------|
| POST | `/api/shares/:id/reactions` |
| DELETE | `/api/shares/:id/reactions/:songId` |

### Comments (Auth Required)

| Method | Endpoint |
|--------|----------|
| POST | `/api/shares/:id/comments` |
| PATCH | `/api/shares/:id/comments/:commentId` |
| DELETE | `/api/shares/:id/comments/:commentId` |
| POST | `/api/shares/:id/comments/:commentId/reply` |

### MetadataWorkerService

```typescript
class MetadataWorkerService {
  processMetadataBatch(songs: Song[]): Promise<void>
  processPendingMetadata(limit?: number): Promise<void>
}
```

- 1s throttle, retries once on error
- No retry when no results (proceeds to AI)
- Updates metadata_status, links artist_id, album data

### AiWorkerService

```typescript
class AiWorkerService {
  processPlaylistSongs(songs: Song[]): Promise<void>
  processPendingAi(limit?: number): Promise<void>
}
```

- 2s throttle, no retry
- Updates ai_status, ai_data

## Services

### YouTubeService

```typescript
getPlaylistTracks(url: string): Promise<ProviderPlaylistData>
```

### GeniusService

```typescript
searchSong(query, title, artist): Promise<GeniusSongResult | null>
getSongDetails(id): Promise<GeniusSongResult | null>
```

Uses fuzzy matching (Jaccard + Levenshtein)

### GeminiService

```typescript
analyzeSong(title, artist): Promise<AiData>
```

Model: gemini-3-flash-preview, JSON schema enforced

## External APIs

| API | Purpose | Rate Limit |
|-----|---------|------------|
| YouTube Data API v3 | Playlist fetching | 10,000 quota units/day |
| Genius API | Song metadata enrichment | 60 requests/minute |
| Google Gemini 1.5 Flash | AI-powered song analysis | 15 requests/minute (free tier) |

## Build

```bash
npm run dev    # nodemon + tsx
npm run build  # esbuild → dist/
npm run start  # node dist/index.js
```

## Architecture

1. **Classes** - All services, models, controllers, and middleware use ES6 classes with singleton exports
2. **Async** - Never block HTTP responses
3. **Separation** - Metadata and AI as independent workers
4. **Rate Limiting** - 1s (metadata), 2s (AI)
5. **JSON Mode** - Gemini returns typed JSON
6. **Structured Logging** - Pino with service context
7. **Graceful Degradation** - AI runs even if metadata fails
8. **Nullable Metadata** - external_id and metadata_provider nullable when no enrichment data
9. **Auth Middleware** - Supabase JWT validation for protected routes
10. **Supabase Auth** - Email/password + Google OAuth built-in
11. **Token Refresh** - Access tokens expire, refresh token keeps session
