# API Specification

Detailed endpoint documentation with request/response formats.

---

## Authentication

All authenticated endpoints require a Supabase JWT access token in the
Authorization header:

```text
Authorization: Bearer <access_token>
```

**Token Flow:**

1. Login/Register returns `access_token` + `refresh_token`
2. Include `access_token` in requests to protected endpoints
3. When `access_token` expires, use `/api/auth/refresh` with `refresh_token`
4. New `access_token` + `refresh_token` pair returned

---

## Health

### GET /api/health

Health check endpoint.

**Auth:** No

**Response:**

```json
{ "status": "ok" }
```

---

## Auth Endpoints

### POST /api/auth/register

Register with email and password.

**Auth:** No

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (201):**

```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "session": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_in": 3600,
    "expires_at": 1234567890
  }
}
```

---

### POST /api/auth/login

Login with email and password.

**Auth:** No

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**

```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "session": { ... }
}
```

---

### POST /api/auth/login/google

Initiate Google OAuth flow.

**Auth:** No

**Request:** Empty body

**Response (200):**

```json
{
  "url": "https://accounts.google.com/oauth/authorize?..."
}
```

**Usage:** Redirect user to `url`, then exchange returned code for session via
Supabase.

---

### POST /api/auth/logout

Sign out current user.

**Auth:** Yes

**Request:** Empty body

**Response (200):**

```json
{ "message": "Logged out successfully" }
```

---

### GET /api/auth/me

Get current authenticated user.

**Auth:** Yes

**Response (200):**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "email_confirmed_at": "2024-01-01T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### POST /api/auth/refresh

Refresh access token using refresh token.

**Auth:** No

**Request:**

```json
{
  "refresh_token": "..."
}
```

