export const MAX_USERNAME_LENGTH = 20;
export const MAX_LEADERBOARD_ENTRIES = 10;

export function normalizeUsername(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ").slice(0, MAX_USERNAME_LENGTH);
}

export function isValidScore(value) {
  return Number.isInteger(value) && value >= 0;
}

export function toDisplayScores(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.slice(0, MAX_LEADERBOARD_ENTRIES).map((row) => ({
    username: normalizeUsername(row.username),
    score: Number(row.score),
  }));
}
