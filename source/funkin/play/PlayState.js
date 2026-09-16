class PlayState {
  constructor() {
    this.songName = "Bopeebo";
    this.difficulty = "Normal";

    this.score = 0;
    this.misses = 0;
    this.combo = 0;
    this.health = 50;

    this.songBpm = 100;
    this.songSpeed = 1.0;
    this.songPosition = 0;

    this.notes = [];
  }

  create(gameInstance) {
    this.game = gameInstance;
    this.loadSong(this.songName, this.difficulty);
  }

  loadSong(song, diff) {
    this.songName = song;
    this.difficulty = diff;
    this.score = 0;
    this.health = 50;
    this.songPosition = 0;
  }

  update(deltaTime) {
    if (this.game && !this.game.isPaused) {
      this.songPosition += deltaTime * 1000;
      this.updateNotes(deltaTime);
    }
  }

  updateNotes(deltaTime) {
    for (let i = this.notes.length - 1; i >= 0; i--) {
      const note = this.notes[i];
      if (note.strumTime <= this.songPosition) {
        this.noteHit(note);
        this.notes.splice(i, 1);
      }
    }
  }

  noteHit(note) {
    this.score += 350;
    this.combo += 1;
    this.health = Math.min(100, this.health + 2.3);
  }

  noteMiss() {
    this.combo = 0;
    this.misses += 1;
    this.health = Math.max(0, this.health - 4.75);

    if (this.health <= 0) {
      this.gameOver();
    }
  }

  gameOver() {
    if (typeof Highscore !== "undefined") {
      Highscore.saveScore(this.songName, this.score, this.difficulty);
    }
  }

  render(ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "24px Impact, Arial";
    ctx.fillText(`Song: ${this.songName} [${this.difficulty}]`, 20, 40);
    ctx.fillText(`Score: ${this.score} | Misses: ${this.misses} | Health: ${Math.round(this.health)}%`, 20, 70);
  }

  destroy() {
    this.notes = [];
  }
}

if (typeof window !== "undefined") {
  window.PlayState = PlayState;
}
