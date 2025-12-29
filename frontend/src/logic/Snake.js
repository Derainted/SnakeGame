export class Snake {
  constructor(x, y, id = null, name = "Player") {
    this.id = id ?? crypto.randomUUID(); // unique snake ID
    this.name = name;
    this.direction = { x: 1, y: 0 };
    this.segments = [
      { x, y },
      { x: x - 1, y },
    ];
    this.growNext = false;
  }

  setDirection(newDir) {
    // Prevent reversing into itself (important later)
    const opposite =
      this.direction.x + newDir.x === 0 && this.direction.y + newDir.y === 0;

    if (!opposite) {
      this.direction = newDir;
    }
  }

  move() {
    const head = this.segments[0];
    const newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y,
    };

    this.segments.unshift(newHead);

    if (!this.growNext) {
      this.segments.pop();
    } else {
      this.growNext = false;
    }
  }

  grow() {
    this.growNext = true;
  }

  reset(startX, startY) {
    this.direction = { x: 1, y: 0 };
    this.segments = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
    ];
    this.growNext = false;
  }
}
