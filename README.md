# Playlist Share

A collaborative web app for sharing and reviewing YouTube Music playlists enriched by AI.

## Tech Stack

- **Frontend:** Vue.js 3 (Composition API, Pinia, Vite, Tailwind CSS)
- **Backend:** Node.js (Express)
- **AI:** Gemini 1.5 Flash (Google Generative AI SDK)
- **Database:** Supabase (PostgreSQL) - *Coming soon*
- **APIs:** YouTube Data API v3 - *Coming soon*

## Features

- Add YouTube Music playlists via URL
- AI-powered song analysis (vibes, meaning, trivia)
- Share playlists with other users
- Rate and review songs
- Collaborative playlist experience

## Prerequisites

- Node.js 18+
- npm or yarn
- Gemini API Key (get one at https://aistudio.google.com/app/apikey)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd playlist-share
```

2. Install root dependencies:
```bash
npm install
```

3. Install server dependencies:
```bash
cd server && npm install
```

4. Install client dependencies:
```bash
cd ../client && npm install
```

## Configuration

### Server (.env)

Create or edit `server/.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### Client (.env)

The client is pre-configured to proxy API requests to the backend. You can customize in `client/.env`:
```
VITE_API_URL=http://localhost:3000
```

## Running the Project

### Development Mode (Recommended)

Run both frontend and backend simultaneously:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

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

## Project Structure

```
playlist-share/
├── client/                 # Vue.js 3 frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── views/          # Page components
│   │   ├── stores/         # Pinia state management
│   │   └── router/        # Vue Router config
│   └── .env                # Client environment variables
├── server/                 # Node.js/Express backend
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   └── services/      # Business logic (AI, external APIs)
│   └── .env                # Server environment variables
└── README.md
```

## License

ISC
