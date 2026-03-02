# plan.md

This file tracks the development context and roadmap for Cinema Roll. Update this as you work.

## What This App Is

Cinema Roll is a personal movie recommendation app. The core use case is answering "What are we watching tonight?" by using AI to recommend movies based on the user's taste (derived from their watched and to-watch lists). The Recommend tab is always the landing page — no login required to get a pick.

## Current State

The app is functional with these features complete:

### Core Features
- **AI Recommendations**: Claude analyzes watched + to-watch lists and recommends a movie. Falls back to a general critically-acclaimed pick when no lists exist (e.g. logged out)
- **Movie Search**: TMDB integration for searching and adding movies
- **Two Lists**: "To Watch" (queue) and "Watched" (history), scoped per user
- **Personal Ratings**: 5-cinnamon-roll rating system for watched movies (inline prompt when adding)
- **Recommendations Modal**: After adding to Watched, shows 8 TMDB-recommended movies with option to add to either list
- **User Auth**: Email + password via Supabase Auth. Each user has independent lists. Sign in / Create Account from the header. Display name editable from profile settings.

### Tech Stack
- React + Vite
- Supabase (PostgreSQL + Auth) for persistence and user management
- TMDB API for movie data
- Anthropic Claude API for recommendations

### Design
- Minimalist noir aesthetic
- Dark background (#0a0a0a)
- Copper accent (#c17f59)
- DM Serif Display for headings (soft, elegant serif)
- Inter for body text (clean, light)
- Custom cinnamon roll SVG icons for ratings (icing drizzle style)
- Cinnamon roll favicon (outline style)

## Design Decisions Made

1. **Recommendation-first**: The landing page is the recommendation hero — always visible, no login required
2. **Three main tabs**: Recommend (default) | Lists | Search
3. **Modal for similar movies**: Chosen over inline expansion for cleaner UX
4. **Rating is optional**: Users can skip rating when adding to watched
5. **Open registration**: Anyone can create an account; no invite system
6. **Generic rec when logged out**: Instead of blocking, the recommend button always works — logged-out users get a well-regarded general pick with a hint to sign in for personalized results
7. **Lists/Search gated behind auth**: These tabs show a sign-in prompt when logged out since they have no useful state without an account

## Future Features

1. **Mood-based picks** — Get recommendations based on current mood (e.g., "something light", "make me cry", "mind-bending")
2. **Reviews** — The database has a `review` column but UI doesn't use it yet
3. **List sorting** — Sort movies in both lists by genre, rating, date added, alphabetical
4. **Awards / genre filters** — For non-logged-in users, filter the general rec by category

## File Structure

```
public/
└── favicon.svg                    # Cinnamon roll favicon (outline style)
src/
├── App.jsx                        # Main app, state management, tab routing, auth state
├── components/
│   ├── MovieCard.jsx              # Card with poster, CinnamonRoll rating, actions
│   ├── SimilarMoviesModal.jsx     # Post-add modal with related movies
│   ├── AuthModal.jsx              # Sign in / create account (toggle between modes)
│   └── ProfileSettings.jsx       # Edit display name modal
├── lib/
│   ├── supabase.js                # Supabase client + auth helpers (signIn/signUp/signOut/getProfile/updateProfile)
│   ├── tmdb.js                    # Movie search, details, recommendations
│   └── claude.js                  # AI recommendation generation (personalized or generic)
├── test/
│   ├── setup.js                   # Vitest + jest-dom setup
│   └── mocks/fixtures.js          # Shared test fixtures
└── index.css                      # All styles (CSS custom properties)
supabase-schema.sql                # Full DB schema — run once in Supabase SQL Editor
```

## Database Schema

### movies
- `id` (UUID) — primary key
- `tmdb_id` (INTEGER) — TMDB movie ID
- `title`, `poster_path`, `release_date`, `overview`, `vote_average` — movie data
- `list_type` (TEXT) — `to_watch` or `watched`
- `rating` (INTEGER 1–5) — user's personal rating
- `review` (TEXT) — user's review (not used in UI yet)
- `user_id` (UUID, FK → auth.users) — owner; RLS enforces per-user access
- `created_at` (TIMESTAMP)

### profiles
- `id` (UUID, FK → auth.users) — primary key
- `display_name` (TEXT) — auto-set to email prefix on signup via DB trigger
- `created_at` (TIMESTAMP)

RLS is enabled on both tables. Movies are fully scoped to the owning user.

## Session Log

### Session 1
- Built initial app with search, lists, recommendations
- Changed from colorful/playful to minimalist noir with copper accent
- Changed typography from Bebas Neue to DM Serif Display (softer, more elegant)
- Restructured UI to be recommendation-first with minimal top tabs
- Added similar movies modal for faster list building
- Set up GitHub repo at github.com/toyblox/cinema-roll

### Session 2
- Updated recommendations modal to allow choosing between "To Watch" and "Watched" lists
- Changed TMDB endpoint from `/similar` to `/recommendations` for better results
- Added inline rating prompt when adding to Watched from search
- Replaced star ratings with custom cinnamon roll SVG icons (icing drizzle style)
- Added cinnamon roll favicon (outline style)

### Session 3
- Connected Claude API for AI-powered movie recommendations
- Fixed UI spacing issues in SimilarMoviesModal overlays
- Set up testing infrastructure: Vitest + React Testing Library
- 19 tests across MovieCard and tmdb.js

### Session 4
- Added Supabase Auth (email + password, open registration)
- Per-user movie lists with RLS policies on `movies` table
- New `profiles` table with auto-creation trigger on signup
- AuthModal component: sign in / create account with mode toggle
- ProfileSettings component: editable display name
- Recommend tab always enabled — generic pick when logged out, personalized when logged in
- Lists and Search tabs show sign-in prompt when logged out
- Updated supabase-schema.sql with full new schema + migration instructions
- 87 tests total (68 new: AuthModal, ProfileSettings, supabase helpers, App auth integration)
