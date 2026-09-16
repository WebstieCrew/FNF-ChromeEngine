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
    this.receptors = [
      { dir: "left", state: "static", frame: "arrow static instance 10000" },
      { dir: "down", state: "static", frame: "arrow static instance 20000" },
      { dir: "up", state: "static", frame: "arrow static instance 30000" },
      { dir: "right", state: "static", frame: "arrow static instance 40000" }
    ];

    this.frames = {
      "arrow static instance 10000": { x: 488, y: 238, w: 155, h: 158 },
      "arrow static instance 20000": { x: 647, y: 238, w: 157, h: 155 },
      "arrow static instance 30000": { x: 808, y: 238, w: 155, h: 157 },
      "arrow static instance 40000": { x: 323, y: 240, w: 157, h: 154 },
      "purple instance 10000": { x: 0, y: 398, w: 154, h: 157 },
      "blue instance 10000": { x: 0, y: 240, w: 158, h: 154 },
      "green instance 10000": { x: 162, y: 240, w: 157, h: 154 },
      "red instance 10000": { x: 647, y: 397, w: 154, h: 157 },
      "left press instance 10002": { x: 1898, y: 150, w: 146, h: 149 },
      "down press instance 10002": { x: 1898, y: 0, w: 150, h: 146 },
      "up press instance 10002": { x: 158, y: 398, w: 154, h: 151 },
      "right press instance 10002": { x: 316, y: 398, w: 149, h: 152 },
      "left confirm instance 10000": { x: 972, y: 0, w: 230, h: 232 },
      "down confirm instance 10000": { x: 0, y: 0, w: 240, h: 236 },
      "up confirm instance 10000": { x: 488, y: 0, w: 238, h: 234 },
      "right confirm instance 10002": { x: 1206, y: 0, w: 228, h: 231 }
    };

    this.noteFrames = [
      "purple instance 10000",
      "blue instance 10000",
      "green instance 10000",
      "red instance 10000"
    ];
  }

  press(directionIndex) {
    if (this.receptors[directionIndex]) {
      const dir = this.directions[directionIndex];
      this.receptors[directionIndex].state = "press";
      this.receptors[directionIndex].frame = `${dir} press instance 10002`;
    }
  }

  confirm(directionIndex) {
    if (this.receptors[directionIndex]) {
      const dir = this.directions[directionIndex];
      const frameKey = dir === "right" ? `${dir} confirm instance 10002` : `${dir} confirm instance 10000`;
      this.receptors[directionIndex].state = "confirm";
      this.receptors[directionIndex].frame = frameKey;
    }
  }

  release(directionIndex) {
    if (this.receptors[directionIndex]) {
      const frameIndex = (directionIndex + 1) * 10000;
      this.receptors[directionIndex].state = "static";
      this.receptors[directionIndex].frame = `arrow static instance ${frameIndex}`;
    }
  }

  render(ctx, notes = [], songPosition = 0, scrollSpeed = 1.0) {
    if (!this.atlasLoaded) return;

    this.receptors.forEach((receptor, index) => {
      const frameData = this.frames[receptor.frame];
      if (frameData) {
        const rx = this.x + index * this.spacing;
        const ry = this.y;
        const rw = frameData.w * this.scale;
        const rh = frameData.h * this.scale;

        ctx.drawImage(
          this.image,
          frameData.x, frameData.y, frameData.w, frameData.h,
          rx, ry, rw, rh
        );
      }
    });

    notes.forEach((note) => {
      if (note.isPlayerTarget === this.isPlayer) {
        const distance = (note.strumTime - songPosition) * 0.45 * scrollSpeed;
        const noteX = this.x + note.noteData * this.spacing;
        const noteY = this.y + distance;

        const frameKey = this.noteFrames[note.noteData];
        const frameData = this.frames[frameKey];

        if (frameData && noteY > -100 && noteY < 800) {
          ctx.drawImage(
            this.image,
            frameData.x, frameData.y, frameData.w, frameData.h,
            noteX, noteY, frameData.w * this.scale, frameData.h * this.scale
          );
        }
      }
    });
  }
}

if (typeof window !== "undefined") {
  window.Strumline = Strumline;
}
