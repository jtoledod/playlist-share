import dotenv from 'dotenv'
import path from 'path'

const isProduction = process.env.NODE_ENV === 'production'

const envPath = isProduction
  ? path.resolve(process.cwd(), '.env')
  : path.resolve(process.cwd(), '.env.local')

dotenv.config({ path: envPath, override: true })
