import { useState } from 'react'

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

function CinnamonRoll({ filled }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="cinnamon-icon" style={{ opacity: filled ? 1 : 0.3 }}>
      <circle cx="12" cy="12" r="10" fill="#c17f59"/>
      <path d="M12 5c-3.9 0-7 3.1-7 7s3.1 7 7 7c2.8 0 5-2.2 5-5s-2.2-5-5-5c-1.7 0-3 1.3-3 3s1.3 3 3 3" stroke="#f5e6d3" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function StarRating({ rating, onRate, interactive = false }) {
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${interactive ? 'interactive' : ''}`}
          onClick={() => interactive && onRate(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          disabled={!interactive}
        >
          <CinnamonRoll filled={star <= (hoverRating || rating)} />
        </button>
      ))}
    </div>
  )
}

function MovieCard({
  movie,
  isInToWatch,
  isInWatched,
  onAddToWatch,
  onAddWatched,
  onRemove,
  onRate,
  showRemove,
  isWatchedTab
}) {
  const [showRatingPrompt, setShowRatingPrompt] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(0)

  const posterUrl = movie.poster_path
    ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
    : null

  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'Unknown'

  const tmdbRating = movie.vote_average ? movie.vote_average.toFixed(1) : null
  const userRating = movie.rating || 0

  const handleWatchedClick = () => {
    if (isInWatched) return
    setShowRatingPrompt(true)
  }

  const handleRate = (rating) => {
    setSelectedRating(rating)
    onAddWatched(rating)
    setShowRatingPrompt(false)
  }

  const handleSkipRating = () => {
    onAddWatched(null)
    setShowRatingPrompt(false)
  }

  return (
    <div className="movie-card">
      <div className="movie-poster-container">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="movie-poster"
            loading="lazy"
          />
        ) : (
          <div className="no-poster">🎬</div>
        )}

        {showRatingPrompt && (
          <div className="card-rating-overlay">
            <span className="rating-prompt">Rate it?</span>
            <div className="modal-star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="modal-star"
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <CinnamonRoll filled={star <= (hoverRating || selectedRating)} />
                </button>
              ))}
            </div>
            <button className="skip-rating" onClick={handleSkipRating}>
              Skip
            </button>
          </div>
        )}
      </div>

      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          <span className="movie-year">{year}</span>
          {tmdbRating && (
            <span className="tmdb-rating">
              <span className="tmdb-star">★</span> {tmdbRating}
            </span>
          )}
        </div>

        {isWatchedTab && (
          <div className="user-rating-section">
            <span className="rating-label">My Rating</span>
            <StarRating
              rating={userRating}
              onRate={onRate}
              interactive={true}
            />
          </div>
        )}

        <div className="movie-actions">
          {showRemove ? (
            <button className="action-btn remove" onClick={onRemove}>
              Remove
            </button>
          ) : (
            <>
              <button
                className={`action-btn to-watch ${isInToWatch ? 'active' : ''}`}
                onClick={onAddToWatch}
              >
                {isInToWatch ? '✓ To Watch' : '+ To Watch'}
              </button>
              <button
                className={`action-btn watched ${isInWatched ? 'active' : ''}`}
                onClick={handleWatchedClick}
              >
                {isInWatched ? '✓ Watched' : '+ Watched'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MovieCard
