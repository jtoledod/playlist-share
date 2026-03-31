# playlist-share Agent Guide

The primary handbook for AI agents collaborating on this project.

---

## 1. Project Mission & Vision

### Name

`playlist-share`

### Core Purpose

A social curation tool for music enthusiasts. It goes beyond link-sharing by
using AI (Gemini 1.5 Flash) to generate deep insights (meaning, trivia, mood)
that spark conversation between users (e.g., Sender and Receiver).

### Key Philosophy

**Music discovery is better when shared and discussed.**

### Platform Design

- **Provider-Agnostic:** Support YouTube, Spotify, Apple Music, and other
  providers via `provider` and `external_id` fields
- **AI-First:** Every song gets enriched with Gemini-generated insights
- **Social-First:** Sender-to-Receiver sharing model with privacy (only
  participants can view)

---

## 2. Documentation Map

This project uses a hierarchical documentation system. Each file serves a
specific purpose:

### README.md (Root)

**Purpose:** High-level vision and local setup instructions.

**Content:**

- Project tagline and description
- Tech stack overview
- Features list
- Prerequisites (Node.js 22+, Supabase)
- Quick Start guide (install + run)
- Environment variables
- License

**When to read:** First time setting up the project or as a quick reference.

---

### docs/BLUEPRINT.md

**Purpose:** The Technical Source of Truth.

**Content:**

- Full tech stack (Backend + Frontend + External APIs)
- Project structure (server/src/ directory layout)
- Complete database schema (all 7 tables)
- TypeScript types and interfaces
- API routes with auth requirements
- Background workers (MetadataWorker, AiWorker) with throttle settings
- External API rate limits
- Build commands
- Architecture decisions

**When to read:** When implementing new features, understanding data models,
or modifying API routes.

---

### docs/ROADMAP.md

**Purpose:** Project tracking and development history.

**Content:**

- Current status (Phase 3: Frontend Development)
- Phase 1: Infrastructure (completed)
- Phase 2: Core Engine (completed)
- Phase 3: Frontend Development (in progress)
- Phase 4: Future Enhancements (pending)

**When to read:** When deciding what features to work on next or understanding
what's been completed.

---

### docs/USER_JOURNEY.md

**Purpose:** UX/UI logic and user interaction flows.

**Content:**

- User flow diagram (Landing → Auth → Dashboard → Import → Listening Room)
- Authentication flows (register, login, Google OAuth, password reset)
- Dashboard components
- Import playlist flow
- My Playlists (Sent) view
- Received Playlists view
- Listening Room details (song list, reactions, AI insights, comments)
- Sharing flow
- Privacy model
- Error states

**When to read:** When building frontend components or designing new user
interactions.

---

### docs/API_SPEC.md

**Purpose:** Detailed endpoint documentation.

**Content:**

- Authentication requirements (Supabase JWT)
- Auth endpoints (8 routes with request/response examples)
- Playlist endpoints (3 routes)
- Shares endpoints (4 routes)
- Reactions endpoints (2 routes)
- Comments endpoints (4 routes)
- Error responses

**When to read:** When integrating with the API or building the frontend API
client.

---

### docs/AGENT-GUIDE.md (This File)

**Purpose:** The master reference for AI agents.

**Content:**

- Project mission and philosophy
- Documentation map (this section)
- Technical commandments (mandatory rules)
- How to use this guide

**When to read:** First. Always. Before proposing any changes.

---

## 3. Technical Commandments

These are **mandatory rules**. All code must follow these standards.

### Code Structure

1. **ES6 Classes with Singleton Exports**

   ```typescript
   // Service
   let youtubeService: YouTubeService | null = null
   export function getYouTubeService(): YouTubeService {
     if (!youtubeService) youtubeService = new YouTubeService()
     return youtubeService
   }

   // Controller/Model/Middleware
   export class PlaylistController {
     async list(req: Request, res: Response): Promise<void> { ... }
   }
   export const playlistController = new PlaylistController()
   ```

2. **File Naming: camelCase**

   - `playlist.controller.ts`
   - `share.routes.ts`
   - `auth.middleware.ts`

3. **Class Naming: PascalCase**

   - `PlaylistController`, `ShareModel`, `AuthMiddleware`

4. **Variable/Function Naming: camelCase**

   - `userId`, `playlistId`, `getSupabase()`, `findAll()`

### Authentication

1. **JWT Validation via Supabase**

   ```typescript
   const { data: { user }, error } = await getSupabase().auth.getUser(token)
   req.userId = user.id
   ```

2. **Protected Routes Use Middleware Chaining**

   ```typescript
   router.post('/', (req, res, next) => authMiddleware.handle(req, res, next),
     (req, res) => controller.create(req, res))
   ```

3. **Extend Request Interface for Auth**

   ```typescript
   export interface AuthRequest extends Request {
     userId?: string
   }
   ```

### Error Handling

1. **Controllers Use Try-Catch**

   ```typescript
   try {
     // async operations
   } catch (error: any) {
     logger.error({ error: error?.message || error }, 'Operation failed')
     res.status(500).json({ error: 'User-friendly message', details:
       error?.message })
   }
   ```

