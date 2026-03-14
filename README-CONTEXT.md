# Project: playlist-share (Internal Context)

## Overview

A collaborative web app for sharing and reviewing YouTube Music playlists enriched by AI.

## Tech Stack

- Frontend: Vue.js 3 (Composition API, Pinia, Vite).
- Backend: Node.js (Express).
- Database & Auth: Supabase (PostgreSQL).
- AI: Gemini 1.5 Flash (Google Generative AI SDK).
- APIs: YouTube Data API v3, Genius API.

## Core Features

1. Multi-user system (Users share playlists with each other).
2. Recognition of YouTube Music playlist URLs.
3. AI Analysis: Every song must have:
   - 3 Adjectives (vibe).
   - Core Meaning (1-3 sentences).
   - Trivia (2-3 facts).
4. Ratings (1-5 stars) and comments per user, per song.

## Data Schema Requirements

- Users: Managed by Supabase Auth.
- Profiles: username, avatar_url.
- Songs: yt_url, title, artist, ai_data (JSON with adjectives, meaning, trivia).
- Playlists: yt_playlist_id, creator_id.
- Shares: links a playlist to a sender and a receiver.
- Reviews: rating and comment per song/user/playlist context.

## Constraints

- Cost-efficient: Use free tiers (Gemini, Supabase).
- Performance: Async AI processing (don't block the UI).
- Caching: If a song is in the DB, do NOT call the AI again.
