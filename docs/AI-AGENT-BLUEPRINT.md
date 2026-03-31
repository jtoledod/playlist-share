# playlist-share

## Overview

Import YouTube playlists → Enrich metadata (Genius) → Share with friends → React & Comment on songs

## Stack

Node.js 22+, Express 5 (ESM), TypeScript, Supabase (PostgreSQL), Pino, Google Gemini

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

```
POST   /api/auth/register          - Email/password signup
POST   /api/auth/login             - Email/password login
POST   /api/auth/login/google     - Returns OAuth URL to redirect
POST   /api/auth/logout            - Sign out (auth required)
GET    /api/auth/me                - Get current user (auth required)
POST   /api/auth/refresh           - Refresh access token
POST   /api/auth/forgot-password   - Request password reset email
POST   /api/auth/reset-password    - Reset password with token
```

### POST /api/playlists/import

```json
// Request
{ "url": "https://youtube.com/playlist?list=xxx", "process_ai": true }

// Response (202)
{ "playlistId": 123, "status": "importing" }
```

### Shares (requires auth)

```
POST   /api/shares              - Share playlist with user
GET    /api/shares/sent         - List sent shares
GET    /api/shares/received     - List received shares  
GET    /api/shares/:id          - Get share with songs, reactions, comments
```

### Reactions

```
POST   /api/shares/:id/reactions     - Add/update reaction (song_id, reaction)
DELETE /api/shares/:id/reactions/:songId - Remove reaction
```

### Comments

```
POST   /api/shares/:id/comments           - Add comment (song_id, content)
PATCH  /api/shares/:id/comments/:commentId - Edit own comment
DELETE /api/shares/:id/comments/:commentId - Delete own comment
POST   /api/shares/:id/comments/:commentId/reply - Reply to comment
```

## Workers

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
