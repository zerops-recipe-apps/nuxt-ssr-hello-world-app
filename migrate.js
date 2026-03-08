// Migration script — runs via zsc execOnce in initCommands.
// Idempotent: IF NOT EXISTS + ON CONFLICT DO NOTHING ensure
// safe re-execution even if zsc execOnce guard were bypassed.
import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
})

const client = await pool.connect()
try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS greetings (
      id      INTEGER PRIMARY KEY,
      message TEXT    NOT NULL
    );
  `)

  await client.query(`
    INSERT INTO greetings (id, message)
    VALUES (1, 'Hello from Zerops!')
    ON CONFLICT (id) DO NOTHING;
  `)

  console.log('Migration complete.')
} finally {
  client.release()
  await pool.end()
}
