import { useState } from 'react'

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

function StarRating({ rating, onRate, interactive = false }) {
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${star <= (hoverRating || rating) ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={() => interactive && onRate(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          disabled={!interactive}
        >
          ★
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
  const posterUrl = movie.poster_path
    ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
    : null

  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'Unknown'

  const tmdbRating = movie.vote_average ? movie.vote_average.toFixed(1) : null
  const userRating = movie.rating || 0

  return (
    <div className="movie-card">
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
                onClick={onAddWatched}
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
