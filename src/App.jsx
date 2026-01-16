import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { searchMovies, getSimilarMovieRecommendations } from './lib/tmdb'
import { getRecommendations } from './lib/claude'
import MovieCard from './components/MovieCard'
import SimilarMoviesModal from './components/SimilarMoviesModal'

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

  useEffect(() => {
    loadLists()
  }, [])

  async function loadLists() {
    const { data: toWatch } = await supabase
      .from('movies')
      .select('*')
      .eq('list_type', 'to_watch')
      .order('created_at', { ascending: false })

    const { data: watched } = await supabase
      .from('movies')
      .select('*')
      .eq('list_type', 'watched')
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
      rating: rating
    }

    await supabase.from('movies').insert(movieData)
    await loadLists()

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

  async function addFromModal(movie, rating) {
    await addToList(movie, 'watched', rating, false)
  }

  async function removeFromList(movieId) {
    await supabase.from('movies').delete().eq('id', movieId)
    await loadLists()
  }

  async function updateRating(movieId, rating) {
    await supabase
      .from('movies')
      .update({ rating })
      .eq('id', movieId)
    await loadLists()
  }

  async function handleGetRecommendations() {
    if (toWatchList.length === 0 && watchedList.length === 0) {
      return
    }

    setRecommendLoading(true)
    const result = await getRecommendations(toWatchList, watchedList)
    setRecommendation(result)
    setRecommendLoading(false)
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
            disabled={recommendLoading || totalMovies === 0}
          >
            {recommendLoading ? 'Thinking...' : 'Recommend Me a Movie'}
          </button>

          {totalMovies === 0 && (
            <p className="recommend-hint">
              Add some movies to your lists first to get personalized recommendations
            </p>
          )}

          {recommendation && (
            <div className="recommendation-result">
              <h3>Your Recommendation</h3>
              <p>{recommendation}</p>
            </div>
          )}

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
        </section>
      )}

      {activeTab === 'search' && (
        <section className="search-view">
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
                  onAddWatched={() => addToList(movie, 'watched')}
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
        onAddToWatched={addFromModal}
        watchedList={watchedList}
        loading={similarLoading}
      />
    </div>
  )
}

export default App
