(function () {
  const T = window.T;

  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.musicGain = null;
      this.sfxGain = null;
      this.enabled = true;
      this.musicEnabled = true;
      this.musicTimer = 0;
      this.musicStep = 0;
      this.currentTrack = null;
      this.trackStart = 0;
      this.noiseBuffer = null;
      this.lastPlay = {};
    }

    init() {
      if (this.ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { this.enabled = false; return; }
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.6;
      this.master.connect(this.ctx.destination);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.7;
      this.sfxGain.connect(this.master);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.22;
      this.musicGain.connect(this.master);
      const len = this.ctx.sampleRate * 0.5;
      this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }

    now() { return this.ctx.currentTime; }

    throttle(key, ms) {
      const t = performance.now();
      if (this.lastPlay[key] && t - this.lastPlay[key] < ms) return false;
      this.lastPlay[key] = t;
      return true;
    }

    tone(freq, dur, o) {
      if (!this.ctx || !this.enabled) return;
      o = o || {};
      const t = this.now() + (o.delay || 0);
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = o.type || 'square';
      osc.frequency.setValueAtTime(freq, t);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + dur);
      if (o.detune) osc.detune.value = o.detune;
      const vol = (o.vol === undefined ? 0.2 : o.vol);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + (o.attack || 0.008));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g);
      let node = g;
      if (o.filter) {
        const f = this.ctx.createBiquadFilter();
        f.type = o.filter;
        f.frequency.value = o.filterFreq || 800;
        g.connect(f);
        node = f;
      }
      node.connect(o.music ? this.musicGain : this.sfxGain);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    }

    noise(dur, o) {
      if (!this.ctx || !this.enabled) return;
      o = o || {};
      const t = this.now() + (o.delay || 0);
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      src.loop = true;
      const g = this.ctx.createGain();
      const f = this.ctx.createBiquadFilter();
      f.type = o.filter || 'bandpass';
      f.frequency.setValueAtTime(o.freq || 1200, t);
      if (o.to) f.frequency.exponentialRampToValueAtTime(Math.max(60, o.to), t + dur);
      f.Q.value = o.q || 0.9;
      const vol = o.vol === undefined ? 0.25 : o.vol;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + (o.attack || 0.005));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f);
      f.connect(g);
      g.connect(o.music ? this.musicGain : this.sfxGain);
      src.start(t);
      src.stop(t + dur + 0.03);
    }

    play(name, arg) {
      if (!this.ctx || !this.enabled) return;
      switch (name) {
        case 'dig':
          if (!this.throttle('dig', 55)) return;
          this.noise(0.07, { vol: 0.16, freq: 700 + Math.random() * 500, to: 300, filter: 'bandpass' });
          this.tone(90 + Math.random() * 30, 0.05, { vol: 0.06, type: 'triangle', to: 50 });
          break;
        case 'break':
          this.noise(0.18, { vol: 0.3, freq: 1400, to: 220, filter: 'lowpass', q: 0.7 });
          this.tone(120, 0.12, { vol: 0.12, type: 'square', to: 45 });
          break;
        case 'hit':
          if (!this.throttle('hit', 30)) return;
          this.noise(0.09, { vol: 0.3, freq: 2200, to: 500 });
          this.tone(220, 0.07, { vol: 0.14, type: 'square', to: 90 });
          break;
        case 'swing':
          if (!this.throttle('swing', 40)) return;
          this.noise(0.13, { vol: 0.18, freq: 900, to: 2600, filter: 'bandpass', q: 1.6 });
          break;
        case 'shoot':
          this.tone(720, 0.1, { vol: 0.12, type: 'square', to: 260 });
          this.noise(0.07, { vol: 0.12, freq: 3000, to: 900 });
          break;
        case 'bow':
          this.noise(0.12, { vol: 0.16, freq: 1800, to: 600, filter: 'highpass' });
          this.tone(300, 0.08, { vol: 0.08, type: 'triangle', to: 120 });
          break;
        case 'magic':
          this.tone(520, 0.22, { vol: 0.11, type: 'sine', to: 1100 });
          this.tone(780, 0.18, { vol: 0.06, type: 'triangle', to: 1500, delay: 0.02 });
          break;
        case 'jump':
          this.tone(240, 0.14, { vol: 0.1, type: 'square', to: 420 });
          break;
        case 'land':
          if (!this.throttle('land', 70)) return;
          this.noise(0.09, { vol: 0.2, freq: 500, to: 120, filter: 'lowpass' });
          break;
        case 'hurt':
          this.tone(180, 0.2, { vol: 0.2, type: 'sawtooth', to: 60 });
          this.noise(0.16, { vol: 0.2, freq: 900, to: 200 });
          break;
        case 'kill':
          this.noise(0.22, { vol: 0.24, freq: 1200, to: 120, filter: 'lowpass' });
          this.tone(140, 0.2, { vol: 0.12, type: 'square', to: 40 });
          break;
        case 'pickup':
          if (!this.throttle('pickup', 45)) return;
          this.tone(880, 0.07, { vol: 0.09, type: 'triangle', to: 1320 });
          break;
        case 'coin':
          this.tone(1180, 0.09, { vol: 0.09, type: 'triangle' });
          this.tone(1760, 0.1, { vol: 0.06, type: 'triangle', delay: 0.05 });
          break;
        case 'craft':
          this.tone(520, 0.1, { vol: 0.1, type: 'triangle' });
          this.tone(780, 0.1, { vol: 0.1, type: 'triangle', delay: 0.07 });
          this.tone(1040, 0.16, { vol: 0.08, type: 'triangle', delay: 0.14 });
          break;
        case 'potion':
          this.tone(420, 0.18, { vol: 0.1, type: 'sine', to: 900 });
          this.tone(670, 0.22, { vol: 0.07, type: 'sine', to: 1300, delay: 0.08 });
          break;
        case 'menu':
          this.tone(660, 0.05, { vol: 0.07, type: 'triangle' });
          break;
        case 'boss':
          this.tone(80, 1.4, { vol: 0.3, type: 'sawtooth', to: 40 });
          this.tone(120, 1.1, { vol: 0.18, type: 'square', to: 60, delay: 0.15 });
          this.noise(1.0, { vol: 0.16, freq: 300, to: 80, filter: 'lowpass' });
          break;
        case 'bossdie':
          this.noise(1.2, { vol: 0.3, freq: 900, to: 60, filter: 'lowpass' });
          this.tone(200, 1.0, { vol: 0.2, type: 'sawtooth', to: 30 });
          break;
        case 'splash':
          if (!this.throttle('splash', 120)) return;
          this.noise(0.2, { vol: 0.16, freq: 1600, to: 400, filter: 'bandpass' });
          break;
        case 'explode':
          this.noise(0.5, { vol: 0.4, freq: 700, to: 60, filter: 'lowpass' });
          this.tone(90, 0.4, { vol: 0.2, type: 'sawtooth', to: 30 });
          break;
        case 'door':
          this.tone(300, 0.08, { vol: 0.08, type: 'square', to: 200 });
          break;
        case 'blip':
          this.tone(520 + Math.random() * 60, 0.035, { vol: 0.04, type: 'square' });
          break;
        case 'dig_surface':
          if (!this.throttle('digs', 70)) return;
          this.noise(0.05, { vol: 0.1, freq: 500 + Math.random() * 300, to: 250, filter: 'bandpass' });
          break;
        case 'death':
          this.tone(300, 0.9, { vol: 0.2, type: 'sawtooth', to: 50 });
          this.tone(220, 1.0, { vol: 0.14, type: 'square', to: 40, delay: 0.1 });
          break;
        case 'levelup':
          [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.2, { vol: 0.1, type: 'triangle', delay: i * 0.09 }));
          break;
        case 'chest':
          this.tone(260, 0.1, { vol: 0.1, type: 'square', to: 180 });
          this.tone(420, 0.12, { vol: 0.08, type: 'triangle', delay: 0.08 });
          break;
        case 'thunder':
          this.noise(1.6, { vol: 0.34, freq: 420, to: 60, filter: 'lowpass', q: 0.6 });
          this.tone(52, 1.5, { vol: 0.16, type: 'sawtooth', to: 26, delay: 0.1 });
          break;
        case 'summon':
          this.tone(620, 0.4, { vol: 0.12, type: 'sine', to: 1240 });
          this.noise(0.35, { vol: 0.1, freq: 2000, to: 600 });
          break;
        default:
          break;
      }
    }

    setMusicEnabled(v) {
      this.musicEnabled = v;
      if (this.musicGain) this.musicGain.gain.value = v ? 0.22 : 0;
    }
    setSfxEnabled(v) {
      this.enabled = v;
      if (this.sfxGain) this.sfxGain.gain.value = v ? 0.7 : 0;
    }

    musicFor(game) {
      if (game.boss) return 'boss';
      const p = game.player;
      const tx = Math.floor(p.x / T.TS);
      const ty = Math.floor(p.y / T.TS);
      const surface = game.world.surface[T.clamp(tx, 0, game.world.W - 1)];
      const surfaceDist = ty - surface;
      const biome = game.world.biomeAt(tx, ty);
      if (surfaceDist > 520) return 'hell';
      if (surfaceDist > 90) return 'underground';
      if (biome === '腐化之地') return 'corruption';
      if (biome === '丛林' && surfaceDist > 2) return 'jungle';
      if (surfaceDist > 8) return 'underground';
      if (biome === '雪原') return 'snow';
      if (biome === '沙漠') return 'desert';
      if (biome === '地狱') return 'hell';
      if (game.isNight()) return 'night';
      return 'day';
    }

    updateMusic(game, dt) {
      if (!this.ctx) return;
      const track = this.musicFor(game);
      if (track !== this.currentTrack) {
        this.currentTrack = track;
        this.musicStep = 0;
        this.musicTimer = 0.35;
      }
      if (!this.musicEnabled) return;
      this.musicTimer -= dt;
      if (this.musicTimer > 0) return;
      this.musicTimer = 0.24;
      const step = this.musicStep++;
      const scales = {
        day: [392, 440, 494, 587, 659, 784, 880, 988],
        night: [220, 262, 294, 330, 392, 440, 494, 523],
        underground: [196, 233, 262, 294, 311, 392, 440, 466],
        hell: [131, 156, 175, 196, 233, 262, 311, 349],
        boss: [147, 165, 175, 196, 220, 233, 262, 294],
        snow: [349, 392, 440, 523, 587, 698, 784, 880],
        desert: [294, 330, 349, 392, 440, 494, 523, 587],
        corruption: [139, 156, 165, 185, 208, 233, 247, 262],
        jungle: [247, 277, 294, 330, 370, 415, 440, 494]
      };
      const scale = scales[track] || scales.day;
      const patterns = {
        day: [0, 2, 4, 2, 5, 4, 2, 0, 3, 5, 7, 5, 4, 2, 1, 0],
        night: [0, 3, 5, 3, 1, 4, 6, 4, 2, 5, 7, 5, 3, 1, 0, 2],
        underground: [0, 2, 1, 3, 0, 4, 2, 1, 5, 3, 2, 0, 4, 1, 3, 2],
        hell: [0, 1, 2, 1, 3, 2, 1, 0, 4, 3, 2, 1, 3, 2, 4, 3],
        boss: [0, 0, 1, 0, 2, 1, 0, 3, 0, 0, 2, 1, 4, 3, 2, 1],
        snow: [0, 4, 2, 5, 3, 7, 5, 4, 2, 3, 5, 4, 6, 4, 2, 0],
        desert: [0, 2, 3, 2, 4, 3, 2, 0, 5, 4, 3, 2, 1, 3, 2, 0],
        corruption: [0, 1, 3, 1, 0, 2, 4, 2, 1, 3, 5, 3, 2, 0, 1, 0],
        jungle: [0, 2, 4, 3, 5, 3, 4, 2, 0, 3, 5, 6, 4, 2, 3, 1]
      };
      const pat = patterns[track] || patterns.day;
      const idx = pat[step % pat.length];
      const freq = scale[idx % scale.length] * (track === 'boss' ? 1 : 1);
      if (step % 4 === 0 || track === 'boss') {
        this.tone(freq, track === 'boss' ? 0.22 : 0.55, {
          vol: track === 'boss' ? 0.1 : 0.08, type: track === 'hell' ? 'triangle' : 'sine', music: true,
          attack: 0.02
        });
        this.tone(freq / 2, track === 'boss' ? 0.2 : 0.5, { vol: 0.05, type: 'sine', music: true, attack: 0.02 });
      }
      if (step % 8 === 0) {
        this.tone(scale[0] / (track === 'boss' ? 2 : 3), 1.2, { vol: 0.06, type: 'triangle', music: true, attack: 0.05 });
      }
      if (track === 'boss' && step % 2 === 0) {
        this.noise(0.06, { vol: 0.05, freq: 250, filter: 'lowpass', music: true });
      }
    }
  }

  T.AudioEngine = AudioEngine;
  T.audio = new AudioEngine();
})();
