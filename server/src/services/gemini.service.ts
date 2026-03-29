import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai'

export interface AiData {
  adjectives: string[]
  meaning: string
  trivia: string[]
}

export class GeminiService {
  private static readonly schema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
      adjectives: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: "Exactly 3 adjectives describing the mood/vibe"
      },
      meaning: { type: SchemaType.STRING },
      trivia: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: "3 interesting facts"
      }
    },
    required: ["adjectives", "meaning", "trivia"]
  }

  private genAI: GoogleGenerativeAI
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>

  constructor(apiKey: string = process.env.GEMINI_API_KEY || '') {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: GeminiService.schema
      },
      systemInstruction: `You are an expert musicologist and cultural critic.
        Your goal is to provide deep, emotional, and technical insights about songs.
        Rules:
        - For the "meaning" field, write a 1-3 sentence deep dive into the lyrics' core message. Avoid generic descriptions; focus on the "why"
        - For the "adjectives" field, provide exactly 3 adjectives describing the mood/vibe of the song. These should be specific and evocative, not generic.
        - For the "trivia" field, provide 3 high-quality facts about the production, inspiration, or historical impact of the song.
        - Respond ONLY in valid JSON format.`
    })
  }

  async analyzeSong(title: string, artist: string): Promise<AiData> {
    const prompt = `Analyze the song "${title}" by ${artist}.`

    try {
      const result = await this.model.generateContent(prompt)
      const response = result.response.text()

      const parsed = JSON.parse(response) as AiData

      if (
        Array.isArray(parsed.adjectives) &&
        typeof parsed.meaning === 'string' &&
        Array.isArray(parsed.trivia)
      ) {
        return parsed
      }

      throw new Error('Invalid response structure')
    } catch (error) {
      console.error('Gemini API error:', error)
      return {} as AiData
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
