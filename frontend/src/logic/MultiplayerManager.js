import { MultiplayerApi } from "../multiplayer/MultiplayerApi.js";

import { Snake } from "./Snake.js";

export class MultiplayerManager {
  constructor(game, localSnakeId, serverUrl = null) {
    this.game = game;
    this.localSnakeId = localSnakeId; // ✅ store the local snake ID
    this.isConnectedToSession = false;

    // Use provided server or default
    this.api = new MultiplayerApi(
      `ws${location.protocol === "https:" ? "s" : ""}://${location.host}/net`
    );

    this.isHost = false;

    this.setupListeners();
  }

  setupListeners() {
    this.api.listen((event, messageId, clientId, data) => {
      if (event !== "game") return;

      const { snakeId, segments, name } = data;
      if (!snakeId || !segments) return;

      // Ignore your own snake updates
      if (snakeId === this.localSnakeId) return;

      // Only create a remote snake if it doesn't exist yet
      if (!this.game.snakes[snakeId]) {
        const SnakeClass = Object.values(this.game.snakes)[0]?.constructor;
        if (!SnakeClass) return;

        const first = segments[0];
        this.game.snakes[snakeId] = new SnakeClass(
          first.x,
          first.y,
          snakeId,
          name || "Remote"
        );
      }

      // Update remote snake segments
      this.game.snakes[snakeId].segments = segments;
    });
  }

  // Spawn local snake
  createLocalSnake(playerName = "Player") {
    const spawnX = Math.floor(this.game.board.cols / 2);
    const spawnY = Math.floor(this.game.board.rows / 2);

    const snake = new Snake(spawnX, spawnY, this.localSnakeId, playerName);
    this.game.snakes[this.localSnakeId] = snake;
  }

  host(playerName) {
    return this.api.host().then((res) => {
      this.isHost = true;
      this.isConnectedToSession = true;

      // Spawn local snake
      this.createLocalSnake(playerName);

      // Send initial snake state
      this.sendSnake(playerName);

      // Listen for new joiners to immediately send all snakes
      this.api.listen((event, messageId, clientId, data) => {
        if (event !== "joined") return;

        // New player joined → send all existing snakes to them
        for (const snake of Object.values(this.game.snakes)) {
          this.api.game({
            snakeId: snake.id,
            segments: snake.segments,
            name: snake.name,
          });
        }
      });

      return res.session;
    });
  }

  join(sessionId, playerName) {
    return this.api.join(sessionId, { name: playerName }).then((res) => {
      this.isConnectedToSession = true;

      // Spawn local snake
      this.createLocalSnake(playerName);

      // Send local snake state
      this.sendSnake(playerName);

      // Listen for all incoming snakes (already in setupListeners)
      // They will appear immediately when host sends them

      return res.session;
    });
  }

  sendSnake(playerName = "Player") {
    const localSnake = this.game.snakes[this.localSnakeId];
    if (!localSnake) return;

    this.api.game({
      snakeId: this.localSnakeId,
      segments: localSnake.segments,
      name: playerName,
    });
  }
}
