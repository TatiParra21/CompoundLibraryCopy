// backend/src/db.ts
import { Pool } from 'pg'
import dns from 'dns';
console.log("DATABASE_URL:", process.env.DATABASE_URL);
dns.setDefaultResultOrder('ipv4first');
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
   ssl: {
    rejectUnauthorized: false, // required for Supabase/Render
  },
})
