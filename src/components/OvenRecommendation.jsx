import { useEffect, useState } from 'react'

function CinnamonRoll({ filled }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="cinnamon-icon" style={{ opacity: filled ? 1 : 0.3 }}>
      <circle cx="12" cy="12" r="10" fill="#c17f59"/>
      <path d="M12 5c-3.9 0-7 3.1-7 7s3.1 7 7 7c2.8 0 5-2.2 5-5s-2.2-5-5-5c-1.7 0-3 1.3-3 3s1.3 3 3 3" stroke="#f5e6d3" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

export default function OvenRecommendation({
  loading,
  recommendation,
  onSeenIt,
  onAddToWatch,
  onDismiss,
  isInWatched,
  isInToWatch,
}) {
  const [doorOpen, setDoorOpen] = useState(false)
  const [showSteam, setShowSteam] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [showRatingPrompt, setShowRatingPrompt] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)

  useEffect(() => {
    if (recommendation) {
      const t1 = setTimeout(() => setDoorOpen(true), 80)
      const t2 = setTimeout(() => setShowSteam(true), 420)
      const t3 = setTimeout(() => setShowContent(true), 880)
      const t4 = setTimeout(() => setShowSteam(false), 2800)
      return () => [t1, t2, t3, t4].forEach(clearTimeout)
    } else {
      setDoorOpen(false)
      setShowSteam(false)
      setShowContent(false)
      setShowRatingPrompt(false)
    }
  }, [recommendation])

  const movie = recommendation?.movie
  const inWatched = movie ? isInWatched(movie.id) : false
  const inToWatch = movie ? isInToWatch(movie.id) : false

  const handleSeenItClick = () => {
    if (inWatched) return
    setShowRatingPrompt(true)
  }

  const handleRate = (rating) => {
    onSeenIt(movie, rating)
    setShowRatingPrompt(false)
  }

  const handleSkipRating = () => {
    onSeenIt(movie, null)
    setShowRatingPrompt(false)
  }

  return (
    <div className="oven-section">
      <div className="oven-wrapper">

        <div className="oven-outer">

          <div className="oven-body">
            <div className="oven-panel">
              <div className={`oven-indicator${loading ? ' lit' : ''}`} />
              <div className="oven-panel-line" />
              <div className="oven-knob" />
              <div className="oven-knob" />
            </div>

            <div className={`oven-cavity-bg${(loading || doorOpen) ? ' lit' : ''}`}>
              {/* Recommendation content — revealed when door opens */}
              {(movie || recommendation?.error) && (
                <div className={`oven-cavity-content${showContent ? ' visible' : ''}`}>
                  {recommendation?.error ? (
                    <p className="oven-cavity-error">{recommendation.error}</p>
                  ) : (
                    <>
                      {/* Rating prompt overlay */}
                      {showRatingPrompt && (
                        <div className="oven-rating-overlay">
                          <p className="oven-rating-prompt">Rate it?</p>
                          <div className="oven-rating-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                className="modal-star"
                                onClick={() => handleRate(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                              >
                                <CinnamonRoll filled={star <= hoverRating} />
                              </button>
                            ))}
                          </div>
                          <button className="skip-rating" onClick={handleSkipRating}>
                            Skip
                          </button>
                        </div>
                      )}

                      {movie.poster_path ? (
                        <img
                          className="oven-cavity-poster"
                          src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                          alt={movie.title}
                        />
                      ) : (
                        <div className="oven-cavity-no-poster">🎬</div>
                      )}
                      <div className="oven-cavity-info">
                        <div>
                          <h3 className="oven-cavity-title">{movie.title}</h3>
                          <div className="oven-cavity-meta">
                            <span className="recommendation-year">
                              {movie.release_date?.split('-')[0]}
                            </span>
                            {movie.vote_average > 0 && (
                              <span className="recommendation-rating">
                                ★ {movie.vote_average.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="oven-cavity-reason">{recommendation.reason}</p>
                        <div className="oven-cavity-actions">
                          <button
                            className={`action-btn watched${inWatched ? ' active' : ''}`}
                            onClick={handleSeenItClick}
                          >
                            {inWatched ? '✓ Watched' : '+ Watched'}
                          </button>
                          <button
                            className={`action-btn to-watch${inToWatch ? ' active' : ''}`}
                            onClick={() => onAddToWatch(movie)}
                          >
                            {inToWatch ? '✓ To Watch' : '+ To Watch'}
                          </button>
                          <button
                            className="action-btn dismiss"
                            onClick={() => onDismiss(movie)}
                          >
                            Not this one
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Door */}
          <div className={`oven-door${doorOpen ? ' open' : ''}`}>
            <div className="oven-door-handle" />
            <div className="oven-window-frame">
              <div className={`oven-window-glass${loading ? ' glowing' : ''}`} />
            </div>
          </div>

          {/* Steam */}
          {showSteam && (
            <div className="steam-container" aria-hidden="true">
              <div className="steam" style={{ left: '27%', '--drift': '-14px', animationDelay: '0s' }} />
              <div className="steam" style={{ left: '49%', '--drift': '5px', animationDelay: '0.28s' }} />
              <div className="steam" style={{ left: '66%', '--drift': '18px', animationDelay: '0.14s' }} />
            </div>
          )}
        </div>

        <div className="oven-feet">
          <div className="oven-foot" />
          <div className="oven-foot" />
        </div>
      </div>
    </div>
  )
}
