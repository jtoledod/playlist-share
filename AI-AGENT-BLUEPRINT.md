# 🤖 AI Agent Blueprint: playlist-share

## 📋 Project Overview

Full-stack web application for importing YouTube playlists with AI-powered song analysis.

- Import playlists from YouTube (extensible to other providers)
- Enrich song metadata using Genius API
- Generate AI-powered analysis (mood, meaning, trivia) using Google Gemini
- Share playlists with other users
- Rate and review songs within playlists

## 🛠️ Technical Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js >= 22.0.0 |
| Framework | Express 5.x (ESM) |
| Language | TypeScript 5.x |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini |
| Logging | Pino |
| Package Manager | npm |

## 📁 Project Structure

```
playlist-share/
├── server/
│   ├── src/
│   │   ├── index.ts              # Express app entry point
│   │   ├── env.ts                # Environment configuration (dotenv)
│   │   ├── logger.ts             # Pino logger with service contexts
│   │   ├── types/index.ts        # TypeScript interfaces & types
│   │   ├── utils/
│   │   │   └── fuzzy-matcher.ts  # Fuzzy string matching algorithms
│   │   ├── services/
│   │   │   ├── genius.service.ts     # Metadata enrichment (Genius API)
│   │   │   ├── youtube.service.ts    # Playlist fetching (YouTube API)
│   │   │   ├── gemini.service.ts     # AI analysis (Gemini API)
│   │   │   └── worker.service.ts     # Background job processing
│   │   ├── controllers/
│   │   │   └── playlist.controller.ts # Request handlers
│   │   ├── routes/
│   │   │   └── playlist.routes.ts     # Route definitions
│   │   └── db/
│   │       ├── index.ts                # Supabase client
│   │       └── models/                 # Database models
│   │           ├── album.model.ts
│   │           ├── playlist.model.ts
│   │           └── song.model.ts
│   ├── supabase/
│   │   └── migrations/          # Database migrations
│   ├── package.json
│   └── tsconfig.json
└── AI-AGENT-BLUEPRINT.md        # This file
```

## 🔐 Environment Variables

Create `.env.local` for development or `.env` for production:

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | No | `production` or `development` (default: development) |
| `PORT` | No | Server port (default: `3000`) |
| `LOG_LEVEL` | No | Pino log level: `trace`, `debug`, `info`, `warn`, `error`, `fatal` (default: `info`) |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `YOUTUBE_API_KEY` | Yes | YouTube Data API v3 key |
| `GENIUS_ACCESS_TOKEN` | No | Genius API access token for metadata enrichment |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |

## 🗄️ Database Schema (PostgreSQL)

Migrations are in `server/supabase/migrations/`. Apply in order: `001` → `002` → `003` → `004`.

### playlists

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| provider | TEXT | NOT NULL, DEFAULT 'youtube' | Music provider |
| external_id | TEXT | NOT NULL | Provider-specific playlist ID |
| title | TEXT | NOT NULL | Playlist title |
| description | TEXT | NULL | Playlist description |
| thumbnail | TEXT | NULL | Cover image URL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

### songs

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| metadata_provider | TEXT | NOT NULL, DEFAULT 'genius' | Source of metadata |
| title | TEXT | NOT NULL | Song title |
| artist | TEXT | NOT NULL | Artist name |
| external_id | TEXT | NOT NULL | Original track ID |
| thumbnail | TEXT | NULL | Cover art URL |
| load_status | TEXT | NOT NULL, DEFAULT 'pending' | Analysis status |
| ai_data | JSONB | NOT NULL, DEFAULT '{}' | Gemini analysis result |
| album_id | INTEGER | REFERENCES albums(id) | FK to album |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**load_status values:**
- `pending` - Track imported, awaiting worker
- `processing` - Worker currently calling AI
- `completed` - ai_data populated successfully
- `failed` - Process failed (API error or lyrics not found)

### albums

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| metadata_provider | TEXT | NOT NULL | Source of metadata |
| external_id | TEXT | NOT NULL, UNIQUE (with provider) | External album ID |
| name | TEXT | NULL | Album name |
| cover_art | TEXT | NULL | Album cover URL |
| release_date | TIMESTAMP | NULL | Release date |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

