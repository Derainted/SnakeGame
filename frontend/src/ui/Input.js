export class Input {
  constructor(game) {
    this.game = game;

    window.addEventListener("keydown", (e) => {
      // Restart logic
      if (this.game.gameOver && e.key.toLowerCase() === "r") {
        this.game.restart();
        return;
      }

      const snake = this.game.snakes[this.game.localSnakeId];
      if (!snake) return;

      switch (e.key) {
        case "ArrowUp":
          snake.setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          snake.setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          snake.setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          snake.setDirection({ x: 1, y: 0 });
          break;
      }
    });
  }
}
