class Highscore {
  static songScores = new Map();
  static songRating = new Map();

  static formatSong(song, difficulty) {
    return `${song.toLowerCase()}-${difficulty.toLowerCase()}`;
  }

  static getScore(song, difficulty) {
    const key = this.formatSong(song, difficulty);
    return this.songScores.get(key) || 0;
  }

  static getRating(song, difficulty) {
    const key = this.formatSong(song, difficulty);
    return this.songRating.get(key) || 0;
  }

  static saveScore(song, score = 0, difficulty = "normal", rating = 0) {
    const key = this.formatSong(song, difficulty);
    
    if (score > this.getScore(song, difficulty)) {
      this.songScores.set(key, score);
      this.songRating.set(key, rating);
      this.saveToStorage();
    }
  }

  static saveToStorage() {
    const data = {
      scores: Object.fromEntries(this.songScores),
      ratings: Object.fromEntries(this.songRating)
    };
    localStorage.setItem("fnf_chrome_engine_scores", JSON.stringify(data));
  }

  static load() {
    const rawData = localStorage.getItem("fnf_chrome_engine_scores");
    if (!rawData) return;

    try {
      const data = JSON.parse(rawData);
      if (data.scores) {
        this.songScores = new Map(Object.entries(data.scores));
      }
      if (data.ratings) {
        this.songRating = new Map(Object.entries(data.ratings));
      }
    } catch (e) {
      console.error("Failed to load highscores:", e);
    }
  }
}

Highscore.load();
