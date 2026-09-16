class FunkinHitbox {
  constructor(strumline) {
    this.strumline = strumline;
    this.touchMap = new Map();

    this.colors = [
      "rgba(194, 75, 153, 0.35)",
      "rgba(0, 255, 255, 0.35)",
      "rgba(18, 200, 9, 0.35)",
      "rgba(249, 57, 63, 0.35)"
    ];

    this.activeColors = [
      "rgba(194, 75, 153, 0.7)",
      "rgba(0, 255, 255, 0.7)",
      "rgba(18, 200, 9, 0.7)",
      "rgba(249, 57, 63, 0.7)"
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

  getLaneIndex(clientX, clientY) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const hitboxTop = screenHeight * 0.7;

    if (clientY < hitboxTop) return -1;

    const laneWidth = screenWidth / 4;
    return Math.floor(clientX / laneWidth);
  }

  handleTouchStart(event) {
    event.preventDefault();
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const lane = this.getLaneIndex(touch.clientX, touch.clientY);

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
      const newLane = this.getLaneIndex(touch.clientX, touch.clientY);

      if (oldLane !== undefined && oldLane !== newLane) {
        if (oldLane !== -1) this.releaseLane(oldLane);
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

      if (lane !== undefined && lane !== -1) {
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
    const hitboxHeight = height * 0.3;
    const hitboxTop = height * 0.7;

    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = this.activeLanes[i] ? this.activeColors[i] : this.colors[i];
      ctx.fillRect(i * laneWidth, hitboxTop, laneWidth, hitboxHeight);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 3;
      ctx.strokeRect(i * laneWidth, hitboxTop, laneWidth, hitboxHeight);
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
