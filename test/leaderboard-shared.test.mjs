import test from "node:test";
import assert from "node:assert/strict";

import {
  MAX_USERNAME_LENGTH,
  isValidScore,
  normalizeUsername,
  toDisplayScores,
} from "../src/leaderboard-shared.mjs";

test("normalizeUsername trims and collapses whitespace", () => {
  assert.equal(normalizeUsername("  Ada   Lovelace  "), "Ada Lovelace");
});

test("normalizeUsername enforces the max username length", () => {
  assert.equal(normalizeUsername("a".repeat(MAX_USERNAME_LENGTH + 4)).length, MAX_USERNAME_LENGTH);
});

test("isValidScore accepts non-negative integers only", () => {
  assert.equal(isValidScore(12), true);
  assert.equal(isValidScore(-1), false);
  assert.equal(isValidScore(2.5), false);
});

test("toDisplayScores normalizes usernames and limits output", () => {
  const rows = Array.from({ length: 12 }, (_, index) => ({
    username: ` Player ${index + 1} `,
    score: `${index + 1}`,
  }));

  const displayScores = toDisplayScores(rows);

  assert.equal(displayScores.length, 10);
  assert.deepEqual(displayScores[0], { username: "Player 1", score: 1 });
});
