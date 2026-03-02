import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRecommendations } from './claude'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
})

describe('getRecommendations', () => {
  it('posts movie lists to /api/recommend and returns the result', async () => {
    const recommendation = { success: true, title: 'Blade Runner', year: 1982, reason: 'Great film.' }
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(recommendation),
    })

    const toWatch = [{ title: 'Dune' }]
    const watched = [{ title: 'Arrival', rating: 5 }]
    const result = await getRecommendations(toWatch, watched)

    expect(mockFetch).toHaveBeenCalledWith('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toWatchList: toWatch, watchedList: watched }),
    })
    expect(result).toEqual(recommendation)
  })

  it('returns error object when fetch throws', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const result = await getRecommendations([], [])

    expect(result).toEqual({ success: false, error: 'Error connecting to AI' })
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error getting recommendations:',
      expect.any(Error)
    )
    consoleSpy.mockRestore()
  })

  it('returns the error payload from the server on failure', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: false, error: 'API key not configured' }),
    })

    const result = await getRecommendations([], [])

    expect(result).toEqual({ success: false, error: 'API key not configured' })
  })
})
