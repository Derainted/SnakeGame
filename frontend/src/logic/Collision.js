export class Collision {
  constructor(board, snakes) {
    this.board = board;
    this.snakes = snakes; // object: key = snake.id, value = Snake instance
  }

  // Self-collision
  hasSelfCollision(snake) {
    const [head, ...body] = snake.segments;
    return body.some((s) => s.x === head.x && s.y === head.y);
  }

  // Wall collision
  hasWallCollision(snake) {
    const head = snake.segments[0];
    return !this.board.isInside(head);
  }

  // Snake vs snake collision
  getSnakeCollision() {
    for (const snake of Object.values(this.snakes)) {
      const head = snake.segments[0];

      for (const other of Object.values(this.snakes)) {
        const body = other.segments;

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
