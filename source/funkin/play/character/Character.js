class Character {
  constructor(x = 0, y = 0, characterName = "bf", isPlayer = false) {
    this.x = x;
    this.y = y;
    this.characterName = characterName.toLowerCase();
    this.isPlayer = isPlayer;

    this.config = null;
    this.atlasLoaded = false;
    this.image = new Image();

    this.animations = new Map();
    this.currentAnim = null;
    this.currentFrameIndex = 0;
    this.animTimer = 0;
    this.animSpeed = 1 / 24;

    this.holdTimer = 0;
    this.isSinging = false;
    this.flipX = false;
  }

  async load() {
    try {
      const response = await fetch(`assets/data/characters/${this.characterName}.json`);
      if (!response.ok) throw new Error(`Character file not found: ${this.characterName}`);
      this.config = await response.json();

      this.flipX = this.config.flipX || false;
      if (this.config.position) {
        this.x += this.config.position[0] || 0;
        this.y += this.config.position[1] || 0;
      }

      await this.loadAtlas();
      this.parseAnimations();
      this.playAnim("idle", true);
    } catch (err) {
      this.atlasLoaded = false;
    }
  }

  async loadAtlas() {
    return new Promise((resolve) => {
      const imagePath = this.config.asset || `characters/${this.characterName}`;
      this.image.src = `assets/images/${imagePath}.png`;
      this.image.onload = () => {
        this.atlasLoaded = true;
        resolve();
      };
      this.image.onerror = () => resolve();
    });
  }

  parseAnimations() {
    if (!this.config || !this.config.animations) return;

    this.config.animations.forEach((anim) => {
      this.animations.set(anim.anim, {
        name: anim.anim,
        fps: anim.fps || 24,
        loop: anim.loop || false,
        indices: anim.indices || [],
        offsets: anim.offsets || [0, 0],
        frames: anim.frames || []
      });
    });
  }

  playAnim(animName, force = false) {
    if (!this.animations.has(animName)) return;
    if (this.currentAnim && this.currentAnim.name === animName && !force) return;

    this.currentAnim = this.animations.get(animName);
    this.currentFrameIndex = 0;
    this.animTimer = 0;
    this.animSpeed = 1 / (this.currentAnim.fps || 24);

    this.isSinging = animName.startsWith("sing");
    this.holdTimer = 0;
  }

  update(deltaTime) {
    if (!this.atlasLoaded || !this.currentAnim) return;

    if (this.isSinging) {
      this.holdTimer += deltaTime;
      if (this.holdTimer >= 0.8) {
        this.playAnim("idle");
      }
    }

    this.animTimer += deltaTime;
    if (this.animTimer >= this.animSpeed) {
      this.animTimer %= this.animSpeed;

      const frameCount = this.currentAnim.frames.length || this.currentAnim.indices.length || 1;
      if (this.currentFrameIndex < frameCount - 1) {
        this.currentFrameIndex++;
      } else if (this.currentAnim.loop) {
        this.currentFrameIndex = 0;
      }
    }
  }

  render(ctx, cameraX = 0, cameraY = 0) {
    if (!this.atlasLoaded || !this.currentAnim) return;

    const anim = this.currentAnim;
    const frameData = anim.frames[this.currentFrameIndex];
    if (!frameData) return;

    const offsetX = anim.offsets[0] || 0;
    const offsetY = anim.offsets[1] || 0;

    const renderX = this.x - cameraX - offsetX;
    const renderY = this.y - cameraY - offsetY;

    ctx.save();
    if (this.isPlayer !== this.flipX) {
      ctx.translate(renderX + frameData.w, renderY);
      ctx.scale(-1, 1);
      ctx.drawImage(
        this.image,
        frameData.x, frameData.y, frameData.w, frameData.h,
        0, 0, frameData.w, frameData.h
      );
    } else {
      ctx.drawImage(
        this.image,
        frameData.x, frameData.y, frameData.w, frameData.h,
        renderX, renderY, frameData.w, frameData.h
      );
    }
    ctx.restore();
  }
}

if (typeof window !== "undefined") {
  window.Character = Character;
}
