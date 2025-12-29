export class Board {
  constructor(cols, rows, cellSize) {
    this.cols = cols;
    this.rows = rows;
    this.cellSize = cellSize;
  }

  isInside(position) {
    return (
      position.x >= 0 &&
      position.y >= 0 &&
      position.x < this.cols &&
      position.y < this.rows
    );
  }
}
