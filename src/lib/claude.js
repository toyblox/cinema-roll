const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

export async function getRecommendations(toWatchList, watchedList) {
  const toWatchTitles = toWatchList.map(m => m.title).join(', ')
  const watchedTitles = watchedList.map(m => m.title).join(', ')

  const prompt = `Based on the user's movie preferences, recommend ONE movie they should watch next.

Movies they want to watch: ${toWatchTitles || 'None'}
Movies they've already watched: ${watchedTitles || 'None'}

Analyze their taste based on these movies (genres, themes, directors, actors, tone). Then recommend a single movie that:
1. Is NOT in either of their lists
2. Matches their apparent taste
3. They likely haven't seen

Provide:
- The movie title and year
- Why you think they'd enjoy it based on their existing taste
- A brief description of what makes it special

Keep your response concise and enthusiastic.`

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
        max_tokens: 500,
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
      return data.content[0].text
    }

    return 'Unable to generate recommendation. Please try again.'
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return 'Error connecting to AI. Please check your API key and try again.'
  }
}
