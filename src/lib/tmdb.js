const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export async function searchMovies(query, year = null) {
  try {
    let url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
    if (year) url += `&primary_release_year=${year}`
    const response = await fetch(url)
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error searching movies:', error)
    return []
  }
}

export async function getMovieDetails(movieId) {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`
    )
    return await response.json()
  } catch (error) {
    console.error('Error getting movie details:', error)
    return null
  }
}

export async function getPopularMovies() {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`
    )
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error getting popular movies:', error)
    return []
  }
}

export async function getSimilarMovieRecommendations(movieId, limit = 8) {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/recommendations?api_key=${TMDB_API_KEY}`
    )
    const data = await response.json()
    return (data.results || []).slice(0, limit)
  } catch (error) {
    console.error('Error getting similar movies:', error)
    return []
  }
}
