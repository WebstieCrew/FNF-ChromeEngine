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

    this.stage = null;
    this.playerStrumline = null;
    this.opponentStrumline = null;
    this.hitbox = null;

    this.notes = [];
    this.camera = { x: 0, y: 0, zoom: 1.0 };
  }

  async create(gameInstance) {
    this.game = gameInstance;

    this.stage = new Stage("stage");
    await this.stage.load();

    if (this.stage.config && this.stage.config.zoom) {
      this.camera.zoom = this.stage.config.zoom;
    }

    this.opponentStrumline = new Strumline(100, 50, false);
    this.playerStrumline = new Strumline(730, 50, true);

    if (typeof FunkinHitbox !== "undefined") {
      this.hitbox = new FunkinHitbox(this.playerStrumline);
    }

    this.setupInput();
    this.loadSong(this.songName, this.difficulty);
  }

  setupInput() {
    const keyMap = {
      ArrowLeft: 0, KeyA: 0,
      ArrowDown: 1, KeyS: 1,
      ArrowUp: 2,   KeyW: 2,
      ArrowRight: 3, KeyD: 3
    };

    window.addEventListener("keydown", (e) => {
      if (e.repeat) return;
      const noteData = keyMap[e.code];
      if (noteData !== undefined && this.playerStrumline) {
        this.playerStrumline.press(noteData);
        this.checkHit(noteData);
      }
    });

    window.addEventListener("keyup", (e) => {
      const noteData = keyMap[e.code];
      if (noteData !== undefined && this.playerStrumline) {
        this.playerStrumline.release(noteData);
      }
    });
  }

  loadSong(song, diff) {
    this.songName = song;
    this.difficulty = diff;
    this.score = 0;
    this.health = 50;
    this.songPosition = -2000;

    this.generateDummyNotes();
  }

  generateDummyNotes() {
    this.notes = [];
    const interval = 600;

    for (let i = 0; i < 40; i++) {
      const strumTime = i * interval;
      const noteData = i % 4;
      const isPlayerTarget = i % 2 === 0;
      const sustainLength = i % 5 === 0 ? 400 : 0;

      this.notes.push({
        strumTime: strumTime,
        noteData: noteData,
        isPlayerTarget: isPlayerTarget,
        sustainLength: sustainLength,
        wasHit: false
      });
    }
  }

  update(deltaTime) {
    if (this.game && !this.game.isPaused) {
      this.songPosition += deltaTime * 1000;

      if (this.stage) {
        this.stage.update(deltaTime);
      }

      if (this.playerStrumline) {
        this.playerStrumline.update(deltaTime);
      }

      if (this.opponentStrumline) {
        this.opponentStrumline.update(deltaTime);
      }

      if (this.hitbox) {
        this.hitbox.update(deltaTime);
      }

      this.updateNotes();
    }
  }

  checkHit(noteData) {
    const hitThreshold = 150;

    for (let i = 0; i < this.notes.length; i++) {
      const note = this.notes[i];

      if (note.isPlayerTarget && !note.wasHit && note.noteData === noteData) {
        const diff = Math.abs(note.strumTime - this.songPosition);

        if (diff <= hitThreshold) {
          note.wasHit = true;
          if (this.playerStrumline) {
            this.playerStrumline.confirm(noteData);
          }
          this.noteHit(note);
          break;
        }
      }
    }
  }

  updateNotes() {
    for (let i = this.notes.length - 1; i >= 0; i--) {
      const note = this.notes[i];

      if (!note.isPlayerTarget && !note.wasHit && note.strumTime <= this.songPosition) {
        note.wasHit = true;
        this.opponentStrumline.confirm(note.noteData);
        continue;
      }

      if (note.isPlayerTarget && !note.wasHit && this.songPosition - note.strumTime > 150) {
        this.noteMiss();
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
    ctx.save();
    ctx.scale(this.camera.zoom, this.camera.zoom);

    if (this.stage) {
      this.stage.render(ctx, this.camera.x, this.camera.y);
    }

    ctx.restore();

    if (this.hitbox && this.game) {
      this.hitbox.render(ctx, this.game.config.width || 1280, this.game.config.height || 720);
    }

    if (this.opponentStrumline) {
      this.opponentStrumline.render(ctx, this.notes, this.songPosition, this.songSpeed);
    }
    if (this.playerStrumline) {
      this.playerStrumline.render(ctx, this.notes, this.songPosition, this.songSpeed);
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = "24px Impact, Arial";
    ctx.fillText(`Song: ${this.songName} [${this.difficulty}]`, 20, 40);
    ctx.fillText(`Score: ${this.score} | Misses: ${this.misses} | Health: ${Math.round(this.health)}%`, 20, 70);
  }

  destroy() {
    if (this.hitbox) {
      this.hitbox.destroy();
      this.hitbox = null;
    }
    this.notes = [];
    this.stage = null;
  }
}

if (typeof window !== "undefined") {
  window.PlayState = PlayState;
}
