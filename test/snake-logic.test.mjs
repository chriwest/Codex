import test from "node:test";
import assert from "node:assert/strict";

import {
  createInitialState,
  placeFood,
  queueDirection,
  restartGame,
  stepGame,
} from "../src/snake-logic.mjs";

test("snake moves one cell in the queued direction", () => {
  let state = createInitialState({
    cols: 6,
    rows: 6,
    initialSnake: [{ x: 2, y: 2 }],
    initialDirection: "right",
  });

  state = queueDirection(state, "right");
  state = stepGame(state, () => 0);

  assert.deepEqual(state.snake, [{ x: 3, y: 2 }]);
  assert.equal(state.status, "running");
});

test("snake grows and score increases after eating food", () => {
  const random = () => 0;
  let state = {
    cols: 5,
    rows: 5,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
    ],
    direction: "right",
    queuedDirection: "right",
    food: { x: 3, y: 2 },
    score: 0,
    status: "running",
  };

  state = stepGame(state, random);

  assert.equal(state.score, 1);
  assert.deepEqual(state.snake, [
    { x: 3, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 2 },
  ]);
  assert.notDeepEqual(state.food, { x: 3, y: 2 });
});

test("snake enters game over when it hits a wall", () => {
  const state = stepGame(
    {
      cols: 4,
      rows: 4,
      snake: [{ x: 3, y: 1 }],
      direction: "right",
      queuedDirection: "right",
      food: { x: 0, y: 0 },
      score: 0,
      status: "running",
    },
    () => 0,
  );

  assert.equal(state.status, "gameover");
});

test("snake cannot reverse directly into itself", () => {
  const state = queueDirection(
    {
      cols: 5,
      rows: 5,
      snake: [
        { x: 2, y: 2 },
        { x: 1, y: 2 },
      ],
      direction: "right",
      queuedDirection: "right",
      food: { x: 0, y: 0 },
      score: 0,
      status: "running",
    },
    "left",
  );

  assert.equal(state.queuedDirection, "right");
});

test("food placement skips occupied cells deterministically", () => {
  const food = placeFood(
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
    2,
    2,
    () => 0,
  );

  assert.deepEqual(food, { x: 1, y: 1 });
});

test("restart resets score and state", () => {
  const state = restartGame(
    {
      cols: 8,
      rows: 8,
      initialSnake: [{ x: 4, y: 4 }],
      initialDirection: "down",
    },
    () => 0,
  );

  assert.equal(state.score, 0);
  assert.equal(state.status, "ready");
  assert.deepEqual(state.snake, [{ x: 4, y: 4 }]);
});

test("game ends cleanly when the snake fills the board", () => {
  const state = stepGame(
    {
      cols: 2,
      rows: 1,
      snake: [{ x: 0, y: 0 }],
      direction: "right",
      queuedDirection: "right",
      food: { x: 1, y: 0 },
      score: 0,
      status: "running",
    },
    () => 0,
  );

  assert.equal(state.status, "gameover");
  assert.equal(state.food, null);
  assert.equal(state.score, 1);
});
