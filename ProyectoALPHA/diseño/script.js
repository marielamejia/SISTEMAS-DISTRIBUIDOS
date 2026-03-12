//MARIELA MEJÍA GUTIÉRREZ (201373)  Y ELENA SOFIA LUNA PALACIO (201041)

// =======================================================
// =============== CONFIGURACIÓN DEL JUEGO ===============
// =======================================================
const SCORE_GANADOR = 5;                //definimos el score para ganar, en este caso ponemos 5 
const GRID_SIZE = 12;
const INTERVALO_MONSTRUOS = 500;           //definimos intervalo de aparicion de cada monstruo (en ms)

//  =======================================================
//  =================== ESTADO GLOBAL =====================
//  =======================================================
const state = {
  currentPlayer: "",
  players: {},
  currentMonsterIndex: null,
  gameRunning: false,
  timerSeconds: 0,
  timerIntervalId: null,
  monsterIntervalId: null,
  winner: null
};

// =======================================================
// ================== ELEMENTOS DEL DOM ==================
// =======================================================
const login = document.getElementById("login");
const gameScreen = document.getElementById("gameScreen");
const loginForm = document.getElementById("loginForm");
const nombreJugadorInput = document.getElementById("nombreJugador");
const nombreJugadorActualEl = document.getElementById("nombreJugadorActual");
const contadorHitEl = document.getElementById("contadorHit");
const progresoBarraEl = document.getElementById("progresoBarra");
const hitChecksEl = document.getElementById("hitChecks");
const timerTextEl = document.getElementById("timerText");
const statusEl = document.getElementById("status");
const gridBoardEl = document.getElementById("gridBoard");
const listaJugadoresEl = document.getElementById("listaJugadores");

const iniciaBtn = document.getElementById("iniciaBtn");
const salidaBtn = document.getElementById("salidaBtn");

// =========================
// INICIALIZACIÓN
// =========================
createGrid();
renderHitChecks();
renderScoreboard();
updateHUD();

// =========================
// LOGIN
// =========================
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = nombreJugadorInput.value.trim();
  if (!name) return;

  state.currentPlayer = name;

  // Conserva contexto si el jugador "sale y vuelve a entrar"
  if (!state.players[name]) {
    state.players[name] = {
      name,
      score: 0,
      connected: true
    };
  } else {
    state.players[name].connected = true;
  }

  // Jugadores de muestra para probar scoreboard
  seedFakePlayers(name);

  nombreJugadorActualEl.textContent = name;

  login.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  renderScoreboard();
  updateHUD();
});

// =========================
// BOTONES
// =========================
iniciaBtn.addEventListener("click", () => {
  startGame();
});

salidaBtn.addEventListener("click", () => {
  leaveGame();
});

// =========================
// CREAR TABLERO
// =========================
function createGrid() {
  gridBoardEl.innerHTML = "";

  for (let i = 0; i < GRID_SIZE; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.index = i;

    const content = document.createElement("div");
    content.className = "tile-content";
    content.textContent = "";
    tile.appendChild(content);

    tile.addEventListener("click", () => handleTileClick(i));

    gridBoardEl.appendChild(tile);
  }
}

// =========================
// LÓGICA DE JUEGO
// =========================
function startGame() {
  if (!state.currentPlayer) return;

  resetBoardVisual();
  state.winner = null;
  state.gameRunning = true;
  state.timerSeconds = 0;

  // Reinicia puntajes solo al comenzar una nueva partida
  Object.values(state.players).forEach((player) => {
    player.score = 0;
  });

  updateHUD();
  renderScoreboard();
  setStatus("Jugando", "green");

  clearInterval(state.timerIntervalId);
  clearInterval(state.monsterIntervalId);

  state.timerIntervalId = setInterval(() => {
    state.timerSeconds++;
    timerTextEl.textContent = formatTime(state.timerSeconds);
  }, 1000);

  state.monsterIntervalId = setInterval(() => {
    publishMonster();
  }, INTERVALO_MONSTRUO);

  publishMonster();
}

function leaveGame() {
  if (!state.currentPlayer) return;

  if (state.players[state.currentPlayer]) {
    state.players[state.currentPlayer].connected = false;
  }

  clearInterval(state.timerIntervalId);
  clearInterval(state.monsterIntervalId);

  state.gameRunning = false;
  state.currentMonsterIndex = null;
  resetBoardVisual();

  gameScreen.classList.add("hidden");
  login.classList.remove("hidden");

  nombreJugadorInput.value = state.currentPlayer;
  renderScoreboard();
}

function publishMonster() {
  if (!state.gameRunning || state.winner) return;

  const randomIndex = Math.floor(Math.random() * GRID_SIZE);
  state.currentMonsterIndex = randomIndex;

  renderMonster(randomIndex);

  // Aquí después conectas el tópico / websocket / SSE
  // simulateTopicPublish({ type: "monster", position: randomIndex });
}

