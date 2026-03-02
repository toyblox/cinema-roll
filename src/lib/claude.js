export async function getRecommendations(toWatchList, watchedList, dismissedMovies = []) {
  const safeToWatch = Array.isArray(toWatchList) ? toWatchList : []
  const safeWatched = Array.isArray(watchedList) ? watchedList : []
  const safeDismissed = Array.isArray(dismissedMovies) ? dismissedMovies : []

  console.log('[claude.js] getRecommendations called', {
    toWatch: safeToWatch.length,
    watched: safeWatched.length,
    dismissed: safeDismissed.length,
  })

  try {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toWatchList: safeToWatch.map(m => ({ title: m.title })),
        watchedList: safeWatched.map(m => ({ title: m.title, rating: m.rating })),
        dismissedMovies: safeDismissed.map(m => ({ title: m.title })),
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return { success: false, error: 'Error connecting to AI' }
  }
}
