import {
  createInitialState,
  queueDirection,
  restartGame,
  stepGame,
  togglePause,
} from "./snake-logic.mjs";
import {
  MAX_LEADERBOARD_ENTRIES,
  normalizeUsername,
  toDisplayScores,
} from "./leaderboard-shared.mjs";

const TICK_MS = 140;
const GRID_SIZE = 16;
const PLAYER_NAME_STORAGE_KEY = "snake-player-name";

const board = document.querySelector("#game-board");
const scoreValue = document.querySelector("#score");
const statusValue = document.querySelector("#status");
const restartButton = document.querySelector("#restart-button");
const directionButtons = document.querySelectorAll("[data-direction]");
const playerForm = document.querySelector("#player-form");
const playerNameInput = document.querySelector("#player-name");
const playerMessage = document.querySelector("#player-message");
const leaderboardMessage = document.querySelector("#leaderboard-message");
const leaderboardList = document.querySelector("#leaderboard-list");
const refreshScoresButton = document.querySelector("#refresh-scores-button");

let state = createInitialState({ cols: GRID_SIZE, rows: GRID_SIZE });
let leaderboardEntries = [];
let hasSubmittedCurrentScore = false;

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
  renderLeaderboard();
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
  hasSubmittedCurrentScore = false;
  render();
}

function renderLeaderboard() {
  leaderboardList.textContent = "";

  if (leaderboardEntries.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No scores yet.";
    leaderboardList.appendChild(emptyItem);
    return;
  }

  leaderboardEntries.forEach((entry) => {
    const item = document.createElement("li");
    const name = document.createElement("span");
    const score = document.createElement("span");

    name.textContent = entry.username;
    score.textContent = String(entry.score);

    item.append(name, score);
    leaderboardList.appendChild(item);
  });
}

function setLeaderboardMessage(message) {
  leaderboardMessage.textContent = message;
}

function setPlayerMessage(message) {
  playerMessage.textContent = message;
}

function getSavedUsername() {
  return normalizeUsername(playerNameInput.value);
}

function persistUsername(username) {
  localStorage.setItem(PLAYER_NAME_STORAGE_KEY, username);
  playerNameInput.value = username;
}

async function loadLeaderboard() {
  try {
    setLeaderboardMessage("Loading scores...");
    const response = await fetch("/api/scores");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "Failed to load scores.");
    }

    leaderboardEntries = toDisplayScores(data.scores);
    setLeaderboardMessage(
      leaderboardEntries.length === 0
        ? "No scores yet. Be the first to post one."
        : `Top ${Math.min(leaderboardEntries.length, MAX_LEADERBOARD_ENTRIES)} scores`,
    );
    renderLeaderboard();
  } catch (error) {
    leaderboardEntries = [];
    setLeaderboardMessage("Leaderboard unavailable until the Vercel API is configured.");
    renderLeaderboard();
  }
}

async function submitScoreIfNeeded() {
  if (hasSubmittedCurrentScore || state.score <= 0 || state.status !== "gameover") {
    return;
  }

  const username = getSavedUsername();
  if (!username) {
    setPlayerMessage("Enter a username before restarting if you want to save this score.");
    return;
  }

  hasSubmittedCurrentScore = true;
  persistUsername(username);
  setLeaderboardMessage("Submitting score...");

  try {
    const response = await fetch("/api/scores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        score: state.score,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "Failed to save score.");
    }

    leaderboardEntries = toDisplayScores(data.scores);
    setPlayerMessage(`Saved ${username} with score ${state.score}.`);
    setLeaderboardMessage("Leaderboard updated.");
    renderLeaderboard();
  } catch (error) {
    hasSubmittedCurrentScore = false;
    setLeaderboardMessage("Could not save score right now.");
    renderLeaderboard();
  }
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
refreshScoresButton.addEventListener("click", loadLeaderboard);

playerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = getSavedUsername();
  if (!username) {
    localStorage.removeItem(PLAYER_NAME_STORAGE_KEY);
    setPlayerMessage("Enter a username with at least one letter or number.");
    playerNameInput.focus();
    return;
  }

  persistUsername(username);
  setPlayerMessage(`Saved username: ${username}`);
});

setInterval(() => {
  const previousStatus = state.status;
  state = stepGame(state);
  render();

  if (previousStatus !== "gameover" && state.status === "gameover") {
    submitScoreIfNeeded();
  }
}, TICK_MS);

const storedUsername = normalizeUsername(localStorage.getItem(PLAYER_NAME_STORAGE_KEY) ?? "");
if (storedUsername) {
  persistUsername(storedUsername);
  setPlayerMessage(`Ready to save scores as ${storedUsername}.`);
}

loadLeaderboard();
render();
