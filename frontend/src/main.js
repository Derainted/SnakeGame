console.log("js loaded");

import { Board } from "./logic/Board.js";
import { Game } from "./logic/Game.js";
import { Renderer } from "./ui/Renderer.js";
import { Input } from "./ui/Input.js";
import { MultiplayerManager } from "./logic/MultiplayerManager.js";

const canvas = document.getElementById("gameCanvas");

const board = new Board(20, 20, 30);
const game = new Game(board);
const renderer = new Renderer(canvas, board);
new Input(game);

// Initialize multiplayer
const multiplayer = new MultiplayerManager(game);

// Example UI: add buttons dynamically
const hostButton = document.createElement("button");
hostButton.textContent = "Host Game";
document.body.appendChild(hostButton);

const joinInput = document.createElement("input");
joinInput.placeholder = "Session ID";
document.body.appendChild(joinInput);

const joinButton = document.createElement("button");
joinButton.textContent = "Join Game";
document.body.appendChild(joinButton);

// Button events
hostButton.addEventListener("click", async () => {
  const playerName = prompt("Enter your name", "Player");
  if (!playerName) return;

  try {
    const session = await multiplayer.host(playerName);
    console.log("HOSTED SESSION:", session);
    alert(`Session created: ${session}`);
  } catch (e) {
    console.error("Host failed:", e);
  }
});


joinButton.addEventListener("click", async () => {
  const sessionId = joinInput.value.trim();
  if (!sessionId) return alert("Enter a session ID");

  const playerName = prompt("Enter your name", "Player");
  if (!playerName) return;

  try {
    const session = await multiplayer.join(sessionId, playerName);
    console.log("JOINED SESSION:", session);
    alert(`Joined session: ${session}`);
  } catch (e) {
    console.error("Join failed:", e);
  }
});


// Override update to send local snake each tick
const originalUpdate = game.update.bind(game);
game.update = function () {
  originalUpdate();

  if (multiplayer.isConnectedToSession) {
    multiplayer.sendSnake();
  }
};


// Your existing render loop stays exactly the same
function loop() {
  renderer.clear();
  renderer.drawFood(game.food);
  renderer.drawSnakes(Object.values(game.snakes));
  renderer.drawHUD(game);
  renderer.drawScoreboard(game.scoreboard);
  renderer.drawOverlay(game);

  requestAnimationFrame(loop);
}

game.start();
loop();
