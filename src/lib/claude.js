export async function getRecommendations(toWatchList, watchedList) {
  try {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toWatchList, watchedList }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return { success: false, error: 'Error connecting to AI' }
  }
}
