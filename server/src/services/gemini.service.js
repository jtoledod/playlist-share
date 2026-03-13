const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

const analyzeSong = async (title, artist) => {
  const prompt = `
Analyze the song "${title}" by ${artist}.

Provide a JSON object with the following structure:
{
  "adjectives": ["adj1", "adj2", "adj3"],
  "meaning": "1-3 sentences about the core meaning",
  "trivia": ["fact1", "fact2", "fact3"]
}

Keep it concise and return ONLY the JSON object.
  `

  try {
    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    return {
      adjectives: ['energetic', 'melodic', 'catchy'],
      meaning: 'A popular track with broad appeal.',
      trivia: ['Released recently', 'Well-received by fans', 'High streaming numbers']
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    return {
      adjectives: ['unknown', 'unknown', 'unknown'],
      meaning: 'Unable to analyze at this time.',
      trivia: ['Data unavailable']
    }
  }
}

module.exports = { analyzeSong }
