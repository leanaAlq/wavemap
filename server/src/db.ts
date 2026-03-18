import { Pool } from 'pg';

// Lazily initialised — only created when first used so the server can start
// without a DB (Steps 1–4 still work; comments return errors gracefully).
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set — comments require PostgreSQL');
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

/** Run on server boot — creates the comments table if it doesn't exist yet. */
export async function migrate(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.warn('[db] DATABASE_URL not set — comments will be unavailable');
    return;
  }
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS comments (
      id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      pin_session_id   TEXT        NOT NULL,
      author_session_id TEXT       NOT NULL,
      text             TEXT        NOT NULL CHECK (char_length(text) <= 280),
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_comments_pin
      ON comments (pin_session_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS reactions (
      id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      pin_session_id TEXT        NOT NULL,
      emoji          TEXT        NOT NULL,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_reactions_pin
      ON reactions (pin_session_id);
  `);
  console.log('[db] migrations complete');
}
