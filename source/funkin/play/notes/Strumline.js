class Strumline {
  constructor(x = 100, y = 50, isPlayer = true) {
    this.x = x;
    this.y = y;
    this.isPlayer = isPlayer;
    this.spacing = 112;
    this.scale = 0.7;

    this.atlasLoaded = false;
    this.image = new Image();
    this.image.src = "assets/images/NOTE_assets.png";

    this.image.onload = () => {
      this.atlasLoaded = true;
    };

    this.directions = ["left", "down", "up", "right"];
    
    this.receptors = Array.from({ length: 4 }, (_, i) => ({
      dir: this.directions[i],
      state: "static",
      frame: `arrow static instance ${(i + 1) * 10000}`,
      animTimer: 0
    }));

    this.frames = new Map([
      ["arrow static instance 10000", { x: 488, y: 238, w: 155, h: 158, ox: 0, oy: 0 }],
      ["arrow static instance 20000", { x: 647, y: 238, w: 157, h: 155, ox: 0, oy: 0 }],
      ["arrow static instance 30000", { x: 808, y: 238, w: 155, h: 157, ox: 0, oy: 0 }],
      ["arrow static instance 40000", { x: 323, y: 240, w: 157, h: 154, ox: 0, oy: 0 }],

      ["purple instance 10000", { x: 0, y: 398, w: 154, h: 157, ox: 0, oy: 0 }],
      ["blue instance 10000", { x: 0, y: 240, w: 158, h: 154, ox: 0, oy: 0 }],
      ["green instance 10000", { x: 162, y: 240, w: 157, h: 154, ox: 0, oy: 0 }],
      ["red instance 10000", { x: 647, y: 397, w: 154, h: 157, ox: 0, oy: 0 }],

      ["purple hold piece instance 10000", { x: 1337, y: 457, w: 51, h: 44, ox: 0, oy: 0 }],
      ["blue hold piece instance 10000", { x: 1282, y: 457, w: 51, h: 44, ox: 0, oy: 0 }],
      ["green hold piece instance 10000", { x: 1227, y: 457, w: 51, h: 44, ox: 0, oy: 0 }],
      ["red hold piece instance 10000", { x: 1172, y: 457, w: 51, h: 44, ox: 0, oy: 0 }],

      ["pruple end hold instance 10000", { x: 1117, y: 452, w: 51, h: 64, ox: 0, oy: 0 }],
      ["blue hold end instance 10000", { x: 1062, y: 452, w: 51, h: 64, ox: 0, oy: 0 }],
      ["green hold end instance 10000", { x: 1007, y: 452, w: 51, h: 64, ox: 0, oy: 0 }],
      ["red hold end instance 10000", { x: 952, y: 452, w: 51, h: 64, ox: 0, oy: 0 }],

      ["left press instance 10002", { x: 1898, y: 150, w: 146, h: 149, ox: -4, oy: -4 }],
      ["down press instance 10002", { x: 1898, y: 0, w: 150, h: 146, ox: -4, oy: -4 }],
      ["up press instance 10002", { x: 158, y: 398, w: 154, h: 151, ox: -2, oy: -3 }],
      ["right press instance 10002", { x: 316, y: 398, w: 149, h: 152, ox: -4, oy: -1 }],

      ["left confirm instance 10000", { x: 972, y: 0, w: 230, h: 232, ox: -36, oy: -37 }],
      ["down confirm instance 10000", { x: 0, y: 0, w: 240, h: 236, ox: -41, oy: -40 }],
      ["up confirm instance 10000", { x: 488, y: 0, w: 238, h: 234, ox: -41, oy: -38 }],
      ["right confirm instance 10002", { x: 1206, y: 0, w: 228, h: 231, ox: -35, oy: -38 }]
    ]);

    this.noteTypes = [
      { note: "purple instance 10000", hold: "purple hold piece instance 10000", end: "pruple end hold instance 10000" },
      { note: "blue instance 10000", hold: "blue hold piece instance 10000", end: "blue hold end instance 10000" },
      { note: "green instance 10000", hold: "green hold piece instance 10000", end: "green hold end instance 10000" },
      { note: "red instance 10000", hold: "red hold piece instance 10000", end: "red hold end instance 10000" }
    ];
  }

  press(directionIndex) {
    const receptor = this.receptors[directionIndex];
    if (receptor) {
      receptor.state = "press";
      receptor.frame = `${this.directions[directionIndex]} press instance 10002`;
      receptor.animTimer = 0;
    }
  }

  confirm(directionIndex) {
    const receptor = this.receptors[directionIndex];
    if (receptor) {
      const dir = this.directions[directionIndex];
      receptor.state = "confirm";
      receptor.frame = dir === "right" ? `${dir} confirm instance 10002` : `${dir} confirm instance 10000`;
      receptor.animTimer = 0.15;
    }
  }

  release(directionIndex) {
    const receptor = this.receptors[directionIndex];
    if (receptor) {
      receptor.state = "static";
      receptor.frame = `arrow static instance ${(directionIndex + 1) * 10000}`;
      receptor.animTimer = 0;
    }
  }

  update(deltaTime) {
    this.receptors.forEach((receptor, index) => {
      if (receptor.state === "confirm" && receptor.animTimer > 0) {
        receptor.animTimer -= deltaTime;
        if (receptor.animTimer <= 0) {
          this.release(index);
        }
      }
    });
  }

  render(ctx, notes = [], songPosition = 0, scrollSpeed = 1.0, downscroll = false) {
    if (!this.atlasLoaded) return;

    const scrollDir = downscroll ? -1 : 1;

    for (let i = 0; i < 4; i++) {
      const receptor = this.receptors[i];
      const frameData = this.frames.get(receptor.frame);
      if (frameData) {
        const laneX = this.x + i * this.spacing;
        const rx = laneX + frameData.ox * this.scale;
        const ry = this.y + frameData.oy * this.scale;

        ctx.drawImage(
          this.image,
          frameData.x, frameData.y, frameData.w, frameData.h,
          rx, ry, frameData.w * this.scale, frameData.h * this.scale
        );
      }
    }

    const noteCount = notes.length;
    for (let i = 0; i < noteCount; i++) {
      const note = notes[i];
      if (note.isPlayerTarget !== this.isPlayer || note.wasHit) continue;

      const laneX = this.x + note.noteData * this.spacing;
      const distance = (note.strumTime - songPosition) * 0.45 * scrollSpeed * scrollDir;
      const noteY = this.y + distance;

      if (noteY < -200 || noteY > 1000) continue;

      const type = this.noteTypes[note.noteData];

      if (note.sustainLength && note.sustainLength > 0) {
        const holdHeight = (note.sustainLength * 0.45 * scrollSpeed);
        const holdData = this.frames.get(type.hold);
        const endData = this.frames.get(type.end);

        if (holdData && endData) {
          const holdX = laneX + (154 * this.scale - holdData.w * this.scale) / 2;
          const endY = downscroll ? noteY - holdHeight : noteY + holdHeight;

          ctx.drawImage(
            this.image,
            holdData.x, holdData.y, holdData.w, holdData.h,
            holdX, downscroll ? endY : noteY, holdData.w * this.scale, holdHeight
          );

          ctx.drawImage(
            this.image,
            endData.x, endData.y, endData.w, endData.h,
            holdX, endY, endData.w * this.scale, endData.h * this.scale
          );
        }
      }

      const noteData = this.frames.get(type.note);
      if (noteData) {
        const nx = laneX + noteData.ox * this.scale;
        const ny = noteY + noteData.oy * this.scale;

        ctx.drawImage(
          this.image,
          noteData.x, noteData.y, noteData.w, noteData.h,
          nx, ny, noteData.w * this.scale, noteData.h * this.scale
        );
      }
    }
  }
}

if (typeof window !== "undefined") {
  window.Strumline = Strumline;
}
