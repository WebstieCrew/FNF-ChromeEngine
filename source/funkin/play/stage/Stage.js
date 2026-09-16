class Stage {
  constructor(stageName = "stage") {
    this.stageName = stageName;
    this.config = null;
    this.sprites = [];
    this.isLoaded = false;
    
    this.defaultCamZoom = 1.0;
    this.boyfriendPosition = { x: 770, y: 100 };
    this.dadPosition = { x: 100, y: 100 };
    this.gfPosition = { x: 400, y: 130 };
  }

  async load() {
    try {
      const response = await fetch(`assets/data/stages/${this.stageName}.json`);
      if (!response.ok) throw new Error(`Stage file not found: ${this.stageName}`);
      this.config = await response.json();
      this.parseConfig();
      await this.loadSprites();
      this.isLoaded = true;
    } catch (err) {
      this.fallbackStage();
    }
  }

  parseConfig() {
    if (!this.config) return;

    this.defaultCamZoom = this.config.zoom || 0.9;

    if (this.config.boyfriend) {
      this.boyfriendPosition = { x: this.config.boyfriend[0], y: this.config.boyfriend[1] };
    }
    if (this.config.opponent || this.config.dad) {
      const dad = this.config.opponent || this.config.dad;
      this.dadPosition = { x: dad[0], y: dad[1] };
    }
    if (this.config.gf) {
      this.gfPosition = { x: this.config.gf[0], y: this.config.gf[1] };
    }
  }

  async loadSprites() {
    if (!this.config || !Array.from(this.config.sprites || []).length) return;

    const loadPromises = this.config.sprites.map((data) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = `assets/images/${data.image}.png`;
        img.onload = () => {
          this.sprites.push({
            img: img,
            x: data.x || 0,
            y: data.y || 0,
            scrollFactorX: data.scrollX ?? 1.0,
            scrollFactorY: data.scrollY ?? 1.0,
            scaleX: data.scaleX ?? (data.scale || 1.0),
            scaleY: data.scaleY ?? (data.scale || 1.0),
            zIndex: data.zIndex || 0
          });
          resolve();
        };
        img.onerror = () => resolve();
      });
    });

    await Promise.all(loadPromises);
    this.sprites.sort((a, b) => a.zIndex - b.zIndex);
  }

  fallbackStage() {
    this.config = { zoom: 0.9 };
    this.isLoaded = true;
  }

  update(deltaTime) {}

  render(ctx, cameraX = 0, cameraY = 0) {
    if (!this.isLoaded) return;

    for (let i = 0; i < this.sprites.length; i++) {
      const sprite = this.sprites[i];
      const renderX = sprite.x - cameraX * sprite.scrollFactorX;
      const renderY = sprite.y - cameraY * sprite.scrollFactorY;
      const renderWidth = sprite.img.width * sprite.scaleX;
      const renderHeight = sprite.img.height * sprite.scaleY;

      ctx.drawImage(sprite.img, renderX, renderY, renderWidth, renderHeight);
    }
  }
}

if (typeof window !== "undefined") {
  window.Stage = Stage;
}
