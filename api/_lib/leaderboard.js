import { getSql } from "./database.js";
import {
  MAX_LEADERBOARD_ENTRIES,
  isValidScore,
  normalizeUsername,
  toDisplayScores,
} from "../../src/leaderboard-shared.mjs";

let hasEnsuredSchema = false;

export async function ensureLeaderboardTable() {
  if (hasEnsuredSchema) {
    return;
  }

  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS snake_scores (
      id BIGSERIAL PRIMARY KEY,
      username VARCHAR(20) NOT NULL,
      score INTEGER NOT NULL CHECK (score >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS snake_scores_top_scores_idx
      ON snake_scores (score DESC, created_at ASC);
  `;

  hasEnsuredSchema = true;
}

export async function listHighScores(limit = MAX_LEADERBOARD_ENTRIES) {
  await ensureLeaderboardTable();

  const sql = getSql();
  const rows = await sql`
    SELECT username, score
    FROM snake_scores
    ORDER BY score DESC, created_at ASC
    LIMIT ${limit};
  `;

  return toDisplayScores(rows);
}

export async function saveHighScore({ username, score }) {
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername) {
    const error = new Error("Username is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!isValidScore(score)) {
    const error = new Error("Score must be a non-negative integer.");
    error.statusCode = 400;
    throw error;
  }

  await ensureLeaderboardTable();

  const sql = getSql();

  const [savedRow] = await sql`
    INSERT INTO snake_scores (username, score)
    VALUES (${normalizedUsername}, ${score})
    RETURNING username, score;
  `;

  const scores = await listHighScores();

  return {
    savedScore: {
      username: savedRow.username,
      score: Number(savedRow.score),
    },
    scores,
  };
}
