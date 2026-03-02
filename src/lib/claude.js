export async function getRecommendations(toWatchList, watchedList) {
  const hasLists = toWatchList.length > 0 || watchedList.length > 0

  let prompt

  if (hasLists) {
    const toWatchTitles = toWatchList.map(m => m.title).join(', ')
    const watchedTitles = watchedList.map(m => `${m.title}${m.rating ? ` (${m.rating}/5)` : ''}`).join(', ')

    prompt = `Based on the user's movie preferences, recommend ONE movie they should watch next.

Movies they want to watch: ${toWatchTitles || 'None'}
Movies they've already watched (with their ratings): ${watchedTitles || 'None'}

Analyze their taste based on these movies (genres, themes, directors, actors, tone). Then recommend a single movie that:
1. Is NOT in either of their lists
2. Matches their apparent taste
3. They likely haven't seen

Respond with ONLY valid JSON in this exact format (no markdown, no code blocks):
{"title": "Movie Title", "year": 2020, "reason": "2-3 sentences explaining why they'd enjoy this based on their taste."}`
  } else {
    prompt = `Recommend ONE exceptional film that most cinephiles would love. Choose something critically acclaimed with broad appeal — a great film for any taste. Vary your choice each time.

Respond with ONLY valid JSON in this exact format (no markdown, no code blocks):
{"title": "Movie Title", "year": 2020, "reason": "2-3 sentences about what makes this film great and worth watching."}`
  }

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
