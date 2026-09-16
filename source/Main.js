class Main {
  constructor() {
    this.config = projectConfig;
    this.container = document.getElementById(this.config.parent);
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.lastTime = 0;
    this.isRunning = false;
  }

  init() {
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;
    this.container.appendChild(this.canvas);

    window.addEventListener("resize", () => this.resize());
    this.resize();

    this.isRunning = true;
    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  resize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const scale = Math.min(
      windowWidth / this.config.width,
      windowHeight / this.config.height
    );

    this.canvas.style.width = `${this.config.width * scale}px`;
    this.canvas.style.height = `${this.config.height * scale}px`;
  }

  loop(timestamp) {
    if (!this.isRunning) return;

    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(deltaTime) {}

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const game = new Main();
  game.init();
});
