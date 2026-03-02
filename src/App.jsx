import { useState, useEffect } from 'react'
import { supabase, signOut, getProfile } from './lib/supabase'
import { searchMovies, getSimilarMovieRecommendations } from './lib/tmdb'
import { getRecommendations } from './lib/claude'
import MovieCard from './components/MovieCard'
import SimilarMoviesModal from './components/SimilarMoviesModal'
import AuthModal from './components/AuthModal'
import ProfileSettings from './components/ProfileSettings'
import OvenRecommendation from './components/OvenRecommendation'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [toWatchList, setToWatchList] = useState([])
  const [watchedList, setWatchedList] = useState([])
  const [activeTab, setActiveTab] = useState('recommend')
  const [activeListTab, setActiveListTab] = useState('toWatch')
  const [loading, setLoading] = useState(false)
  const [recommendation, setRecommendation] = useState(null)
  const [recommendLoading, setRecommendLoading] = useState(false)
  const [showSimilarModal, setShowSimilarModal] = useState(false)
  const [similarMovies, setSimilarMovies] = useState([])
  const [addedMovie, setAddedMovie] = useState(null)
  const [similarLoading, setSimilarLoading] = useState(false)

  const [dismissedMovies, setDismissedMovies] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('dismissedMovies') || '[]')
      return Array.isArray(parsed) ? parsed : []
    } catch { return [] }
  })

  // Auth state
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(null) // 'signin' | 'signup' | null
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setSession(session)
      setUser(currentUser)
      setAuthLoading(false)
      if (currentUser) loadUserProfile(currentUser.id)
      loadLists(currentUser)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setSession(session)
      setUser(currentUser)
      if (currentUser) {
        loadUserProfile(currentUser.id)
      } else {
        setProfile(null)
      }
      loadLists(currentUser)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadUserProfile(userId) {
    const { data } = await getProfile(userId)
    if (data) setProfile(data)
  }

  async function loadLists(currentUser) {
    if (!currentUser) {
      setToWatchList([])
      setWatchedList([])
      return
    }

    const { data: toWatch } = await supabase
      .from('movies')
      .select('*')
      .eq('list_type', 'to_watch')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })

    const { data: watched } = await supabase
      .from('movies')
      .select('*')
      .eq('list_type', 'watched')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })

    if (toWatch) setToWatchList(toWatch)
    if (watched) setWatchedList(watched)
  }

  async function handleSearch(e) {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    const results = await searchMovies(searchQuery)
    setSearchResults(results)
    setLoading(false)
  }

  async function addToList(movie, listType, rating = null, showModal = true) {
    if (!user) {
      setShowAuthModal('signin')
      return
    }

    const existingInToWatch = toWatchList.find(m => m.tmdb_id === movie.id)
    const existingInWatched = watchedList.find(m => m.tmdb_id === movie.id)

    if (existingInToWatch) {
      await supabase.from('movies').delete().eq('id', existingInToWatch.id)
    }
    if (existingInWatched) {
      await supabase.from('movies').delete().eq('id', existingInWatched.id)
    }

    const movieData = {
      tmdb_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      overview: movie.overview,
      vote_average: movie.vote_average,
      list_type: listType,
      rating: rating,
      user_id: user.id
    }

    await supabase.from('movies').insert(movieData)
    await loadLists(user)

    // Show similar movies modal when adding to watched
    if (listType === 'watched' && showModal) {
      setAddedMovie(movie)
      setShowSimilarModal(true)
      setSimilarLoading(true)
      const similar = await getSimilarMovieRecommendations(movie.id)
      setSimilarMovies(similar)
      setSimilarLoading(false)
    }
  }

  async function addToWatchFromModal(movie) {
    await addToList(movie, 'to_watch', null, false)
  }

  async function addToWatchedFromModal(movie, rating) {
    await addToList(movie, 'watched', rating, false)
  }

  async function removeFromList(movieId) {
    await supabase.from('movies').delete().eq('id', movieId)
    await loadLists(user)
  }

  async function updateRating(movieId, rating) {
    await supabase
      .from('movies')
      .update({ rating })
      .eq('id', movieId)
    await loadLists(user)
  }

  async function handleGetRecommendations(dismissed = dismissedMovies) {
    setRecommendLoading(true)
    setRecommendation(null)

    const result = await getRecommendations(toWatchList, watchedList, dismissed)

    if (result.success) {
      // Search TMDB for the movie to get poster and ratings
      const searchResults = await searchMovies(result.title, result.year)
      const movie = searchResults.find(
        m => m.title.toLowerCase() === result.title.toLowerCase()
      ) || searchResults[0]

      setRecommendation({
        movie,
        reason: result.reason,
        title: result.title,
        year: result.year
      })
    } else {
      setRecommendation({ error: result.error })
    }

    setRecommendLoading(false)
  }

  function handleDismiss(movie) {
    const newDismissed = [
      ...dismissedMovies,
      { title: movie.title, year: movie.release_date?.split('-')[0] }
    ]
    setDismissedMovies(newDismissed)
    localStorage.setItem('dismissedMovies', JSON.stringify(newDismissed))
    handleGetRecommendations(newDismissed)
  }

  function isInToWatch(tmdbId) {
    return toWatchList.some(m => m.tmdb_id === tmdbId)
  }

  function isInWatched(tmdbId) {
    return watchedList.some(m => m.tmdb_id === tmdbId)
  }

  const listMovies = activeListTab === 'toWatch' ? toWatchList : watchedList
  const totalMovies = toWatchList.length + watchedList.length

  return (
    <div className="app">
      <header className="header">
        <h1>Cinema Roll</h1>
        <div className="header-auth">
          {!authLoading && (
            user ? (
              <>
                <button
                  className="user-display-name"
                  onClick={() => setShowSettings(true)}
                >
                  {profile?.display_name ?? '…'}
                </button>
                <button className="logout-btn" onClick={() => signOut()}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button className="auth-btn" onClick={() => setShowAuthModal('signin')}>
                  Sign In
                </button>
                <button className="auth-btn primary" onClick={() => setShowAuthModal('signup')}>
                  Create Account
                </button>
              </>
            )
          )}
        </div>
      </header>

      <nav className="main-nav">
        <button
          className={`nav-tab ${activeTab === 'recommend' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommend')}
        >
          Recommend
        </button>
        <button
          className={`nav-tab ${activeTab === 'lists' ? 'active' : ''}`}
          onClick={() => setActiveTab('lists')}
        >
          Lists
        </button>
        <button
          className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Search
        </button>
      </nav>

      {activeTab === 'recommend' && (
        <section className="recommend-hero">
          <h2>What are we watching tonight?</h2>
          <p>Get a personalized movie recommendation based on your taste</p>

          <button
            className="recommend-btn"
            onClick={handleGetRecommendations}
            disabled={recommendLoading}
          >
            {recommendLoading ? 'Thinking...' : 'Recommend Me a Movie'}
          </button>

          {!user && (
            <p className="recommend-hint">
              Sign in to get personalized picks based on your taste.{' '}
              <button className="recommend-hint-link" onClick={() => setShowAuthModal('signin')}>
                Sign in
              </button>
            </p>
          )}

          {user && totalMovies === 0 && (
            <p className="recommend-hint">
              Add some movies to your lists for personalized recommendations
            </p>
          )}

          <OvenRecommendation
            loading={recommendLoading}
            recommendation={recommendation}
            onSeenIt={(movie, rating) => addToList(movie, 'watched', rating)}
            onAddToWatch={(movie) => addToList(movie, 'to_watch')}
            onDismiss={handleDismiss}
            isInWatched={isInWatched}
            isInToWatch={isInToWatch}
          />

          <div className="quick-stats">
            <div className="stat" onClick={() => { setActiveTab('lists'); setActiveListTab('toWatch'); }}>
              <span className="stat-number">{toWatchList.length}</span>
              <span className="stat-label">To Watch</span>
            </div>
            <div className="stat" onClick={() => { setActiveTab('lists'); setActiveListTab('watched'); }}>
              <span className="stat-number">{watchedList.length}</span>
              <span className="stat-label">Watched</span>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'lists' && (
        <section className="lists-view">
          {!user ? (
            <div className="empty-state">
              <h3>Your lists await</h3>
              <p>Sign in to save movies and build your lists</p>
              <button className="empty-action" onClick={() => setShowAuthModal('signin')}>
                Sign In
              </button>
            </div>
          ) : (
            <>
              <div className="list-toggle">
                <button
                  className={`toggle-btn ${activeListTab === 'toWatch' ? 'active' : ''}`}
                  onClick={() => setActiveListTab('toWatch')}
                >
                  To Watch <span className="count">{toWatchList.length}</span>
                </button>
                <button
                  className={`toggle-btn ${activeListTab === 'watched' ? 'active' : ''}`}
                  onClick={() => setActiveListTab('watched')}
                >
                  Watched <span className="count">{watchedList.length}</span>
                </button>
              </div>

              {listMovies.length > 0 ? (
                <div className="movies-grid">
                  {listMovies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={{ ...movie, id: movie.tmdb_id }}
                      isInToWatch={activeListTab === 'toWatch'}
                      isInWatched={activeListTab === 'watched'}
                      onAddToWatch={() => addToList({ ...movie, id: movie.tmdb_id }, 'to_watch')}
                      onAddWatched={() => addToList({ ...movie, id: movie.tmdb_id }, 'watched')}
                      onRemove={() => removeFromList(movie.id)}
                      onRate={(rating) => updateRating(movie.id, rating)}
                      showRemove={true}
                      isWatchedTab={activeListTab === 'watched'}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  {activeListTab === 'toWatch' ? (
                    <>
                      <h3>Your To Watch list is empty</h3>
                      <p>Search for movies and add them here</p>
                    </>
                  ) : (
                    <>
                      <h3>No watched movies yet</h3>
                      <p>Mark movies as watched to track them here</p>
                    </>
                  )}
                  <button className="empty-action" onClick={() => setActiveTab('search')}>
                    Search Movies
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {activeTab === 'search' && (
        <section className="search-view">
          {!user ? (
            <div className="empty-state">
              <h3>Save movies to your lists</h3>
              <p>Sign in to search and add movies</p>
              <button className="empty-action" onClick={() => setShowAuthModal('signin')}>
                Sign In
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSearch} className="search-container">
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search for a movie..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  {(searchQuery || searchResults.length > 0) && (
                    <button
                      type="button"
                      className="search-clear"
                      onClick={() => {
                        setSearchQuery('')
                        setSearchResults([])
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
                <button type="submit" className="search-btn">Search</button>
              </form>

              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="movies-grid">
                  {searchResults.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      isInToWatch={isInToWatch(movie.id)}
                      isInWatched={isInWatched(movie.id)}
                      onAddToWatch={() => addToList(movie, 'to_watch')}
                      onAddWatched={(rating) => addToList(movie, 'watched', rating)}
                      showRemove={false}
                      isWatchedTab={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h3>Find your next favorite movie</h3>
                  <p>Search by title to add movies to your lists</p>
                </div>
              )}
            </>
          )}
        </section>
      )}

      <SimilarMoviesModal
        isOpen={showSimilarModal}
        onClose={() => {
          setShowSimilarModal(false)
          setSimilarMovies([])
          setAddedMovie(null)
        }}
        addedMovie={addedMovie}
        similarMovies={similarMovies}
        onAddToWatch={addToWatchFromModal}
        onAddToWatched={addToWatchedFromModal}
        toWatchList={toWatchList}
        watchedList={watchedList}
        loading={similarLoading}
      />

      <AuthModal
        isOpen={!!showAuthModal}
        initialMode={showAuthModal || 'signin'}
        onClose={() => setShowAuthModal(null)}
      />

      {user && profile && (
        <ProfileSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          user={user}
          profile={profile}
          onProfileUpdate={(updated) => setProfile(updated)}
        />
      )}
    </div>
  )
}

export default App
