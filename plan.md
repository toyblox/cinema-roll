# plan.md

This file tracks the development context and roadmap for Cinema Roll. Update this as you work.

## What This App Is

Cinema Roll is a personal movie recommendation app. The core use case is answering "What are we watching tonight?" by using AI to recommend movies based on the user's taste (derived from their watched and to-watch lists).

## Current State

The app is functional with these features complete:

### Core Features
- **AI Recommendations**: Claude analyzes watched + to-watch lists and recommends a movie
- **Movie Search**: TMDB integration for searching and adding movies
- **Two Lists**: "To Watch" (queue) and "Watched" (history)
- **Personal Ratings**: 5-cinnamon-roll rating system for watched movies (inline prompt when adding)
- **Recommendations Modal**: After adding to Watched, shows 8 TMDB-recommended movies with option to add to either list

### Tech Stack
- React + Vite
- Supabase (PostgreSQL) for persistence
- TMDB API for movie data
- Anthropic Claude API for recommendations
- No auth (single user)

### Design
- Minimalist noir aesthetic
- Dark background (#0a0a0a)
- Copper accent (#c17f59)
- DM Serif Display for headings (soft, elegant serif)
- Inter for body text (clean, light)
- Custom cinnamon roll SVG icons for ratings (icing drizzle style)
- Cinnamon roll favicon (outline style)

## Design Decisions Made

1. **Recommendation-first**: The landing page is the recommendation hero, not a list view
2. **Three main tabs**: Recommend (default) | Lists | Search
3. **Modal for similar movies**: Chosen over inline expansion for cleaner UX
4. **Rating is optional**: Users can skip rating when adding to watched
5. **No auth**: Single user app, simpler to use

## Future Features Discussed

These were mentioned but not yet built:

1. **Mood-based picks** - Get recommendations based on current mood (e.g., "something light", "make me cry", "mind-bending")
2. **Reviews** - The database has a `review` column but UI doesn't use it yet
3. **List sorting** - Sort movies in both lists by genre, rating, date added, alphabetical
4. **UI spacing fixes** - Various spacing issues to address

## File Structure

```
public/
└── favicon.svg          # Cinnamon roll favicon (outline style)
src/
├── App.jsx              # Main app, state management, tab routing
├── components/
│   ├── MovieCard.jsx    # Card with poster, CinnamonRoll rating, actions
│   └── SimilarMoviesModal.jsx  # Post-add modal with related movies
├── lib/
│   ├── supabase.js      # Database client
│   ├── tmdb.js          # Movie search, details, recommendations
│   └── claude.js        # AI recommendation generation
└── index.css            # All styles (CSS custom properties)
```

## Database Schema

Single `movies` table:
- `id` (UUID) - primary key
- `tmdb_id` (INTEGER) - TMDB movie ID
- `title`, `poster_path`, `release_date`, `overview`, `vote_average` - movie data
- `list_type` (TEXT) - "to_watch" or "watched"
- `rating` (INTEGER 1-5) - user's personal rating
- `review` (TEXT) - user's review (not used in UI yet)
- `created_at` (TIMESTAMP)

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

### Next Session Should
- Work on list sorting functionality
- Address UI spacing issues
- Or work on whatever the user requests
