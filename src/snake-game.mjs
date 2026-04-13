import {
  createInitialState,
  queueDirection,
  restartGame,
  stepGame,
  togglePause,
} from "./snake-logic.mjs";

const TICK_MS = 140;
const GRID_SIZE = 16;

const board = document.querySelector("#game-board");
const scoreValue = document.querySelector("#score");
const statusValue = document.querySelector("#status");
const restartButton = document.querySelector("#restart-button");
const directionButtons = document.querySelectorAll("[data-direction]");

let state = createInitialState({ cols: GRID_SIZE, rows: GRID_SIZE });

const cells = [];
for (let index = 0; index < GRID_SIZE * GRID_SIZE; index += 1) {
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.setAttribute("role", "gridcell");
  board.appendChild(cell);
  cells.push(cell);
}

function render() {
  for (const cell of cells) {
    cell.className = "cell";
  }

  if (state.food) {
    getCell(state.food.x, state.food.y).classList.add("cell--food");
  }

  state.snake.forEach((segment, index) => {
    const cell = getCell(segment.x, segment.y);
    cell.classList.add("cell--snake");
    if (index === 0) {
      cell.classList.add("cell--head");
    }
  });

  scoreValue.textContent = String(state.score);
  statusValue.textContent = getStatusText(state.status);
}

function getCell(x, y) {
  return cells[y * GRID_SIZE + x];
}

function getStatusText(status) {
  if (status === "ready") {
    return "Press any direction to start.";
  }

  if (status === "paused") {
    return "Paused. Press space to continue.";
  }

  if (status === "gameover") {
    return "Game over. Press restart to play again.";
  }

  return "Keep going.";
}

function setDirection(direction) {
  state = queueDirection(state, direction);
  render();
}

function resetGame() {
  state = restartGame({ cols: GRID_SIZE, rows: GRID_SIZE });
  render();
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const directionsByKey = {
    arrowup: "up",
    w: "up",
    arrowdown: "down",
    s: "down",
    arrowleft: "left",
    a: "left",
    arrowright: "right",
    d: "right",
  };

  if (key === " ") {
    event.preventDefault();
    state = togglePause(state);
    render();
    return;
  }

  const direction = directionsByKey[key];
  if (!direction) {
    return;
  }

  event.preventDefault();
  setDirection(direction);
});

directionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setDirection(button.dataset.direction);
  });
});

restartButton.addEventListener("click", resetGame);

setInterval(() => {
  state = stepGame(state);
  render();
}, TICK_MS);

render();