### playlist_songs (junction table)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| playlist_id | INTEGER | NOT NULL, REFERENCES playlists(id) ON DELETE CASCADE | FK to playlist |
| song_id | INTEGER | NOT NULL, REFERENCES songs(id) ON DELETE CASCADE | FK to song |
| music_provider | TEXT | NOT NULL, DEFAULT 'youtube' | Which provider this track is from |
| external_id | TEXT | NOT NULL | Track ID from provider |
| external_url | TEXT | NOT NULL | URL to play track |
| thumbnail | TEXT | NULL | Track thumbnail |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| | | UNIQUE(playlist_id, song_id, music_provider) | Composite unique constraint |

### Indexes

```sql
-- playlists
idx_playlists_provider ON playlists(provider)
idx_playlists_external_id ON playlists(external_id)

-- songs
idx_songs_title_artist ON songs(title, artist)

-- albums
idx_albums_provider_external_id ON albums(metadata_provider, external_id)

-- playlist_songs
idx_playlist_songs_playlist_id ON playlist_songs(playlist_id)
idx_playlist_songs_song_id ON playlist_songs(song_id)
idx_playlist_songs_music_provider ON playlist_songs(music_provider)
```

## 📝 TypeScript Types

Located in `server/src/types/index.ts`:

```typescript
// Status types
type LoadStatus = 'pending' | 'processing' | 'completed' | 'failed'
type MusicProvider = 'youtube' | 'spotify' | 'apple_music' | 'other'
type MetadataProvider = 'genius' | null

// AI response from Gemini
interface AiData {
  adjectives: string[]  // Exactly 3 adjectives describing mood/vibe
  meaning: string      // 1-3 sentences explaining song's message
  trivia: string[]     // 3 interesting facts
}

// Database models
interface Playlist { ... }
interface Song { ... }
interface Album { ... }
interface PlaylistSong { ... }

// Input types
interface PlaylistCreateInput { ... }
interface SongCreateInput { ... }
interface PlaylistSongCreateInput { ... }

// Provider types
interface ProviderTrackItem {
  title: string
  artist: string
  external_id: string
  external_url: string
  thumbnail: string | null
}

interface ProviderPlaylistData {
  provider: MusicProvider
  external_id: string
  title: string
  description: string | null
  thumbnail: string | null
  tracks: ProviderTrackItem[]
}
```

## 🔌 API Routes

### GET /api/health

Health check endpoint.

**Response:**
```json
{ "status": "ok" }
```

### POST /api/playlists/import

Import a YouTube playlist.

**Request:**
```json
{
  "url": "https://www.youtube.com/playlist?list=PLxxxxx",
  "process_ai": true  // Optional, default: true
}
```

**Response (202 Accepted):**
```json
{
  "playlistId": 123,
  "status": "importing"
}
```

**Errors:**
- 400: Invalid YouTube playlist URL
- 500: Failed to import playlist

## 🧩 Services

### YouTubeService (`src/services/youtube.service.ts`)

Fetches playlist data from YouTube Data API v3.

**Methods:**
```typescript
class YouTubeService {
  extractPlaylistId(url: string): string | null
  fetchPlaylistDetails(playlistId: string): Promise<YouTubePlaylistDetails>
  fetchPlaylistTracks(playlistId: string): Promise<ProviderTrackItem[]>
  getPlaylistTracks(url: string): Promise<ProviderPlaylistData>
}
```

**Returns:**
```typescript
interface YouTubePlaylistDetails {
  title: string
  description: string | null
  thumbnail: string | null
}
```

### GeniusService (`src/services/genius.service.ts`)

Enriches song metadata using Genius API. Includes in-memory caching.

**Methods:**
```typescript
class GeniusService {
  searchSong(query: string, originalTitle: string, originalArtist: string): Promise<GeniusSongResult | null>
  getSongDetails(geniusId: number): Promise<GeniusSongResult | null>
}
```

**Returns:**
```typescript
interface GeniusSongResult {
  id: number
  title: string
  artist: string
  album?: string
  albumArt?: string
  releaseDate?: string
  lyricsUrl?: string
}
```