2. **Models Throw Errors**

   - Models throw errors; controllers catch and respond
   - Handle "not found" gracefully: `if (error && error.code !== 'PGRST116')
     throw error`

### Logging

1. **Use Pino with Service Context**

   ```typescript
   const logger = createLogger('service-name')
   logger.info({ userId }, 'Operation succeeded')
   logger.error({ error }, 'Operation failed')
   ```

### Database

1. **Singleton Supabase Client**

   ```typescript
   let supabase: SupabaseClient | null = null
   export function getSupabase(): SupabaseClient {
     if (!supabase) supabase = createClient(url, key)
     return supabase
   }
   ```

2. **Use Chainable Supabase API**

   ```typescript
   .select('*')
   .eq('column', value)
   .order('created_at', { ascending: false })
   ```

### API Responses

1. **Use Consistent Status Codes**

   | Code | Usage |
   | ----- | ----- |
   | 200 | Success (default) |
   | 201 | Resource created |
   | 400 | Bad request |
   | 401 | Unauthorized |
   | 404 | Not found |
   | 500 | Server error |

2. **Error Response Format**

   ```typescript
   res.status(500).json({ error: 'User-friendly message', details:
     error?.message })
   ```

### Background Workers

1. **Respect Rate Limits**

   - MetadataWorker: 1 second throttle
   - AiWorker: 2 seconds throttle
   - Never block HTTP responses; workers run in background

### Architecture

1. **Provider-Agnostic Design**

   - All database tables include `provider` and `external_id` fields
   - Services are provider-specific (YouTubeService, SpotifyService, etc.)
   - Unified interface: `ProviderPlaylistData` with `tracks[]`

2. **Graceful Degradation**

   - AI processing continues even if metadata enrichment fails
   - Nullable metadata fields: `external_id`, `metadata_provider`

### Performance & Cost

1. **Asynchronous Workers for Heavy Tasks**

   - All AI/Metadata enrichment must run via background workers
     (MetadataWorker, AiWorker)
   - API should respond immediately with **202 Accepted** status
   - Never block HTTP responses with expensive operations
   - Workers run asynchronously with throttled processing (1s for metadata,
     2s for AI)

2. **Cost Efficiency - Smart Caching**

   - Always check the database for existing song analysis before calling
     Gemini API
   - Query the `songs` table for existing metadata/insights before
     enrichment
   - If `insights` or `metadata` already exists, skip the API call
   - This preserves tokens and reduces costs

---

## 4. How to Use This Guide

### For AI Agents

#### Step 1: Read This File First

Before doing anything, read `docs/AGENT-GUIDE.md`. This file contains:

- Project mission and philosophy
- Where to find technical details
- Mandatory coding standards

#### Step 2: Understand the Context

Use the Documentation Map to find the right reference:

| Need | Read |
| ----- | ----- |
| Setup the project locally | `README.md` |
| Understand the tech stack | `docs/BLUEPRINT.md` |
| See what's been built | `docs/ROADMAP.md` |
| Design a user interaction | `docs/USER_JOURNEY.md` |
| Integrate with the API | `docs/API_SPEC.md` |
| Write code that matches the project | `docs/AGENT-GUIDE.md` (this file) |

#### Step 3: Follow the Technical Commandments

All code must follow the 19 rules in Section 3. Review them before writing
code. Key points:

- Use ES6 classes with singleton exports
- Use Supabase for auth and database
- Use Pino for logging
- Handle errors in controllers, throw in models
- Respect rate limits in workers

#### Step 4: Check Existing Patterns

Before implementing new features:

1. Look at existing services, controllers, models in the same layer
2. Match the naming conventions
3. Use the same error handling and logging patterns
4. Ensure API responses follow the established format

#### Step 5: Verify Changes

After making changes:

1. Run `npm run build` to verify compilation
2. Ensure no breaking changes to existing API contracts
3. Update documentation if adding new endpoints or changing behavior

---

### Anti-Patterns (Do Not Do)

- ❌ Using default exports
- ❌ Using callback patterns (use async/await)
- ❌ Logging with `console.log` (use Pino)
- ❌ Hardcoding database queries outside models
- ❌ Blocking HTTP responses with background processing
- ❌ Using "YouTube only" language (use provider-agnostic patterns)
- ❌ Skipping error handling
- ❌ Making unprotected routes that should require auth

---

## Quick Reference

| Category | Pattern |
| ----- | ----- |
| Export | Singleton via getter function or instance |
| File Names | `camelCase.ts` |
| Classes | `PascalCase` |
| Auth | Supabase JWT, Bearer token |
| Logging | `createLogger('service')` |
| Database | Singleton `getSupabase()` |
| Workers | 1s (metadata), 2s (AI) throttle |
| Status Codes | 200/201/202/400/401/404/500 |
| Caching | Check DB before Gemini API calls |

---

*This file is the single source of truth for AI agent collaboration standards.*
