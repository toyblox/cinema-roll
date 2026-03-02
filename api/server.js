import express from 'express'

const app = express()
const PORT = process.env.PORT || 3001
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

app.use(express.json())

app.post('/api/recommend', async (req, res) => {
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ success: false, error: 'API key not configured' })
  }

  const { toWatchList = [], watchedList = [] } = req.body

  const hasLists = toWatchList.length > 0 || watchedList.length > 0

  let prompt

  if (hasLists) {
    const toWatchTitles = toWatchList.map(m => m.title).join(', ')
    const watchedTitles = watchedList
      .map(m => `${m.title}${m.rating ? ` (${m.rating}/5)` : ''}`)
      .join(', ')

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
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()

    if (data.content && data.content[0]) {
      try {
        const parsed = JSON.parse(data.content[0].text)
        return res.json({ success: true, ...parsed })
      } catch {
        return res.status(500).json({ success: false, error: 'Failed to parse recommendation' })
      }
    }

    return res.status(500).json({ success: false, error: 'Unable to generate recommendation' })
  } catch (error) {
    console.error('Error calling Anthropic:', error)
    return res.status(500).json({ success: false, error: 'Error connecting to AI' })
  }
})

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`)
})
