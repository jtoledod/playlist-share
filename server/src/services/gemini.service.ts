import { GoogleGenerativeAI } from '@google/generative-ai'

export interface AiData {
  adjectives: string[]
  meaning: string
  trivia: string[]
}

export class GeminiService {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor(apiKey: string = process.env.GEMINI_API_KEY || '') {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  }

  async analyzeSong(title: string, artist: string): Promise<AiData> {
    const prompt = `
Analyze the song "${title}" by ${artist}.

Provide a JSON object with the following structure:
{
  "adjectives": ["Nostalgic", "Gritty", "Atmospheric"],
  "meaning": "A brief explanation of the lyrical theme and emotional weight.",
  "trivia": [
    "A fact about the recording process.",
    "A note on the artist's inspiration."
  ]
}

Keep it concise and return ONLY the JSON object.
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = result.response.text()

      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as AiData
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
}

let geminiService: GeminiService | null = null

export function getGeminiService(): GeminiService {
  if (!geminiService) {
    geminiService = new GeminiService()
  }
  return geminiService
}
