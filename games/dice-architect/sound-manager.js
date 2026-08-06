"use strict";

/* Reusable, failure-safe audio helper for Inky Paws games. */
class SoundManager {
  constructor({ basePath = "", sounds = {} } = {}) {
    this.sounds = new Map();

    Object.entries(sounds).forEach(([name, fileName]) => {
      const audio = new Audio(`${basePath}${fileName}`);
      audio.preload = "auto";
      audio.addEventListener("error", () => {
        this.sounds.delete(name);
      }, { once: true });
      this.sounds.set(name, audio);
    });
  }

  play(name) {
    const source = this.sounds.get(name);
    if (!source) return;

    try {
      const audio = source.cloneNode();
      const playback = audio.play();
      if (playback && typeof playback.catch === "function") {
        playback.catch(() => {});
      }
    } catch (_) {
      // Missing, unsupported, or blocked audio must never interrupt gameplay.
    }
  }
}

window.SoundManager = SoundManager;
