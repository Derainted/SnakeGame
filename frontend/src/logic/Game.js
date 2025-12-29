import { Snake } from "./Snake.js";
import { Food } from "./Food.js";
import { Scoreboard } from "../ui/Scoreboard.js";

export class Game {
  constructor(board) {
    this.board = board;

    this.snakes = {}; // key = snake.id, value = Snake instance

    const snake1 = new Snake(5, 10, "local", "Idris");
    const snake2 = new Snake(15, 10, "remote", "Player");

    this.snakes[snake1.id] = snake1;
    this.snakes[snake2.id] = snake2;

    this.running = false;
    this.tickRate = 150; // ms
    this.intervalId = null;

    this.matchDuration = 10_000; // 60 seconds
    this.timeLeft = this.matchDuration;
    this.gameOver = false;
    this.lastTickTime = Date.now();

    this.score = 0;

    this.scoreboard = new Scoreboard();
    this.playerName = "Player"; // temporary, later from UI

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

    if (this.multiplayerManager) {
      this.multiplayerManager.sendSnake("Player");
    }

    // Move all snakes
    for (const snake of Object.values(this.snakes)) {
      snake.move();
    }

    // Wall & self collision
    for (const snake of Object.values(this.snakes)) {
      const head = snake.segments[0];

      if (!this.board.isInside(head) || this.hasSelfCollision(snake)) {
        const spawn = this.getRandomSpawnPosition();
        snake.reset(spawn.x, spawn.y);
      }
    }

    // Snake vs snake collision
    const deadSnake = this.getSnakeCollision();
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

  hasSelfCollision(snake) {
    const [head, ...body] = snake.segments;
    return body.some((s) => s.x === head.x && s.y === head.y);
  }

  getSnakeCollision() {
    for (const snake of Object.values(this.snakes)) {
      const head = snake.segments[0];

      for (const other of Object.values(this.snakes)) {
        const body = other.segments;

        // Head into another snake's body OR head
        for (let i = 0; i < body.length; i++) {
          // Skip own head
          if (snake === other && i === 0) continue;

          if (head.x === body[i].x && head.y === body[i].y) {
            return snake; // THIS snake dies
          }
        }
      }
    }

    return null;
  }
}
