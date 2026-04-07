//MARIELA MEJÍA GUTIÉRREZ (201373)  Y ELENA SOFIA LUNA PALACIO (201041)

// =======================================================
// =============== CONFIGURACIÓN DEL JUEGO ===============
// =======================================================
const SCORE_GANADOR = 5;                //definimos el score para ganar, en este caso ponemos 5 
const GRID_SIZE = 12;                   //queremos que nuestro tablero sea de 4x3
const INTERVALO_MONSTRUOS = 500;           //definimos intervalo de aparicion de cada monstruo (en ms)

//  =======================================================
//  =================== ESTADO GLOBAL =====================
//  =======================================================
const state = {
  currentPlayer: "",
  players: {},
  currentMonsterIndex: null,        //donde está el monstruo
  gameRunning: false,               //nos dice si la partida está corriendo
  timerSeconds: 0,
  timerIntervalId: null,
  monsterIntervalId: null,        //id dl intervalo de aparicion entre monstruos
  winner: null          //nombre del ganador
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
//creamos el tablero, scoreboard y panel
createGrid();
renderHitChecks();
renderScoreboard();
updateHUD();

// =========================
// LOGIN
// =========================
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();         //no queremos que la pagina se pueda recargar (en este caso porque no nos interesa)

  const name = nombreJugadorInput.value.trim();
  if (!name) return;          //se debe ingresar un nombre

  state.currentPlayer = name;

  // si el jugador entra por primera vez lo agregamos a players
  if (!state.players[name]) {
    state.players[name] = {
      name,
      score: 0,
      connected: true
    };
  } else {
    state.players[name].connected = true;     //si ya existe entonces decimos que esta jugando de nuevo
  }

  // Jugadores de muestra para probar scoreboard
  seedFakePlayers(name);

  nombreJugadorActualEl.textContent = name;

  login.classList.add("hidden");      //ocultamos login para mostrar intefaz de juego
  gameScreen.classList.remove("hidden");

  renderScoreboard();
  updateHUD();
});

// =========================
// BOTONES
// =========================
//boton para iniciar el juego
iniciaBtn.addEventListener("click", () => {
  startGame();
});

//para salirnos del juego
salidaBtn.addEventListener("click", () => {
  leaveGame();
});

// =========================
// CREAR TABLERO
// =========================
function createGrid() {
  gridBoardEl.innerHTML = "";

  for (let i = 0; i < GRID_SIZE; i++) {   //creamos cada casilla del tablero
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.index = i;

    const content = document.createElement("div");
    content.className = "tile-content";
    content.textContent = "";
    tile.appendChild(content);

    tile.addEventListener("click", () => handleTileClick(i)); //aqui checamos si se golpeó al monstruo

    gridBoardEl.appendChild(tile);
  }
}

// =========================
// LÓGICA DE JUEGO
// =========================
function startGame() {
  if (!state.currentPlayer) return;

  resetBoardVisual();     //reinciamos variables del juego
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

  state.timerIntervalId = setInterval(() => {     //iniciamos timer del juego
    state.timerSeconds++;
    timerTextEl.textContent = formatTime(state.timerSeconds);
  }, 1000);

  state.monsterIntervalId = setInterval(() => {   //para que aparezcan los monstruos
    publishMonster();
  }, INTERVALO_MONSTRUO);

  publishMonster();
}


//creamos esta funcion para salir del juego (la llamamos por medio de un boton)
function leaveGame() {
  if (!state.currentPlayer) return;

  if (state.players[state.currentPlayer]) {
    state.players[state.currentPlayer].connected = false;
  }

  clearInterval(state.timerIntervalId);
  clearInterval(state.monsterIntervalId);

  state.gameRunning = false;      //aqui se reinicia el juego
  state.currentMonsterIndex = null;
  resetBoardVisual();

  gameScreen.classList.add("hidden");
  login.classList.remove("hidden");

  nombreJugadorInput.value = state.currentPlayer;     //queremos que sea el mismo jugador
  renderScoreboard();
}


//funcion para que salgan los monstruos en las casillas
function publishMonster() {
  if (!state.gameRunning || state.winner) return;

  const randomIndex = Math.floor(Math.random() * GRID_SIZE);
  state.currentMonsterIndex = randomIndex;

  renderMonster(randomIndex);

}

//funcion para cuando el jugador da clic en una casilla
function handleTileClick(index) {
  if (!state.gameRunning) return;
  if (state.winner) return;
  if (index !== state.currentMonsterIndex) return;

  const currentPlayer = state.players[state.currentPlayer];
  if (!currentPlayer) return;

  currentPlayer.score += 1;     //sumamos puntos por cada monstruo que se pegó

  markHit(index);
  state.currentMonsterIndex = null;

  updateHUD();
  renderScoreboard();

  if (currentPlayer.score >= SCORE_GANADOR) {         //checamos si alcanza el puntaje para ganar y si si entonces terminamos el juego
    finishGame(currentPlayer.name);
  }
}

//nos dice quien fue el ganador 
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
//muestra que si se golpeo al monstruo
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

//limpia las casillas dell tablero
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
//para las palomitas de progreso
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