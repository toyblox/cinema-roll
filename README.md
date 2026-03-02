# Cinema Roll

A personal movie recommendation app that answers "What are we watching tonight?" using AI to suggest films based on your taste.

## Features

- **AI Recommendations**: Claude analyzes your watched and to-watch lists to recommend movies tailored to your taste — or picks a great general film if you're not signed in
- **Movie Search**: Search and add movies via TMDB integration
- **Two Lists**: Maintain a "To Watch" queue and "Watched" history
- **Cinnamon Roll Ratings**: Rate watched movies on a 5-cinnamon-roll scale
- **Smart Suggestions**: After marking a movie as watched, get recommendations for similar films
- **User Accounts**: Email + password auth via Supabase — each user has independent lists

## Tech Stack

- **Frontend**: React + Vite
- **Database**: Supabase (PostgreSQL + Auth)
- **APIs**: TMDB (movie data), Anthropic Claude (AI recommendations)
- **Styling**: Vanilla CSS with custom properties

## Setup

### 1. Clone and install

```bash
git clone https://github.com/toyblox/cinema-roll.git
cd cinema-roll
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase-schema.sql` in the SQL Editor (Settings > SQL Editor)
3. Enable email auth: Authentication > Providers > Email — turn off "Confirm email" for local dev
4. Get your project URL and anon key from Settings > API

### 3. Get API keys

- **TMDB**: Create an account at [themoviedb.org](https://www.themoviedb.org/settings/api) and get an API key
- **Anthropic**: Get an API key from [console.anthropic.com](https://console.anthropic.com)

### 4. Configure environment

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project Structure

```
public/
  favicon.svg                  # Cinnamon roll favicon
src/
  App.jsx                      # Main app, state management, tab routing
  components/
    MovieCard.jsx              # Movie card with poster, ratings, actions
    SimilarMoviesModal.jsx     # Post-watch recommendations modal
    AuthModal.jsx              # Sign in / create account modal
    ProfileSettings.jsx        # Edit display name modal
  lib/
    supabase.js                # Supabase client + auth helpers
    tmdb.js                    # TMDB API (search, recommendations)
    claude.js                  # Claude API for AI recommendations
  test/
    setup.js                   # Test setup (jest-dom matchers)
    mocks/fixtures.js          # Shared test data
  index.css                    # All styles
supabase-schema.sql            # Full database schema (run once in Supabase)
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at localhost:5173 |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |

## Design

- Minimalist noir aesthetic
- Dark background (#0a0a0a) with copper accent (#c17f59)
- DM Serif Display for headings, Inter for body text
- Custom cinnamon roll SVG icons for ratings

## Contributing

1. Check `plan.md` for current status and planned features
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `npm run test:run`
5. Build: `npm run build`
6. Submit a PR

## License

MIT
