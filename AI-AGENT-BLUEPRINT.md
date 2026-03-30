# playlist-share

## Overview

Import YouTube playlists → Enrich metadata (Genius) → AI analysis (Gemini)

## Stack

Node.js 22+, Express 5 (ESM), TypeScript, Supabase (PostgreSQL), Pino, Google Gemini

## Structure

```
server/src/
├── index.ts              # Express entry
├── env.ts                # Environment config
├── logger.ts             # Pino logger
├── types/index.ts        # TypeScript interfaces
├── services/
│   ├── genius.service.ts     # Metadata enrichment
│   ├── youtube.service.ts    # Playlist fetching
│   ├── gemini.service.ts     # AI analysis
│   ├── worker.metadata.service.ts  # Metadata worker
│   └── worker.ai.service.ts       # AI worker
├── controllers/playlist.controller.ts
├── routes/playlist.routes.ts
└── db/models/            # song, playlist, album models
```

## Database Schema (PostgreSQL)

### songs

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | PK |
| metadata_provider | TEXT | Source of metadata |
| title, artist | TEXT | Song info |
| external_id, thumbnail | TEXT | External data |
| metadata_status | TEXT | pending→enriching→completed/failed |
| ai_status | TEXT | pending→processing→completed/failed |
| ai_data | JSONB | Gemini response |
| album_id | FK | To albums |

### playlists, albums, playlist_songs
Standard relational tables. See migrations for full schema.

Migrations: `001` → `006` (apply in order)

## Types

```typescript
type MetadataStatus = 'pending' | 'enriching' | 'completed' | 'failed'
type AiStatus = 'pending' | 'processing' | 'completed' | 'failed'
type MusicProvider = 'youtube' | 'spotify' | 'apple_music' | 'other'
type MetadataProvider = 'genius' | null

interface AiData { adjectives: string[]; meaning: string; trivia: string[] }
interface Song { id; metadata_provider; title; artist; metadata_status; ai_status; ai_data; ... }
```

## API Routes

### GET /api/health

```json
{ "status": "ok" }
```

### POST /api/playlists/import

```json
// Request
{ "url": "https://youtube.com/playlist?list=xxx", "process_ai": true }

// Response (202)
{ "playlistId": 123, "status": "importing" }
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
- Updates metadata_status, album data

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

1. **Async** - Never block HTTP responses
2. **Separation** - Metadata and AI as independent workers
3. **Rate Limiting** - 1s (metadata), 2s (AI)
4. **JSON Mode** - Gemini returns typed JSON
5. **Structured Logging** - Pino with service context
6. **Graceful Degradation** - AI runs even if metadata fails
