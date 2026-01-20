const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

export async function getRecommendations(toWatchList, watchedList) {
  const toWatchTitles = toWatchList.map(m => m.title).join(', ')
  const watchedTitles = watchedList.map(m => `${m.title}${m.rating ? ` (${m.rating}/5)` : ''}`).join(', ')

  const prompt = `Based on the user's movie preferences, recommend ONE movie they should watch next.

Movies they want to watch: ${toWatchTitles || 'None'}
Movies they've already watched (with their ratings): ${watchedTitles || 'None'}

Analyze their taste based on these movies (genres, themes, directors, actors, tone). Then recommend a single movie that:
1. Is NOT in either of their lists
2. Matches their apparent taste
3. They likely haven't seen

Respond with ONLY valid JSON in this exact format (no markdown, no code blocks):
{"title": "Movie Title", "year": 2020, "reason": "2-3 sentences explaining why they'd enjoy this based on their taste."}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    const data = await response.json()

    if (data.content && data.content[0]) {
      try {
        const parsed = JSON.parse(data.content[0].text)
        return { success: true, ...parsed }
      } catch {
        return { success: false, error: 'Failed to parse recommendation' }
      }
    }

    return { success: false, error: 'Unable to generate recommendation' }
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return { success: false, error: 'Error connecting to AI' }
  }
}
