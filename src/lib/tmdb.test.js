import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchMovies, getMovieDetails, getSimilarMovieRecommendations } from './tmdb'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
})

describe('tmdb', () => {
  describe('searchMovies', () => {
    it('returns matching movies for a query', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          results: [
            { id: 550, title: 'Fight Club', vote_average: 8.4 }
          ]
        })
      })

      const results = await searchMovies('fight club')

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Fight Club')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/search/movie')
      )
    })

    it('returns empty array on error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const results = await searchMovies('test')

      expect(results).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error searching movies:',
        expect.any(Error)
      )
      consoleSpy.mockRestore()
    })

    it('returns empty array when results is undefined', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({})
      })

      const results = await searchMovies('test')

      expect(results).toEqual([])
    })
  })

  describe('getMovieDetails', () => {
    it('returns movie details for valid ID', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          id: 550,
          title: 'Fight Club',
          vote_average: 8.4
        })
      })

      const movie = await getMovieDetails(550)

      expect(movie.title).toBe('Fight Club')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/movie/550')
      )
    })

    it('returns null on error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const movie = await getMovieDetails(999)

      expect(movie).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error getting movie details:',
        expect.any(Error)
      )
      consoleSpy.mockRestore()
    })
  })

  describe('getSimilarMovieRecommendations', () => {
    it('returns recommended movies', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          results: [
            { id: 807, title: 'Se7en' },
            { id: 137113, title: 'Edge of Tomorrow' },
          ]
        })
      })

      const recommendations = await getSimilarMovieRecommendations(550)

      expect(recommendations).toHaveLength(2)
      expect(recommendations[0].title).toBe('Se7en')
    })

    it('respects the limit parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          results: [
            { id: 1, title: 'Movie 1' },
            { id: 2, title: 'Movie 2' },
            { id: 3, title: 'Movie 3' },
          ]
        })
      })

      const recommendations = await getSimilarMovieRecommendations(550, 2)

      expect(recommendations).toHaveLength(2)
    })

    it('returns empty array on error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const recommendations = await getSimilarMovieRecommendations(550)

      expect(recommendations).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error getting similar movies:',
        expect.any(Error)
      )
      consoleSpy.mockRestore()
    })
  })
})
