class Song {
  constructor(songName = "Bopeebo") {
    this.songName = songName.toLowerCase();
    this.inst = null;
    this.voices = null;
    this.voicesBf = null;
    this.voicesDad = null;

    this.isLoaded = false;
    this.isPlaying = false;
    this.time = 0;
    this.format = this.getSupportedFormat();
  }

  getSupportedFormat() {
    const audio = new Audio();
    return audio.canPlayType("audio/ogg") ? "ogg" : "mp3";
  }

  async load() {
    const path = `assets/songs/${this.songName}`;

    const loadAudio = (fileName) => {
      return new Promise((resolve) => {
        const audio = new Audio(`${path}/${fileName}.${this.format}`);
        audio.oncanplaythrough = () => resolve(audio);
        audio.onerror = () => resolve(null);
      });
    };

    const [inst, voices, voicesBf, voicesDad] = await Promise.all([
      loadAudio("Inst"),
      loadAudio("Voices"),
      loadAudio("Voices-bf"),
      loadAudio("Voices-dad")
    ]);

    this.inst = inst;
    this.voices = voices;
    this.voicesBf = voicesBf;
    this.voicesDad = voicesDad;

    this.isLoaded = true;
  }

  play() {
    if (!this.isLoaded) return;

    if (this.inst) this.inst.play();
    if (this.voices) this.voices.play();
    if (this.voicesBf) this.voicesBf.play();
    if (this.voicesDad) this.voicesDad.play();

    this.isPlaying = true;
  }

  pause() {
    if (this.inst) this.inst.pause();
    if (this.voices) this.voices.pause();
    if (this.voicesBf) this.voicesBf.pause();
    if (this.voicesDad) this.voicesDad.pause();

    this.isPlaying = false;
  }

  sync() {
    if (!this.inst) return;
    const currentTime = this.inst.currentTime;

    if (this.voices && Math.abs(this.voices.currentTime - currentTime) > 0.05) {
      this.voices.currentTime = currentTime;
    }
    if (this.voicesBf && Math.abs(this.voicesBf.currentTime - currentTime) > 0.05) {
      this.voicesBf.currentTime = currentTime;
    }
    if (this.voicesDad && Math.abs(this.voicesDad.currentTime - currentTime) > 0.05) {
      this.voicesDad.currentTime = currentTime;
    }

    this.time = currentTime * 1000;
  }

  setVolume(type, volume) {
    if (this[type]) {
      this[type].volume = Math.max(0, Math.min(1, volume));
    }
  }

  destroy() {
    this.pause();
    this.inst = null;
    this.voices = null;
    this.voicesBf = null;
    this.voicesDad = null;
  }
}

if (typeof window !== "undefined") {
  window.Song = Song;
}
