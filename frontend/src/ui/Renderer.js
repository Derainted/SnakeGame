export class Renderer {
  constructor(canvas, board) {
    this.ctx = canvas.getContext("2d");
    this.board = board;
  }

  clear() {
    this.ctx.fillStyle = "#111";
    this.ctx.fillRect(
      0,
      0,
      this.board.cols * this.board.cellSize,
      this.board.rows * this.board.cellSize
    );
  }

  drawSnakes(snakes) {
    const colors = ["lime", "cyan"];

    snakes.forEach((snake, index) => {
      this.ctx.fillStyle = colors[index % colors.length];

      for (const segment of snake.segments) {
        this.ctx.fillRect(
          segment.x * this.board.cellSize,
          segment.y * this.board.cellSize,
          this.board.cellSize,
          this.board.cellSize
        );
      }
    });
  }

  drawFood(food) {
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(
      food.x * this.board.cellSize,
      food.y * this.board.cellSize,
      this.board.cellSize,
      this.board.cellSize
    );
  }

  drawOverlay(game) {
    if (!game.gameOver) return;

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(
      0,
      0,
      this.board.cols * this.board.cellSize,
      this.board.rows * this.board.cellSize
    );

    this.ctx.fillStyle = "white";
    this.ctx.font = "36px Arial";
    this.ctx.textAlign = "center";

    this.ctx.fillText(
      "GAME OVER",
      (this.board.cols * this.board.cellSize) / 2,
      (this.board.rows * this.board.cellSize) / 2
    );

    this.ctx.font = "18px Arial";
    this.ctx.fillText(
      "Press R to restart",
      (this.board.cols * this.board.cellSize) / 2,
      (this.board.rows * this.board.cellSize) / 2 + 40
    );
  }

  drawHUD(game) {
    this.ctx.fillStyle = "white";
    this.ctx.font = "16px Arial";
    this.ctx.textAlign = "left";

    this.ctx.fillText(`Score: ${game.score}`, 10, 20);
    this.ctx.fillText(`Time: ${Math.ceil(game.timeLeft / 1000)}`, 10, 40);
  }

  drawScoreboard(scoreboard) {
    const scores = scoreboard.getAll().slice(0, 5);

    this.ctx.fillStyle = "white";
    this.ctx.font = "14px Arial";
    this.ctx.textAlign = "right";

    let y = 20;
    this.ctx.fillText(
      "Top Scores",
      this.board.cols * this.board.cellSize - 10,
      y
    );

    y += 20;

    for (const entry of scores) {
      this.ctx.fillText(
        `${entry.name}: ${entry.score}`,
        this.board.cols * this.board.cellSize - 10,
        y
      );
      y += 18;
    }
  }
}