function handleTileClick(index) {
  if (!state.gameRunning) return;
  if (state.winner) return;
  if (index !== state.currentMonsterIndex) return;

  const currentPlayer = state.players[state.currentPlayer];
  if (!currentPlayer) return;

  currentPlayer.score += 1;

  markHit(index);
  state.currentMonsterIndex = null;

  sendHitToServer({
    player: currentPlayer.name,
    position: index,
    score: currentPlayer.score,
    timestamp: Date.now()
  });

  updateHUD();
  renderScoreboard();

  if (currentPlayer.score >= SCORE_GANADOR) {
    finishGame(currentPlayer.name);
  }
}

function finishGame(winnerName) {
  state.winner = winnerName;
  state.gameRunning = false;

  clearInterval(state.timerIntervalId);
  clearInterval(state.monsterIntervalId);

  setStatus(`Ganó ${winnerName}`, "red");
  state.currentMonsterIndex = null;
  resetBoardVisual();

  announceWinner(winnerName);

  setTimeout(() => {
    startGame();
  }, 3000);
}

// =========================
// RENDER
// =========================
function renderMonster(index) {
  const tiles = document.querySelectorAll(".tile");

  tiles.forEach((tile, i) => {
    tile.classList.remove("monster-active", "hit");

    const content = tile.querySelector(".tile-content");
    content.textContent = "";

    if (i === index) {
      tile.classList.add("monster-active");
      content.textContent = "👹";
    }
  });
}

function markHit(index) {
  const tiles = document.querySelectorAll(".tile");
  const tile = tiles[index];
  if (!tile) return;

  tile.classList.remove("monster-active");
  tile.classList.add("hit");

  const content = tile.querySelector(".tile-content");
  content.textContent = "✓";

  setTimeout(() => {
    tile.classList.remove("hit");
    content.textContent = "";
  }, 400);
}

function resetBoardVisual() {
  const tiles = document.querySelectorAll(".tile");
  tiles.forEach((tile) => {
    tile.classList.remove("monster-active", "hit");
    const content = tile.querySelector(".tile-content");
    content.textContent = "";
  });
}

function updateHUD() {
  const player = state.players[state.currentPlayer];
  const score = player ? player.score : 0;

  contadorHitEl.textContent = score;
  progresoBarraEl.style.width = `${(score / SCORE_GANADOR) * 100}%`;
  timerTextEl.textContent = formatTime(state.timerSeconds);

  renderHitChecks();
}

function renderHitChecks() {
  const player = state.players[state.currentPlayer];
  const score = player ? player.score : 0;

  hitChecksEl.innerHTML = "";

  for (let i = 0; i < SCORE_GANADOR; i++) {
    const item = document.createElement("div");
    item.className = i < score ? "check" : "empty-check";
    item.textContent = i < score ? "✓" : "";
    hitChecksEl.appendChild(item);
  }
}

function renderScoreboard() {
  listaJugadoresEl.innerHTML = "";

  const sortedPlayers = Object.values(state.players).sort((a, b) => b.score - a.score);

  if (sortedPlayers.length === 0) {
    listaJugadoresEl.innerHTML = `<p style="color:#6c74a2;">Aún no hay jugadores.</p>`;
    return;
  }

  sortedPlayers.forEach((player) => {
    const row = document.createElement("div");
    row.className = "player-row";

    const left = document.createElement("div");
    left.className = "player-left";
    left.innerHTML = `
      <span>👾</span>
      <span>${player.name}${player.connected ? "" : " (fuera)"}</span>
    `;

    const right = document.createElement("div");
    right.className = "player-score";
    right.innerHTML = `
      <span class="mini-check">✓</span>
      <span>${player.score}</span>
    `;

    row.appendChild(left);
    row.appendChild(right);
    listaJugadoresEl.appendChild(row);
  });
}

function setStatus(text, colorType) {
  statusEl.textContent = text;
  statusEl.classList.remove("status-green", "status-red");

  if (colorType === "green") {
    statusEl.classList.add("status-green");
  } else {
    statusEl.classList.add("status-red");
  }
}

// =========================
// "CONECTORES" PARA BACKEND
// =========================
// Estas funciones quedan listas para conectarse después
// con tu servidor real.

function sendHitToServer(payload) {
  console.log("TCP -> enviar golpe al servidor:", payload);

  // Ejemplo futuro:
  // fetch("http://localhost:8080/hit", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(payload)
  // });
}

function announceWinner(winnerName) {
  console.log("TOPIC <- ganador anunciado:", winnerName);
}

// =========================
// UTILIDADES
// =========================
function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function seedFakePlayers(currentName) {
  const names = ["Player1", "Player2", "Player3"];

  names.forEach((name) => {
    if (name !== currentName && !state.players[name]) {
      state.players[name] = {
        name,
        score: 0,
        connected: true
      };
    }
  });
}