console.log("js loaded");

import { Board } from "./logic/Board.js";
import { Game } from "./logic/Game.js";
import { Renderer } from "./ui/Renderer.js";
import { Input } from "./ui/Input.js";
import { MultiplayerManager } from "./logic/MultiplayerManager.js";
import { UIManager } from "./ui/UiManager.js";

const canvas = document.getElementById("gameCanvas");
const board = new Board(20, 20, 30);
const game = new Game(board);
const renderer = new Renderer(canvas, board);
new Input(game);

const multiplayer = new MultiplayerManager(game);
const ui = new UIManager(multiplayer); // handle all host/join DOM

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
