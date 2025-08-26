// backend/src/db.ts
import { Pool } from 'pg'

console.log("DATABASE_URL:", process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
