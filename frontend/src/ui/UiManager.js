export class UIManager {
  constructor(multiplayer) {
    this.multiplayer = multiplayer;

    const container = document.getElementById("uiControls");

    //! Create buttons and inputs
    this.hostButton = document.createElement("button");
    this.hostButton.textContent = "Host Game";
    container.appendChild(this.hostButton);

    this.joinInput = document.createElement("input");
    this.joinInput.placeholder = "Session ID";
    container.appendChild(this.joinInput);

    this.joinButton = document.createElement("button");
    this.joinButton.textContent = "Join Game";
    container.appendChild(this.joinButton);

    this.attachEvents();
  }

  attachEvents() {
    this.hostButton.addEventListener("click", async () => {
      const playerName = prompt("Enter your name", "Player");
      if (!playerName) return;

      try {
        const session = await this.multiplayer.host(playerName);
        console.log("HOSTED SESSION:", session);
        alert(`Session created: ${session}`);
      } catch (e) {
        console.error("Host failed:", e);
      }
    });

    this.joinButton.addEventListener("click", async () => {
      const sessionId = this.joinInput.value.trim();
      if (!sessionId) return alert("Enter a session ID");

      const playerName = prompt("Enter your name", "Player");
      if (!playerName) return;

      try {
        const session = await this.multiplayer.join(sessionId, playerName);
        console.log("JOINED SESSION:", session);
        alert(`Joined session: ${session}`);
      } catch (e) {
        console.error("Join failed:", e);
      }
    });
  }
}
