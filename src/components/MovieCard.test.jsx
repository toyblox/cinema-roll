import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MovieCard from './MovieCard'
import { mockMovies } from '../test/mocks/fixtures'

const defaultProps = {
  movie: mockMovies.searchResults[0], // Fight Club
  isInToWatch: false,
  isInWatched: false,
  onAddToWatch: vi.fn(),
  onAddWatched: vi.fn(),
  onRemove: vi.fn(),
  onRate: vi.fn(),
  showRemove: false,
  isWatchedTab: false,
}

describe('MovieCard', () => {
  it('renders movie title and year', () => {
    render(<MovieCard {...defaultProps} />)

    expect(screen.getByText('Fight Club')).toBeInTheDocument()
    expect(screen.getByText('1999')).toBeInTheDocument()
  })

  it('renders TMDB rating', () => {
    render(<MovieCard {...defaultProps} />)

    expect(screen.getByText('8.4')).toBeInTheDocument()
  })

  it('shows add buttons when movie is not in any list', () => {
    render(<MovieCard {...defaultProps} />)

    expect(screen.getByText('+ To Watch')).toBeInTheDocument()
    expect(screen.getByText('+ Watched')).toBeInTheDocument()
  })

  it('shows checkmark when movie is in To Watch list', () => {
    render(<MovieCard {...defaultProps} isInToWatch={true} />)

    const toWatchButton = screen.getByRole('button', { name: /to watch/i })
    expect(toWatchButton).toHaveTextContent('✓')
  })

  it('shows checkmark when movie is in Watched list', () => {
    render(<MovieCard {...defaultProps} isInWatched={true} />)

    const watchedButton = screen.getByRole('button', { name: /watched/i })
    expect(watchedButton).toHaveTextContent('✓')
  })

  it('calls onAddToWatch when clicking To Watch button', async () => {
    const user = userEvent.setup()
    const onAddToWatch = vi.fn()

    render(<MovieCard {...defaultProps} onAddToWatch={onAddToWatch} />)

    await user.click(screen.getByText('+ To Watch'))

    expect(onAddToWatch).toHaveBeenCalled()
  })

  it('shows rating overlay when clicking Watched button', async () => {
    const user = userEvent.setup()

    render(<MovieCard {...defaultProps} />)

    await user.click(screen.getByText('+ Watched'))

    expect(screen.getByText('Rate it?')).toBeInTheDocument()
    expect(screen.getByText('Skip')).toBeInTheDocument()
  })

  it('shows Remove button when showRemove is true', () => {
    render(<MovieCard {...defaultProps} showRemove={true} />)

    expect(screen.getByText('Remove')).toBeInTheDocument()
    expect(screen.queryByText('+ To Watch')).not.toBeInTheDocument()
  })

  it('calls onRemove when clicking Remove button', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()

    render(<MovieCard {...defaultProps} showRemove={true} onRemove={onRemove} />)

    await user.click(screen.getByText('Remove'))

    expect(onRemove).toHaveBeenCalled()
  })

  it('displays user rating section on watched tab', () => {
    const movieWithRating = { ...mockMovies.watchedList[0] } // Pulp Fiction with rating 5

    render(
      <MovieCard
        {...defaultProps}
        movie={movieWithRating}
        isWatchedTab={true}
        showRemove={true}
      />
    )

    // Should show "My Rating" label on watched tab
    expect(screen.getByText('My Rating')).toBeInTheDocument()
  })

  it('shows fallback emoji when poster is missing', () => {
    const movieNoPoster = { ...defaultProps.movie, poster_path: null }

    render(<MovieCard {...defaultProps} movie={movieNoPoster} />)

    expect(screen.getByText('🎬')).toBeInTheDocument()
  })
})
