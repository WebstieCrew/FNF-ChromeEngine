class Main {
  constructor() {
    this.config = typeof projectConfig !== "undefined" ? projectConfig : {};
    this.container = null;
    this.canvas = null;
    this.ctx = null;

    this.lastTime = 0;
    this.deltaTime = 0;
    this.fps = 0;
    this.frameCount = 0;
    this.fpsTimer = 0;

    this.isRunning = false;
    this.isPaused = false;
    this.currentState = null;

    this.targetFPS = this.config.fps || 60;
    this.frameInterval = 1000 / this.targetFPS;
  }

  boot() {
    this.container = document.getElementById(this.config.parent || "game-container");
    if (!this.container) {
      this.container = document.body;
    }

    this.setupCanvas();
    this.setupEvents();
    
    this.isRunning = true;
    this.lastTime = performance.now();

    if (this.config.initialState && window[this.config.initialState]) {
      this.switchState(new window[this.config.initialState]());
    }

    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  setupCanvas() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.config.width || 1280;
    this.canvas.height = this.config.height || 720;

    this.ctx = this.canvas.getContext("2d", { alpha: false });
    this.ctx.imageSmoothingEnabled = false;

    this.container.appendChild(this.canvas);
    this.resize();
  }

  setupEvents() {
    window.addEventListener("resize", () => this.resize());

    document.addEventListener("visibilitychange", () => {
      this.isPaused = document.hidden;
      if (!document.hidden) {
        this.lastTime = performance.now();
      }
    });
  }

  resize() {
    if (!this.canvas) return;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const baseWidth = this.config.width || 1280;
    const baseHeight = this.config.height || 720;

    const scale = Math.min(windowWidth / baseWidth, windowHeight / baseHeight);

    this.canvas.style.width = `${baseWidth * scale}px`;
    this.canvas.style.height = `${baseHeight * scale}px`;
  }

  switchState(newState) {
    if (this.currentState && typeof this.currentState.destroy === "function") {
      this.currentState.destroy();
    }

    this.currentState = newState;

    if (this.currentState && typeof this.currentState.create === "function") {
      this.currentState.create(this);
    }
  }

  loop(timestamp) {
    if (!this.isRunning) return;

    requestAnimationFrame((t) => this.loop(t));

    if (this.isPaused) return;

    const elapsed = timestamp - this.lastTime;

    if (elapsed >= this.frameInterval) {
      this.deltaTime = elapsed / 1000;
      this.lastTime = timestamp - (elapsed % this.frameInterval);

      this.update(this.deltaTime);
      this.render();

      this.calculateFPS(elapsed);
    }
  }

  calculateFPS(elapsed) {
    this.frameCount++;
    this.fpsTimer += elapsed;

    if (this.fpsTimer >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer %= 1000;
    }
  }

  update(elapsed) {
    if (this.currentState && typeof this.currentState.update === "function") {
      this.currentState.update(elapsed);
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.currentState && typeof this.currentState.render === "function") {
      this.currentState.render(this.ctx);
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.game = new Main();
  window.game.boot();
});
