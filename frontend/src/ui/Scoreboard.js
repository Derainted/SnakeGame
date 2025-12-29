//TODO localStorage

export class Scoreboard {
  constructor(storageKey = "snake_scoreboard") {
    this.storageKey = storageKey;
    this.scores = this.load();
  }

  load() {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) : [];
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
  }

  add(name, score) {
    const existing = this.scores.find((entry) => entry.name === name);

    if (!existing) {
      this.scores.push({ name, score });
    } else if (score > existing.score) {
      existing.score = score;
    }

    this.sort();
    this.save();
  }

  sort() {
    this.scores.sort((a, b) => b.score - a.score);
  }

  getAll() {
    return [...this.scores];
  }
}
