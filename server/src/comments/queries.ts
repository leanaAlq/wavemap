import { getPool } from '../db';
import { Comment } from 'shared';

type Row = { id: string; pin_session_id: string; text: string; created_at: Date };

function toComment(row: Row): Comment {
  return {
    id: row.id,
    pinSessionId: row.pin_session_id,
    text: row.text,
    createdAt: row.created_at.toISOString(),
  };
}

export async function insertComment(
  pinSessionId: string,
  authorSessionId: string,
  text: string,
): Promise<Comment> {
  const { rows } = await getPool().query<Row>(
    `INSERT INTO comments (pin_session_id, author_session_id, text)
     VALUES ($1, $2, $3)
     RETURNING id, pin_session_id, text, created_at`,
    [pinSessionId, authorSessionId, text],
  );
  return toComment(rows[0]);
}

/** Returns comments for a pin that were created in the last 24 hours, oldest first. */
export async function getCommentsByPin(pinSessionId: string): Promise<Comment[]> {
  const { rows } = await getPool().query<Row>(
    `SELECT id, pin_session_id, text, created_at
     FROM comments
     WHERE pin_session_id = $1
       AND created_at > NOW() - INTERVAL '24 hours'
     ORDER BY created_at ASC`,
    [pinSessionId],
  );
  return rows.map(toComment);
}