**Response (200):**

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600,
  "expires_at": 1234567890
}
```

---

### POST /api/auth/forgot-password

Request password reset email.

**Auth:** No

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Response (200):**

```json
{ "message": "Password reset email sent" }
```

---

### POST /api/auth/reset-password

Reset password using reset token.

**Auth:** No

**Request:**

```json
{
  "token": "reset_token_from_email",
  "password": "newSecurePassword123"
}
```

**Response (200):**

```json
{ "message": "Password reset successfully" }
```

---

## Playlist Endpoints

### GET /api/playlists

List all public playlists.

**Auth:** No

**Response (200):**

```json
[
  {
    "id": 1,
    "title": "My Playlist",
    "description": "Great songs",
    "thumbnail": "https://...",
    "provider": "youtube",
    "track_count": 25,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### GET /api/playlists/:id

Get playlist with songs.

**Auth:** No

**Params:** `id` - Playlist ID

**Response (200):**

```json
{
  "id": 1,
  "provider": "youtube",
  "external_id": "PLxxx",
  "title": "My Playlist",
  "description": "Great songs",
  "thumbnail": "https://...",
  "created_at": "2024-01-01T00:00:00Z",
  "songs": [
    {
      "id": 1,
      "title": "Song Title",
      "artist": "Artist Name",
      "thumbnail": "https://...",
      "metadata_status": "completed",
      "ai_status": "completed",
      "ai_data": {
        "adjectives": ["upbeat", "energetic", "catchy"],
        "meaning": "A song about...",
        "trivia": ["Fact 1", "Fact 2"]
      }
    }
  ]
}
```

---

### POST /api/playlists/import

Import playlist from URL.

**Auth:** Yes

**Request:**

```json
{
  "url": "https://youtube.com/playlist?list=PLxxx",
  "process_ai": true
}
```

**Response (202):**

```json
{
  "playlistId": 1,
  "status": "importing"
}
```

**Notes:**

- Returns immediately; processing happens in background
- `process_ai` defaults to `true`

---

## Share Endpoints

### POST /api/shares

Share playlist with another user.

**Auth:** Yes

**Request:**

```json
{
  "playlist_id": 1,
  "receiver_id": "recipient-uuid"
}
```

**Response (201):**

```json
{
  "id": 1,
  "playlist_id": 1,
  "sender_id": "sender-uuid",
  "receiver_id": "recipient-uuid",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### GET /api/shares/sent

List playlists shared by current user.

**Auth:** Yes

**Response (200):**

```json
[
  {
    "id": 1,
    "playlist_id": 1,
    "receiver_id": "recipient-uuid",
    "receiver_email": "friend@example.com",
    "created_at": "2024-01-01T00:00:00Z",
    "playlist": { "id": 1, "title": "...", "thumbnail": "..." }
  }
]
```

---

### GET /api/shares/received

List playlists shared with current user.

**Auth:** Yes

**Response (200):**

```json
[
  {
    "id": 1,
    "playlist_id": 1,
    "sender_id": "sender-uuid",
    "sender_email": "friend@example.com",
    "created_at": "2024-01-01T00:00:00Z",
    "playlist": { "id": 1, "title": "...", "thumbnail": "..." }
  }
]
```

---

### GET /api/shares/:id

Get share with songs, reactions, and comments.

**Auth:** Yes

**Params:** `id` - Share ID

**Response (200):**

```json
{
  "id": 1,
  "playlist_id": 1,
  "sender_id": "sender-uuid",
  "receiver_id": "receiver-uuid",
  "created_at": "2024-01-01T00:00:00Z",
  "playlist": {
    "id": 1,
    "title": "My Playlist",
    "songs": [
      {
        "id": 1,
        "title": "Song Title",
        "artist": "Artist",
        "thumbnail": "...",
        "ai_data": { ... },
        "reaction": "love",
        "reaction_user_id": "receiver-uuid",
        "comments": [
          {
            "id": 1,
            "user_id": "...",
            "content": "Great song!",
            "replies": [...]
          }
        ]
      }
    ]
  }
}
```

---

## Reaction Endpoints

### POST /api/shares/:id/reactions

Add or update reaction to a song.

**Auth:** Yes

**Params:** `id` - Share ID

**Request:**

```json
{
  "song_id": 1,
  "reaction": "love"
}
```

**Response (201):**

```json
{
  "id": 1,
  "share_id": 1,
  "song_id": 1,
  "user_id": "user-uuid",
  "reaction": "love"
}
```

---

### DELETE /api/shares/:id/reactions/:songId

Remove reaction from a song.

**Auth:** Yes

**Params:** `id` - Share ID, `songId` - Song ID

**Response (200):**

```json
{ "message": "Reaction removed" }
```

---

## Comment Endpoints

### POST /api/shares/:id/comments

Add comment to a song.

**Auth:** Yes

**Params:** `id` - Share ID

**Request:**

```json
{
  "song_id": 1,
  "content": "This song is amazing!"
}
```

**Response (201):**

```json
{
  "id": 1,
  "share_id": 1,
  "song_id": 1,
  "parent_id": null,
  "user_id": "user-uuid",
  "content": "This song is amazing!",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### PATCH /api/shares/:id/comments/:commentId

Edit own comment.

**Auth:** Yes

**Params:** `id` - Share ID, `commentId` - Comment ID

**Request:**

```json
{
  "content": "Updated comment text"
}
```

**Response (200):**

```json
{
  "id": 1,
  "content": "Updated comment text",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### DELETE /api/shares/:id/comments/:commentId

Delete own comment.

**Auth:** Yes

**Params:** `id` - Share ID, `commentId` - Comment ID

**Response (200):**

```json
{ "message": "Comment deleted" }
```

---

### POST /api/shares/:id/comments/:commentId/reply

Reply to a comment.

**Auth:** Yes

**Params:** `id` - Share ID, `commentId` - Parent comment ID

**Request:**

```json
{
  "content": "Great point! I agree."
}
```

**Response (201):**

```json
{
  "id": 2,
  "share_id": 1,
  "song_id": 1,
  "parent_id": 1,
  "user_id": "user-uuid",
  "content": "Great point! I agree.",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## Error Responses

All endpoints may return error responses:

### 400 Bad Request

```json
{ "error": "Invalid request body" }
```

---

### 401 Unauthorized

```json
{ "error": "No authorization token provided" }
```

or

```json
{ "error": "Invalid or expired token" }
```

---

### 403 Forbidden

```json
{ "error": "You do not have permission to perform this action" }
```

---

### 404 Not Found

```json
{ "error": "Resource not found" }
```

---

### 500 Internal Server Error

```json
{ "error": "Internal server error", "details": "..." }
```
