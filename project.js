const projectConfig = {
  title: "FNF: Chrome Engine",
  version: "1.0.0",
  width: 1280,
  height: 720,
  fps: 60,
  parent: "game-container",
  initialState: "BootState",
  assets: {
    basePath: "assets/",
    imagesPath: "assets/images/",
    audioPath: "assets/audio/",
    dataPath: "assets/data/"
  }
};

class ProjectManager {
  constructor(config) {
    this.config = config;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    this.setupWindow();
    this.isInitialized = true;
  }

  setupWindow() {
    document.title = this.config.title;
  }

  getConfig() {
    return this.config;
  }
}

const app = new ProjectManager(projectConfig);
window.addEventListener("DOMContentLoaded", () => {
  app.init();
});
