# User Journey

UX/UI logic and interaction flows for playlist-share.

---

## User Flow Overview

```
┌─────────┐    ┌───────────┐    ┌───────────┐    ┌─────────────┐    ┌───────────────┐
│ Landing │───▶│  Auth     │───▶│ Dashboard │───▶│ Import      │───▶│ Listening     │
│ Page    │    │ Login/    │    │           │    │ Playlist    │    │ Room          │
│         │    │ Register  │    │           │    │             │    │ (Share/React) │
└─────────┘    └───────────┘    └───────────┘    └─────────────┘    └───────────────┘
```

---

## 1. Landing Page

**Entry Point:** Unauthenticated users see the landing page.

**Content:**
- Project tagline and description
- "Get Started" button → Auth flow
- Features overview

**Actions:**
- Click "Get Started" → Navigate to Auth (Login/Register)

---

## 2. Authentication

**Methods Available:**
- Email + Password (register/login)
- Google OAuth

### Registration Flow
1. User enters email + password
2. Supabase creates user account
3. User redirected to Dashboard

### Login Flow
1. User enters email/password OR clicks "Continue with Google"
2. Supabase validates credentials
3. Returns JWT access token + refresh token
4. Token stored client-side (Supabase session)
5. User redirected to Dashboard

### Password Reset Flow
1. User clicks "Forgot Password"
2. Enters email address
3. Supabase sends reset email
4. User clicks link → enters new password
5. Password updated

---

## 3. Dashboard

**Authenticated users only.**

**Components:**
- User greeting
- Import Playlist form
- My Playlists (Sent shares)
- Received Playlists

### Import Playlist Form
```
Input: Playlist URL (YouTube/Spotify/Apple Music)
Checkbox: "Enable AI analysis" (default: on)
Button: "Import"
```

**Process:**
1. User pastes playlist URL
2. Clicks "Import"
3. Backend fetches playlist from provider
4. Returns immediately (202 Accepted)
5. Background workers process:
   - MetadataWorker: Enrich with Genius data
   - AiWorker: Generate AI insights (adjectives, meaning, trivia)
6. Status shown as "Importing..." → "Ready"

---

## 4. My Playlists (Sent)

**View:** Lists playlists the user has shared with others.

**Display:**
- Playlist thumbnail + title
- Recipient name/email
- Date shared
- Click to view full share details

---

## 5. Received Playlists

**View:** Lists playlists shared with the user.

**Display:**
- Playlist thumbnail + title
- Sender name/email
- Date received
- Unread indicator (if new)
- Click to open Listening Room

---

## 6. Listening Room

**Shared playlist view for sender + receiver.**

### Header
- Playlist title + thumbnail
- Sender → Receiver info
- Play on provider link

### Song List
Each song displays:
- Thumbnail
- Title + Artist
- Reaction buttons
- AI Insight toggle
- Comment count indicator

### Reactions (Per Song)

**Available Reactions:**
| Reaction | Icon | Meaning |
|----------|------|---------|
| `do_not_like` | 👎 | Don't like this song |
| `like` | 👍 | Like this song |
| `love` | ❤️ | Love this song |

**Interaction:**
- Click reaction button to set
- Click same button again to remove
- Click different button to change
- Both users see each other's reactions

**Data Model:**
```
share_song_reactions: { share_id, song_id, user_id, reaction }
```

### AI Insights

**Toggle:** "Show AI Insights"

**Displays when enabled:**
```
🎵 Song Title - Artist

✨ Vibes: adjective1, adjective2, adjective3

📖 Meaning:
The core meaning of the song...

💡 Trivia:
- Fact 1
- Fact 2
- Fact 3
```

**Source:** `songs.ai_data` (Gemini JSON response)

### Comments (Per Song)

**Threaded comments on each song.**

**Add Comment:**
- Text input below song
- Click "Comment" to post

**View Comments:**
- Shows all comments for the song
- Threaded replies indented

**Reply to Comment:**
- Click "Reply" on any comment
- Opens inline reply input

**Edit/Delete:**
- User can edit/delete own comments
- Cannot modify others' comments

**Data Model:**
```
share_comments: { share_id, song_id, parent_id?, user_id, content }
```

---

## 7. Sharing Flow

**From Dashboard:**

1. Select imported playlist
2. Enter recipient email
3. Click "Share"
4. Backend creates share record:
   ```
   shares: { playlist_id, sender_id, receiver_id }
   ```
5. Recipient sees playlist in "Received"

**Constraints:**
- Same user cannot share with themselves
- Duplicate shares (same playlist to same user) not allowed

---

## Privacy Model

**Visibility:**
- Only sender and receiver can view shared playlist
- Other users cannot access
- Public playlist listing (`GET /api/playlists`) shows all imported playlists but not shares

**Data Separation:**
- Shares table links `sender_id` and `receiver_id`
- All queries filtered by `user_id` from JWT

---

## Error States

| Scenario | User Feedback |
|----------|---------------|
| Invalid playlist URL | "Please enter a valid YouTube, Spotify, or Apple Music playlist URL" |
| Import failed | "Failed to import playlist. Please try again." |
| Share failed (not found user) | "User not found. Please check the email address." |
| Comment failed | "Failed to post comment. Please try again." |
| Session expired | "Your session has expired. Please log in again." |
