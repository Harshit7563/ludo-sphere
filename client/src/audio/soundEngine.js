const STORAGE_KEY = 'ludo_sound_enabled';

/** @typedef {'diceRoll'|'diceLand'|'tokenHop'|'capture'|'turnMine'|'turnOther'|'gameStart'|'win'|'lose'|'ready'|'uiTap'|'chat'|'emoji'} SoundId */

class SoundEngine {
  constructor() {
    this.enabled = localStorage.getItem(STORAGE_KEY) !== '0';
    this.ctx = null;
    this.master = null;
    this.compressor = null;
    this.reverbSend = null;
    this.unlocked = false;
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(on) {
    this.enabled = !!on;
    localStorage.setItem(STORAGE_KEY, on ? '1' : '0');
  }

  toggle() {
    this.setEnabled(!this.enabled);
    if (this.enabled) this.play('uiTap', { volume: 0.35 });
    return this.enabled;
  }

  unlock() {
    if (this.unlocked) return;
    this.ensureCtx();
    this.unlocked = true;
  }

  ensureCtx() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();

      this.master = this.ctx.createGain();
      this.master.gain.value = 0.82;

      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-22, 0);
      this.compressor.knee.setValueAtTime(18, 0);
      this.compressor.ratio.setValueAtTime(3.2, 0);
      this.compressor.attack.setValueAtTime(0.004, 0);
      this.compressor.release.setValueAtTime(0.18, 0);

      this.reverbSend = this.ctx.createGain();
      this.reverbSend.gain.value = 0.22;

      const delayL = this.ctx.createDelay(0.5);
      const delayR = this.ctx.createDelay(0.55);
      delayL.delayTime.value = 0.038;
      delayR.delayTime.value = 0.052;
      const fbL = this.ctx.createGain();
      const fbR = this.ctx.createGain();
      fbL.gain.value = 0.28;
      fbR.gain.value = 0.24;
      delayL.connect(fbL);
      fbL.connect(delayL);
      delayR.connect(fbR);
      fbR.connect(delayR);
      delayL.connect(this.reverbSend);
      delayR.connect(this.reverbSend);

      this.compressor.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.reverbSend.connect(this.compressor);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  now() {
    return this.ctx?.currentTime ?? 0;
  }

  /** @param {number} t */
  connectOut(nodes, t, dry = 0.88, wet = 0.12) {
    const ctx = this.ctx;
    const dryGain = ctx.createGain();
    const wetGain = ctx.createGain();
    dryGain.gain.setValueAtTime(dry, t);
    wetGain.gain.setValueAtTime(wet, t);
    nodes.forEach((n) => {
      n.connect(dryGain);
      n.connect(wetGain);
    });
    dryGain.connect(this.compressor);
    wetGain.connect(this.reverbSend);
  }

