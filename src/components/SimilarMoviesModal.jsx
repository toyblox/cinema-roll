import { useState } from 'react'

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w300'

function StarRating({ rating, onRate }) {
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <div className="modal-star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`modal-star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onRate(star)
          }}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function SimilarMovieCard({ movie, isAdded, onAdd, watchedList }) {
  const [showRating, setShowRating] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)

  const posterUrl = movie.poster_path
    ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
    : null

  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : ''

  const alreadyInList = watchedList.some(m => m.tmdb_id === movie.id)

  const handleClick = () => {
    if (alreadyInList || isAdded) return
    setShowRating(true)
  }

  const handleRate = (rating) => {
    setSelectedRating(rating)
    onAdd(movie, rating)
    setShowRating(false)
  }

  const handleSkipRating = () => {
    onAdd(movie, null)
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
        <div className="similar-movie-check">✓</div>
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
  onAddToWatched,
  watchedList,
  loading
}) {
  const [addedMovies, setAddedMovies] = useState({})

  if (!isOpen) return null

  const handleAdd = (movie, rating) => {
    onAddToWatched(movie, rating)
    setAddedMovies(prev => ({ ...prev, [movie.id]: true }))
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
              You watched <strong>{addedMovie.title}</strong>. Have you seen these too?
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
                isAdded={addedMovies[movie.id]}
                onAdd={handleAdd}
                watchedList={watchedList}
              />
            ))}
          </div>
        ) : (
          <p className="modal-empty">No similar movies found</p>
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
