import { Snake } from "./Snake.js";
import { Food } from "./Food.js";
import { Scoreboard } from "../ui/Scoreboard.js";
import { Collision } from "./Collision.js";

export class Game {
  constructor(board) {
    this.board = board;

    this.snakes = {};

    // Collision helper
    this.collision = new Collision(this.board, this.snakes);

    this.running = false;
    this.tickRate = 150; // ms
    this.intervalId = null;

    this.matchDuration = 20_000; // 20 seconds for testing
    this.timeLeft = this.matchDuration;
    this.gameOver = false;
    this.lastTickTime = Date.now();

    this.score = 0;
    this.scoreboard = new Scoreboard();
    this.playerName = "Player";

    const spawn = this.getRandomSpawnPosition();
    this.food = new Food(spawn.x, spawn.y);
  }

  start() {
    if (this.running) return;

    this.running = true;
    this.gameOver = false;
    this.timeLeft = this.matchDuration;
    this.lastTickTime = Date.now();

    this.intervalId = setInterval(() => {
      this.update();
    }, this.tickRate);
  }

  stop() {
    this.running = false;
    clearInterval(this.intervalId);
  }

  update() {
    if (this.gameOver) return;

    const now = Date.now();
    const delta = now - this.lastTickTime;
    this.lastTickTime = now;
    this.timeLeft -= delta;

    if (this.timeLeft <= 0) {
      this.endMatch();
      return;
    }

    // Send local snake via multiplayer if manager exists
    if (this.multiplayerManager) {
      this.multiplayerManager.sendSnake("Player");
    }

    // Move all snakes
    for (const snake of Object.values(this.snakes)) {
      snake.move();
    }

    // Wall & self collision
    for (const snake of Object.values(this.snakes)) {
      if (
        this.collision.hasWallCollision(snake) ||
        this.collision.hasSelfCollision(snake)
      ) {
        const spawn = this.getRandomSpawnPosition();
        snake.reset(spawn.x, spawn.y);
      }
    }

    // Snake vs snake collision
    const deadSnake = this.collision.getSnakeCollision();
    if (deadSnake) {
      const spawn = this.getRandomSpawnPosition();
      deadSnake.reset(spawn.x, spawn.y);
    }

    // Food collision
    const eater = this.getSnakeThatEatsFood();
    if (eater) {
      eater.grow();
      this.score += 1;
      this.respawnFood();
    }
  }

  endMatch() {
    this.gameOver = true;
    this.stop();
    this.scoreboard.add(this.playerName, this.score);
  }

  restart() {
    for (const snake of Object.values(this.snakes)) {
      const spawn = this.getRandomSpawnPosition();
      snake.reset(spawn.x, spawn.y);
    }
    this.score = 0;
    this.start();
  }

  getSnakeThatEatsFood() {
    return Object.values(this.snakes).find((snake) => {
      const head = snake.segments[0];
      return head.x === this.food.x && head.y === this.food.y;
    });
  }

  respawnFood() {
    let position;
    do {
      position = this.getRandomSpawnPosition();
    } while (
      Object.values(this.snakes).some((snake) =>
        snake.segments.some((s) => s.x === position.x && s.y === position.y)
      )
    );
    this.food.setPosition(position.x, position.y);
  }

  getRandomSpawnPosition() {
    return {
      x: Math.floor(Math.random() * (this.board.cols - 2)) + 1,
      y: Math.floor(Math.random() * (this.board.rows - 2)) + 1,
    };
  }
}