  tone(freq, start, dur, opts = {}) {
    const ctx = this.ctx;
    const {
      type = 'sine',
      volume = 0.12,
      attack = 0.012,
      release = 0.14,
      detune = 0,
      pan = 0,
    } = opts;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (detune) osc.detune.setValueAtTime(detune, start);
    panner.pan.setValueAtTime(pan, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(panner);
    osc.start(start);
    osc.stop(start + dur + release);
    return [panner];
  }

  noise(start, dur, opts = {}) {
    const ctx = this.ctx;
    const { volume = 0.08, filterFreq = 2200, type = 'bandpass' } = opts;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = type;
    filt.frequency.setValueAtTime(filterFreq, start);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(filt);
    filt.connect(gain);
    src.start(start);
    src.stop(start + dur + 0.02);
    return [gain];
  }

  /** @param {SoundId} id */
  play(id, opts = {}) {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t0 = this.now() + 0.001;
    const vol = opts.volume ?? 1;

    switch (id) {
      case 'uiTap':
        this.connectOut(
          [
            ...this.tone(880, t0, 0.06, { volume: 0.06 * vol, type: 'triangle' }),
            ...this.tone(1320, t0 + 0.018, 0.05, { volume: 0.04 * vol, type: 'sine' }),
          ],
          t0,
        );
        break;

      case 'diceRoll': {
        const nodes = [];
        for (let i = 0; i < 9; i++) {
          const t = t0 + i * 0.055;
          nodes.push(
            ...this.noise(t, 0.04 + Math.random() * 0.02, {
              volume: (0.05 + i * 0.008) * vol,
              filterFreq: 1800 + i * 180,
            }),
          );
          nodes.push(
            ...this.tone(200 + i * 35, t, 0.03, {
              volume: 0.03 * vol,
              type: 'square',
              attack: 0.002,
            }),
          );
        }
        this.connectOut(nodes, t0, 0.9, 0.1);
        break;
      }

      case 'diceLand': {
        const v = opts.value ?? 3;
        const base = 280 + v * 42;
        const nodes = [
          ...this.tone(base, t0, 0.12, { volume: 0.14 * vol, type: 'sine', attack: 0.004 }),
          ...this.tone(base * 1.5, t0 + 0.02, 0.1, { volume: 0.08 * vol, type: 'triangle' }),
          ...this.tone(base * 2, t0 + 0.04, 0.08, { volume: 0.05 * vol, type: 'sine' }),
          ...this.noise(t0, 0.06, { volume: 0.04 * vol, filterFreq: 900, type: 'lowpass' }),
        ];
        this.connectOut(nodes, t0, 0.85, 0.15);
        break;
      }

      case 'tokenHop': {
        const pitch = opts.pitch ?? 1;
        const f = 520 * pitch;
        this.connectOut(
          [
            ...this.tone(f, t0, 0.07, { volume: 0.09 * vol, type: 'triangle', attack: 0.003 }),
            ...this.tone(f * 2.01, t0 + 0.01, 0.05, { volume: 0.04 * vol, type: 'sine' }),
            ...this.noise(t0, 0.04, { volume: 0.025 * vol, filterFreq: 3200, type: 'highpass' }),
          ],
          t0,
          0.92,
          0.08,
        );
        break;
      }

      case 'capture': {
        const nodes = [
          ...this.noise(t0, 0.14, { volume: 0.12 * vol, filterFreq: 400, type: 'lowpass' }),
          ...this.tone(160, t0, 0.2, { volume: 0.16 * vol, type: 'sawtooth', attack: 0.002 }),
          ...this.tone(640, t0 + 0.06, 0.18, { volume: 0.1 * vol, type: 'sine' }),
          ...this.tone(960, t0 + 0.1, 0.22, { volume: 0.08 * vol, type: 'triangle' }),
        ];
        this.connectOut(nodes, t0, 0.8, 0.2);
        break;
      }

      case 'turnMine':
        this.connectOut(
          [
            ...this.tone(523.25, t0, 0.14, { volume: 0.1 * vol, type: 'sine' }),
            ...this.tone(659.25, t0 + 0.07, 0.16, { volume: 0.09 * vol, type: 'sine' }),
            ...this.tone(783.99, t0 + 0.14, 0.2, { volume: 0.08 * vol, type: 'triangle' }),
          ],
          t0,
          0.88,
          0.12,
        );
        break;

      case 'turnOther':
        this.connectOut(
          [...this.tone(392, t0, 0.12, { volume: 0.05 * vol, type: 'sine', pan: -0.2 })],
          t0,
        );
        break;

      case 'gameStart': {
        const chords = [261.63, 329.63, 392, 523.25];
        const nodes = chords.flatMap((f, i) =>
          this.tone(f, t0 + i * 0.09, 0.35, {
            volume: 0.09 * vol,
            type: i < 2 ? 'triangle' : 'sine',
            attack: 0.02,
            release: 0.25,
          }),
        );
        nodes.push(
          ...this.noise(t0 + 0.2, 0.25, { volume: 0.03 * vol, filterFreq: 6000, type: 'highpass' }),
        );
        this.connectOut(nodes, t0, 0.82, 0.18);
        break;
      }

      case 'win': {
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
        const nodes = notes.flatMap((f, i) =>
          this.tone(f, t0 + i * 0.11, 0.4, {
            volume: 0.1 * vol,
            type: 'sine',
            attack: 0.015,
            release: 0.3,
            pan: i % 2 ? 0.25 : -0.25,
          }),
        );
        this.connectOut(nodes, t0, 0.78, 0.22);
        break;
      }

      case 'lose':
        this.connectOut(
          [
            ...this.tone(440, t0, 0.2, { volume: 0.07 * vol, type: 'sine' }),
            ...this.tone(349.23, t0 + 0.15, 0.25, { volume: 0.06 * vol, type: 'triangle' }),
            ...this.tone(293.66, t0 + 0.32, 0.35, { volume: 0.05 * vol, type: 'sine' }),
          ],
          t0,
        );
        break;

      case 'ready':
        this.connectOut(
          [
            ...this.tone(440, t0, 0.08, { volume: 0.08 * vol, type: 'sine' }),
            ...this.tone(554.37, t0 + 0.06, 0.12, { volume: 0.09 * vol, type: 'triangle' }),
          ],
          t0,
        );
        break;

      case 'chat':
        this.connectOut(
          [...this.tone(1200, t0, 0.05, { volume: 0.04 * vol, type: 'sine' })],
          t0,
        );
        break;

      case 'emoji':
        this.connectOut(
          [
            ...this.tone(700, t0, 0.06, { volume: 0.06 * vol, type: 'triangle' }),
            ...this.tone(1050, t0 + 0.04, 0.07, { volume: 0.05 * vol, type: 'sine' }),
          ],
          t0,
        );
        break;

      default:
        break;
    }
  }
}

export const soundEngine = new SoundEngine();

export function playSound(id, opts) {
  soundEngine.play(id, opts);
}
