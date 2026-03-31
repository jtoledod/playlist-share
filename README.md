# playlist-share

A collaborative web platform for music enthusiasts. Import playlists from YouTube, Spotify, or Apple Music, enriched with AI-generated insights via Gemini, and share them with friends to exchange reactions and comments on individual songs.

## Tech Stack

- **Frontend:** Vue.js 3 (Composition API, Pinia, Vite, Tailwind CSS)
- **Backend:** Node.js 22+, Express 5 (ESM, TypeScript)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Google OAuth + Email/Password)
- **Intelligence:** Google Gemini 1.5 Flash

## Features

- Import playlists from YouTube, Spotify, or Apple Music via URL
- AI-powered song analysis (adjectives, meaning, trivia)
- Share playlists with other users
- React to songs (do_not_like, like, love)
- Per-song comments with threaded replies
- Privacy: Only sender and receiver can view shared playlists

## Prerequisites

- Node.js 22+
- Supabase project
- API Keys: Gemini, YouTube/Spotify/Apple Music (as needed)

## Quick Start

```bash
# Clone and install
git clone https://github.com/jtoledod/playlist-share.git
cd playlist-share
npm install

# Backend
cd server && npm install && npm run dev

# Frontend
cd ../client && npm install && npm run dev
```

## Environment Variables

### Server (.env)

```
GEMINI_API_KEY=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
YOUTUBE_API_KEY=...
# Add Spotify/Apple Music keys as needed
```

### Client (.env)

```
VITE_API_URL=http://localhost:3000
```

## License

ISC
