export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE_DIRECTIONS = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export function createInitialState(config = {}, random = Math.random) {
  const cols = config.cols ?? 16;
  const rows = config.rows ?? 16;
  const initialSnake = config.initialSnake ?? [
    { x: Math.floor(cols / 2), y: Math.floor(rows / 2) },
  ];
  const initialDirection = config.initialDirection ?? "right";

  return {
    cols,
    rows,
    snake: initialSnake,
    direction: initialDirection,
    queuedDirection: initialDirection,
    food: placeFood(initialSnake, cols, rows, random),
    score: 0,
    status: "ready",
  };
}

export function queueDirection(state, nextDirection) {
  if (!DIRECTIONS[nextDirection]) {
    return state;
  }

  const activeDirection = state.status === "ready" ? state.direction : state.queuedDirection;
  if (OPPOSITE_DIRECTIONS[activeDirection] === nextDirection && state.snake.length > 1) {
    return state;
  }

  return {
    ...state,
    queuedDirection: nextDirection,
    status: state.status === "ready" ? "running" : state.status,
  };
}

export function togglePause(state) {
  if (state.status === "running") {
    return { ...state, status: "paused" };
  }

  if (state.status === "paused") {
    return { ...state, status: "running" };
  }

  return state;
}

export function restartGame(config = {}, random = Math.random) {
  return createInitialState(config, random);
}

export function stepGame(state, random = Math.random) {
  if (state.status !== "running") {
    return state;
  }

  const direction = state.queuedDirection;
  const movement = DIRECTIONS[direction];
  const nextHead = {
    x: state.snake[0].x + movement.x,
    y: state.snake[0].y + movement.y,
  };

  const eatsFood =
    state.food !== null && nextHead.x === state.food.x && nextHead.y === state.food.y;
  const nextBody = eatsFood ? state.snake : state.snake.slice(0, -1);

  if (hitsWall(nextHead, state.cols, state.rows) || hitsSnake(nextHead, nextBody)) {
    return {
      ...state,
      direction,
      status: "gameover",
    };
  }

  const snake = [nextHead, ...nextBody];
  const score = eatsFood ? state.score + 1 : state.score;
  const food = eatsFood ? placeFood(snake, state.cols, state.rows, random) : state.food;

  return {
    ...state,
    snake,
    direction,
    food,
    score,
    status: food === null ? "gameover" : state.status,
  };
}

export function placeFood(snake, cols, rows, random = Math.random) {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  const openCells = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        openCells.push({ x, y });
      }
    }
  }

  if (openCells.length === 0) {
    return null;
  }

  const index = Math.floor(random() * openCells.length);
  return openCells[index];
}

function hitsWall(position, cols, rows) {
  return position.x < 0 || position.x >= cols || position.y < 0 || position.y >= rows;
}

function hitsSnake(position, snake) {
  return snake.some((segment) => segment.x === position.x && segment.y === position.y);
}
