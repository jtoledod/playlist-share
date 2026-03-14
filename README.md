# 🎵 playlist-share (Alpha)

A collaborative web app for sharing and reviewing YouTube Music playlists enriched by AI.

## Tech Stack

* **Frontend:** Vue.js 3 (Composition API, Pinia, Vite, Tailwind CSS).
* **Backend:** Node.js (Express).
* **Intelligence:** Google Gemini 1.5 Flash (via SDK).
* **Data APIs:** YouTube Data API v3 & Genius API.
* **Database & Auth:** Supabase (PostgreSQL + Realtime).

## Features

* Add YouTube Music playlists via URL
* AI-powered song analysis (vibes, meaning, trivia)
* Share playlists with other users
* Rate and review songs
* Collaborative playlist experience

## Prerequisites

* Node.js 22
* npm or yarn
* Gemini API Key (get one at <https://aistudio.google.com/app/apikey>)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd playlist-share
```

1. Install root dependencies:

```bash
npm install
```

1. Install server dependencies:

```bash
cd server && npm install
```

1. Install client dependencies:

```bash
cd ../client && npm install
```

## Configuration

### Environment Variables

* Server: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `YOUTUBE_API_KEY`.

* Client: `VITE_API_URL`.

## Running the Project

### Development Mode (Recommended)

Run both frontend and backend simultaneously:

```bash
npm run dev
```

### Running Separately

**Backend:**

```bash
cd server
npm run dev
```

**Frontend:**

```bash
cd client
npm run dev
```

## License

ISC
