import { useState } from 'react'

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w300'

function CinnamonRoll({ filled }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="cinnamon-icon" style={{ opacity: filled ? 1 : 0.3 }}>
      <circle cx="12" cy="12" r="10" fill="#c17f59"/>
      <path d="M12 5c-3.9 0-7 3.1-7 7s3.1 7 7 7c2.8 0 5-2.2 5-5s-2.2-5-5-5c-1.7 0-3 1.3-3 3s1.3 3 3 3" stroke="#f5e6d3" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function StarRating({ rating, onRate }) {
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <div className="modal-star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="modal-star"
          onClick={(e) => {
            e.stopPropagation()
            onRate(star)
          }}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
        >
          <CinnamonRoll filled={star <= (hoverRating || rating)} />
        </button>
      ))}
    </div>
  )
}

function SimilarMovieCard({ movie, isAdded, addedListType, onAddToWatch, onAddToWatched, toWatchList, watchedList }) {
  const [showListChoice, setShowListChoice] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)

  const posterUrl = movie.poster_path
    ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
    : null

  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : ''

  const inToWatch = toWatchList.some(m => m.tmdb_id === movie.id)
  const inWatched = watchedList.some(m => m.tmdb_id === movie.id)
  const alreadyInList = inToWatch || inWatched

  const handleClick = () => {
    if (alreadyInList || isAdded) return
    setShowListChoice(true)
  }

  const handleSelectToWatch = () => {
    onAddToWatch(movie)
    setShowListChoice(false)
  }

  const handleSelectWatched = () => {
    setShowListChoice(false)
    setShowRating(true)
  }

  const handleRate = (rating) => {
    setSelectedRating(rating)
    onAddToWatched(movie, rating)
    setShowRating(false)
  }

  const handleSkipRating = () => {
    onAddToWatched(movie, null)
    setShowRating(false)
  }

  const handleCancel = () => {
    setShowListChoice(false)
    setShowRating(false)
  }

  return (
    <div
      className={`similar-movie-card ${alreadyInList || isAdded ? 'added' : ''}`}
      onClick={handleClick}
    >
      {posterUrl ? (
        <img src={posterUrl} alt={movie.title} className="similar-movie-poster" />
      ) : (
        <div className="similar-movie-no-poster">🎬</div>
      )}

      <div className="similar-movie-info">
        <span className="similar-movie-title">{movie.title}</span>
        {year && <span className="similar-movie-year">{year}</span>}
      </div>

      {(alreadyInList || isAdded) && (
        <div className="similar-movie-check">
          {isAdded ? (addedListType === 'to_watch' ? '+ Queue' : '✓') : (inToWatch ? '+ Queue' : '✓')}
        </div>
      )}

      {showListChoice && !alreadyInList && !isAdded && (
        <div className="similar-movie-rating-overlay" onClick={e => e.stopPropagation()}>
          <span className="rating-prompt">Add to...</span>
          <div className="list-choice-buttons">
            <button className="list-choice-btn to-watch" onClick={handleSelectToWatch}>
              To Watch
            </button>
            <button className="list-choice-btn watched" onClick={handleSelectWatched}>
              Watched
            </button>
          </div>
          <button className="skip-rating" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      )}

      {showRating && !alreadyInList && !isAdded && (
        <div className="similar-movie-rating-overlay" onClick={e => e.stopPropagation()}>
          <span className="rating-prompt">Rate it?</span>
          <StarRating rating={selectedRating} onRate={handleRate} />
          <button className="skip-rating" onClick={handleSkipRating}>
            Skip
          </button>
        </div>
      )}
    </div>
  )
}

function SimilarMoviesModal({
  isOpen,
  onClose,
  addedMovie,
  similarMovies,
  onAddToWatch,
  onAddToWatched,
  toWatchList,
  watchedList,
  loading
}) {
  const [addedMovies, setAddedMovies] = useState({})

  if (!isOpen) return null

  const handleAddToWatch = (movie) => {
    onAddToWatch(movie)
    setAddedMovies(prev => ({ ...prev, [movie.id]: { added: true, listType: 'to_watch' } }))
  }

  const handleAddToWatched = (movie, rating) => {
    onAddToWatched(movie, rating)
    setAddedMovies(prev => ({ ...prev, [movie.id]: { added: true, listType: 'watched' } }))
  }

  const handleClose = () => {
    setAddedMovies({})
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>×</button>

        <div className="modal-header">
          <h2>Added to Watched</h2>
          {addedMovie && (
            <p className="modal-subtitle">
              You watched <strong>{addedMovie.title}</strong>. Seen any of these?
            </p>
          )}
        </div>

        {loading ? (
          <div className="modal-loading">
            <div className="spinner"></div>
          </div>
        ) : similarMovies.length > 0 ? (
          <div className="similar-movies-grid">
            {similarMovies.map(movie => (
              <SimilarMovieCard
                key={movie.id}
                movie={movie}
                isAdded={addedMovies[movie.id]?.added}
                addedListType={addedMovies[movie.id]?.listType}
                onAddToWatch={handleAddToWatch}
                onAddToWatched={handleAddToWatched}
                toWatchList={toWatchList}
                watchedList={watchedList}
              />
            ))}
          </div>
        ) : (
          <p className="modal-empty">No recommendations found</p>
        )}

        <div className="modal-footer">
          <button className="modal-done-btn" onClick={handleClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default SimilarMoviesModal
