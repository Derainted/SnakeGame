console.log("js loaded");

import { Board } from "./logic/Board.js";
import { Game } from "./logic/Game.js";
import { Renderer } from "./ui/Renderer.js";
import { Input } from "./ui/Input.js";
import { MultiplayerManager } from "./logic/MultiplayerManager.js";
import { UIManager } from "./ui/UiManager.js";
import { Snake } from "./logic/Snake.js";

const canvas = document.getElementById("gameCanvas");
const board = new Board(20, 20, 30);
const game = new Game(board);
const renderer = new Renderer(canvas, board);

const multiplayer = new MultiplayerManager(game, game.localSnakeId);

// 1️⃣ Create local snake immediately
game.localSnakeId = crypto.randomUUID();
const localSnake = new Snake(5, 10, game.localSnakeId, "Player");
game.snakes[game.localSnakeId] = localSnake;

// 2️⃣ Attach input to control local snake
new Input(game);

// 3️⃣ UI Manager for host/join buttons
const ui = new UIManager(multiplayer);
// Override update to send local snake each tick
const originalUpdate = game.update.bind(game);
game.update = function () {
  originalUpdate();

  if (multiplayer.isConnectedToSession) {
    multiplayer.sendSnake();
  }
};

// Start game and render loop
game.start();
function loop() {
  renderer.clear();
  renderer.drawFood(game.food);
  renderer.drawSnakes(Object.values(game.snakes));
  renderer.drawHUD(game);
  renderer.drawScoreboard(game.scoreboard);
  renderer.drawOverlay(game);

  requestAnimationFrame(loop);
}
loop();