**Features:**
- Uses fuzzy matching to find best song match
- Results cached in memory (Map)
- Thresholds: title >= 0.65, artist >= 0.6

### GeminiService (`src/services/gemini.service.ts`)

Generates AI-powered song analysis using Google Gemini.

**Methods:**
```typescript
class GeminiService {
  analyzeSong(title: string, artist: string): Promise<AiData>
}
```

**Returns:**
```typescript
interface AiData {
  adjectives: string[]  // ["melancholic", "upbeat", "nostalgic"]
  meaning: string       // "This song explores..."
  trivia: string[]      // ["Produced by...", "Recorded in..."]
}
```

**Configuration:**
- Model: `gemini-3-flash-preview`
- Response format: JSON with schema validation
- System prompt instructs Gemini to provide deep, emotional, and technical insights

### WorkerService (`src/services/worker.service.ts`)

Background job processor for AI analysis.

**Methods:**
```typescript
class WorkerService {
  processPlaylistSongs(songs: Song[]): Promise<void>
}
```

**Features:**
- 2-second throttle between AI requests (respects rate limits)
- Updates song status: pending → processing → completed/failed
- Caches results to avoid re-processing completed songs

## 🔍 Algorithms

### Fuzzy Matching (`src/utils/fuzzy-matcher.ts`)

Matches YouTube track titles/artists to Genius search results.

**FuzzyMatcher class:**

```typescript
class FuzzyMatcher {
  // Token-based similarity using Jaccard index
  // Good for word reordering ("The Beatles" vs "Beatles")
  static jaccardSimilarity(str1: string, str2: string): number

  // Character edit distance similarity
  // Good for typos and minor variations
  static levenshteinSimilarity(str1: string, str2: string): number

  // Combined weighted score
  // 60% Jaccard + 40% Levenshtein + 10% exact match bonus
  static fuzzyMatch(str1: string, str2: string): number

  // Full song matching with thresholds
  static matchSong(
    originalTitle: string,
    originalArtist: string,
    resultTitle: string,
    resultArtist: string
  ): {
    matches: boolean
    titleScore: number
    artistScore: number
  }
}
```

**Thresholds:**
- Title: 0.65 (65% similarity required)
- Artist: 0.60 (60% similarity required)

## 📦 Build & Run

### Prerequisites
- Node.js >= 22.0.0
- npm installed

### Install Dependencies
```bash
cd server
npm install
```

### Development
```bash
npm run dev
```
Starts server with nodemon + tsx. Auto-reloads on file changes.

### Production Build
```bash
npm run build    # Compiles with esbuild to dist/
npm run start    # Runs compiled server
```

### Environment Setup
1. Copy `.env.local.example` to `.env.local`
2. Fill in required API keys
3. Run `npm run dev` to start

## ⚙️ Architecture Principles

1. **Async AI Processing** - Never block HTTP responses; use background workers
2. **Caching** - Skip AI calls if song already has `completed` status
3. **Rate Limiting** - 2-second delay between Gemini requests
4. **JSON Mode** - Always use Gemini JSON schema for type safety
5. **Structured Logging** - All logs via Pino with service context
6. **Provider Agnostic** - Unified schema supports multiple music providers
7. **Fuzzy Matching** - Use Jaccard + Levenshtein for robust song matching

## 🎯 Development Guidelines

### Adding a New Music Provider
1. Add provider to `MusicProvider` type in `types/index.ts`
2. Create new service (e.g., `spotify.service.ts`)
3. Implement similar interface to YouTubeService
4. Update `importPlaylist` controller to detect and handle new provider

### Adding New AI Fields
1. Update GeminiService system prompt
2. Update AiData interface in `types/index.ts`
3. Update Gemini output schema in `gemini.service.ts`
4. Update database: `ALTER TABLE songs ADD COLUMN` if needed

### Modifying Fuzzy Matching
- Adjust thresholds in `FuzzyMatcher.matchSong()`
- Weights can be changed in `FuzzyMatcher.fuzzyMatch()`
- Test with edge cases: re-ordered words, typos, special characters
