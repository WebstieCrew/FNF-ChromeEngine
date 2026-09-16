class FunkinHitbox {
  constructor(strumline) {
    this.strumline = strumline;
    this.hints = [];
    this.touchMap = new Map();

    this.colors = [
      "rgba(194, 75, 153, 0.2)",
      "rgba(0, 255, 255, 0.2)",
      "rgba(18, 200, 9, 0.2)",
      "rgba(249, 57, 63, 0.2)"
    ];

    this.activeColors = [
      "rgba(194, 75, 153, 0.5)",
      "rgba(0, 255, 255, 0.5)",
      "rgba(18, 200, 9, 0.5)",
      "rgba(249, 57, 63, 0.5)"
    ];

    this.activeLanes = [false, false, false, false];
    this.setupTouchListeners();
  }

  setupTouchListeners() {
    window.addEventListener("touchstart", (e) => this.handleTouchStart(e), { passive: false });
    window.addEventListener("touchmove", (e) => this.handleTouchMove(e), { passive: false });
    window.addEventListener("touchend", (e) => this.handleTouchEnd(e), { passive: false });
    window.addEventListener("touchcancel", (e) => this.handleTouchEnd(e), { passive: false });
  }

  getLaneIndex(clientX) {
    const screenWidth = window.innerWidth;
    const laneWidth = screenWidth / 4;
    return Math.floor(clientX / laneWidth);
  }

  handleTouchStart(event) {
    event.preventDefault();
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const lane = this.getLaneIndex(touch.clientX);
      
      if (lane >= 0 && lane < 4) {
        this.touchMap.set(touch.identifier, lane);
        this.pressLane(lane);
      }
    }
  }

  handleTouchMove(event) {
    event.preventDefault();
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const oldLane = this.touchMap.get(touch.identifier);
      const newLane = this.getLaneIndex(touch.clientX);

      if (oldLane !== undefined && oldLane !== newLane) {
        this.releaseLane(oldLane);
        if (newLane >= 0 && newLane < 4) {
          this.touchMap.set(touch.identifier, newLane);
          this.pressLane(newLane);
        } else {
          this.touchMap.delete(touch.identifier);
        }
      }
    }
  }

  handleTouchEnd(event) {
    event.preventDefault();
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const lane = this.touchMap.get(touch.identifier);

      if (lane !== undefined) {
        this.releaseLane(lane);
        this.touchMap.delete(touch.identifier);
      }
    }
  }

  pressLane(lane) {
    this.activeLanes[lane] = true;
    if (this.strumline) {
      this.strumline.press(lane);
    }
    if (window.game && window.game.currentState && typeof window.game.currentState.checkHit === "function") {
      window.game.currentState.checkHit(lane);
    }
  }

  releaseLane(lane) {
    this.activeLanes[lane] = false;
    if (this.strumline) {
      this.strumline.release(lane);
    }
  }

  update(deltaTime) {}

  render(ctx, width, height) {
    const laneWidth = width / 4;

    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = this.activeLanes[i] ? this.activeColors[i] : this.colors[i];
      ctx.fillRect(i * laneWidth, 0, laneWidth, height);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 2;
      ctx.strokeRect(i * laneWidth, 0, laneWidth, height);
    }
  }

  destroy() {
    this.touchMap.clear();
    this.activeLanes = [false, false, false, false];
  }
}

if (typeof window !== "undefined") {
  window.FunkinHitbox = FunkinHitbox;
}
