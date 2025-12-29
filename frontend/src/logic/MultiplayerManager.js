import { MultiplayerApi } from "../multiplayer/MultiplayerApi.js";

export class MultiplayerManager {
  constructor(game, serverUrl = null) {
    this.game = game;
    this.isConnectedToSession = false;

    // Use provided server or default
    this.api = new MultiplayerApi(
      `ws${location.protocol === "https:" ? "s" : ""}://${
        location.host
      }/net`
    );

    console.log(
      "Connecting to multiplayer at:",
      `ws${location.protocol === "https:" ? "s" : ""}://${
        location.host
      }/net`
    );

    this.localSnakeId = crypto.randomUUID(); // unique ID for this client
    this.isHost = false;

    this.setupListeners();
  }

  setupListeners() {
    this.api.listen((event, messageId, clientId, data) => {
      console.log("MP EVENT:", event, {
        messageId,
        clientId,
        data,
      });

      if (event === "joined") {
        console.log("Player joined session:", data);
        return;
      }

      if (event !== "game") return;

      const { snakeId, segments, name } = data;
      if (!snakeId || !segments) return;

      // Ignore own snake
      if (snakeId === this.localSnakeId) return;

      // Create remote snake if missing
      if (!this.game.snakes[snakeId]) {
        const first = segments[0];
        const SnakeClass = Object.values(this.game.snakes)[0]?.constructor;

        if (!SnakeClass) {
          console.error("No local snake exists yet!");
          return;
        }

        this.game.snakes[snakeId] = new SnakeClass(
          first.x,
          first.y,
          snakeId,
          name || "Remote"
        );
      }

      this.game.snakes[snakeId].segments = segments;
    });
  }

  // Host a new session
  host(playerName) {
    return this.api.host().then((res) => {
      this.isHost = true;
      this.isConnectedToSession = true;
      this.sendSnake(playerName);
      return res.session;
    });
  }

  join(sessionId, playerName) {
    return this.api.join(sessionId, { name: playerName }).then((res) => {
      this.isConnectedToSession = true;
      this.sendSnake(playerName);
      return res.session;
    });
  }

  // Send local snake data every tick
  sendSnake(playerName = "Player") {
    const localSnake = Object.values(this.game.snakes)[0];
    if (!localSnake) return;

    this.api.game({
      snakeId: this.localSnakeId,
      segments: localSnake.segments,
      name: playerName,
    });
  }
}
