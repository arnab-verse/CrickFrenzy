/**
 * Web Audio API synthesizer for authentic Stick Cricket sound effects.
 * Broadcast-grade acoustic architecture with transparent peak limiting,
 * master volume amplification (up to 200% Loudness Boost), rich woody willow resonance,
 * explosive bat cracks, stadium crowd roars, boundary celebration horns, and turf impacts.
 */

export type CrowdAudioEventType = 'CHEER_HUGE' | 'CHEER' | 'GROAN' | 'CHANT';

class SoundEffectsController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 1.25; // Default loud broadcast volume (125%)
  private crowdEventListeners: Set<(event: CrowdAudioEventType) => void> = new Set();

  // Audio Graph Busses
  private masterGain: GainNode | null = null;
  private masterLimiter: DynamicsCompressorNode | null = null;
  private sfxMasterGain: GainNode | null = null;
  private ambientMasterGain: GainNode | null = null;
  private ambientVolume: number = 0.85; // Default ambient volume (85%)

  // Background Ambient, Crowd Murmur & Wind Gusts Synthesizer
  private ambientDroneSource: AudioBufferSourceNode | null = null;
  private ambientDroneGain: GainNode | null = null;
  private ambientMurmurLfo: OscillatorNode | null = null;
  private ambientMurmurLfoGain: GainNode | null = null;
  private chantMasterGain: GainNode | null = null;
  private windMasterGain: GainNode | null = null;
  private windSchedulerTimer: number | null = null;
  private currentWeather: string = 'SUNNY';
  private currentStreak: number = 0;
  private isAmbientInitialized: boolean = false;
  private chantSchedulerTimer: number | null = null;
  private nextChantTime: number = 0;
  private chantStep: number = 0;

  // Pleasant Melodic Home Page Music Synthesizer
  private homeMusicGain: GainNode | null = null;
  private homeMusicTimer: number | null = null;
  private isHomeMusicActive: boolean = false;
  private homeMusicStep: number = 0;
  private nextHomeMusicStepTime: number = 0;

  constructor() {
    // Restore mute, master volume, and ambient volume state from localStorage
    try {
      this.isMuted = localStorage.getItem('timing_cricket_muted') === 'true';
      const savedVol = localStorage.getItem('timing_cricket_volume');
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 2) {
          this.volume = parsed;
        }
      }
      const savedAmbientVol = localStorage.getItem('timing_cricket_ambient_volume');
      if (savedAmbientVol !== null) {
        const parsedAmbient = parseFloat(savedAmbientVol);
        if (!isNaN(parsedAmbient) && parsedAmbient >= 0 && parsedAmbient <= 2) {
          this.ambientVolume = parsedAmbient;
        }
      }
    } catch {
      this.isMuted = false;
      this.volume = 1.25;
      this.ambientVolume = 0.85;
    }

    // Automatically set up eager unlock listeners on window
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.unlockAudio();
      };
      window.addEventListener('pointerdown', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
      window.addEventListener('mousedown', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
      window.addEventListener('click', unlock, { passive: true });
    }
  }

  /**
   * Proactive audio unlock routine to bypass browser autoplay restrictions
   */
  public unlockAudio() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      try {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      } catch {}
    }
  }

  private getContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.initAudioGraph(this.ctx);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.ctx && !this.isAmbientInitialized && !this.isMuted) {
      this.initAmbientAudioGraph(this.ctx);
    }
    return this.ctx;
  }

  /**
   * Crystal-Clear Master Audio Bus:
   * 1. High-headroom SFX bus with dedicated amplification
   * 2. Transparent peak limiter (threshold: -0.5 dB, 0 knee) that prevents digital clipping
   *    WITHOUT compressing or squashing sound transients
   * 3. Clean Master Gain linked to user Volume slider (0% to 200%)
   */
  private initAudioGraph(ctx: AudioContext) {
    try {
      // 1. Master Gain Node
      this.masterGain = ctx.createGain();
      const initialGain = this.isMuted ? 0 : this.volume * 1.5;
      this.masterGain.gain.setValueAtTime(initialGain, ctx.currentTime);
      this.masterGain.connect(ctx.destination);

      // 2. Safety Peak Limiter (Brickwall transparent protection)
      this.masterLimiter = ctx.createDynamicsCompressor();
      this.masterLimiter.threshold.setValueAtTime(-0.5, ctx.currentTime);
      this.masterLimiter.knee.setValueAtTime(0, ctx.currentTime);
      this.masterLimiter.ratio.setValueAtTime(20, ctx.currentTime);
      this.masterLimiter.attack.setValueAtTime(0.001, ctx.currentTime);
      this.masterLimiter.release.setValueAtTime(0.04, ctx.currentTime);
      this.masterLimiter.connect(this.masterGain);

      // 3. Dedicated Sound Effects Bus (Boosted loudness)
      this.sfxMasterGain = ctx.createGain();
      this.sfxMasterGain.gain.setValueAtTime(1.8, ctx.currentTime);
      this.sfxMasterGain.connect(this.masterLimiter);

      // 4. Dedicated Ambient & Crowd Chanting Bus (Separated to avoid ducking SFX)
      this.ambientMasterGain = ctx.createGain();
      const initialAmbientGain = this.isMuted ? 0 : this.ambientVolume * 0.75;
      this.ambientMasterGain.gain.setValueAtTime(initialAmbientGain, ctx.currentTime);
      this.ambientMasterGain.connect(this.masterLimiter);

      // 5. Dedicated Home Page Pleasant Music Bus
      this.homeMusicGain = ctx.createGain();
      this.homeMusicGain.gain.setValueAtTime(0, ctx.currentTime);
      this.homeMusicGain.connect(this.masterLimiter);
    } catch (e) {
      console.warn('Audio graph initialization error:', e);
    }
  }

  public getSfxDestination(): AudioNode {
    if (this.sfxMasterGain) return this.sfxMasterGain;
    if (this.masterLimiter) return this.masterLimiter;
    if (this.masterGain) return this.masterGain;
    if (this.ctx) return this.ctx.destination;
    throw new Error('AudioContext not available');
  }

  public getAmbientDestination(): AudioNode {
    if (this.ambientMasterGain) return this.ambientMasterGain;
    return this.getSfxDestination();
  }

  /**
   * Initializes the continuous background stadium murmur and occasional wind gusts
   */
  public startAmbientIfNeeded(weather?: string) {
    if (weather) {
      this.currentWeather = weather;
    }
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (ctx && !this.isAmbientInitialized) {
      this.initAmbientAudioGraph(ctx);
    }
  }

  public startAmbientStadium(weather?: string) {
    if (weather) {
      this.currentWeather = weather;
    }
    this.startAmbientIfNeeded(weather);
    if (!this.isMuted && this.ctx) {
      // Trigger a gentle stadium breeze when entering the match
      setTimeout(() => {
        this.triggerWindGust(0.55, 4.0);
      }, 600);
    }
  }

  public updateWeather(weather: string) {
    this.currentWeather = weather;
  }

  private initAmbientAudioGraph(ctx: AudioContext) {
    if (this.isAmbientInitialized) return;
    this.isAmbientInitialized = true;

    try {
      // 1. Dedicated Wind Master Gain
      this.windMasterGain = ctx.createGain();
      this.windMasterGain.gain.setValueAtTime(0.85, ctx.currentTime);
      this.windMasterGain.connect(this.getAmbientDestination());

      // 2. Ambient Crowd Murmur (Looping stereo pink noise buffer)
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      let b0L = 0, b1L = 0, b2L = 0;
      let b0R = 0, b1R = 0, b2R = 0;
      for (let i = 0; i < bufferSize; i++) {
        const whiteL = Math.random() * 2 - 1;
        b0L = 0.99886 * b0L + whiteL * 0.0555179;
        b1L = 0.99332 * b1L + whiteL * 0.0750759;
        b2L = 0.96900 * b2L + whiteL * 0.1538520;
        left[i] = (b0L + b1L + b2L) * 0.45;

        const whiteR = Math.random() * 2 - 1;
        b0R = 0.99886 * b0R + whiteR * 0.0555179;
        b1R = 0.99332 * b1R + whiteR * 0.0750759;
        b2R = 0.96900 * b2R + whiteR * 0.1538520;
        right[i] = (b0R + b1R + b2R) * 0.45;
      }

      this.ambientDroneSource = ctx.createBufferSource();
      this.ambientDroneSource.buffer = buffer;
      this.ambientDroneSource.loop = true;

      // Two-stage filtering for realistic stadium bowl acoustics
      const droneLowpass = ctx.createBiquadFilter();
      droneLowpass.type = 'lowpass';
      droneLowpass.frequency.setValueAtTime(580, ctx.currentTime);
      droneLowpass.Q.setValueAtTime(1.2, ctx.currentTime);

      const dronePeak = ctx.createBiquadFilter();
      dronePeak.type = 'peaking';
      dronePeak.frequency.setValueAtTime(320, ctx.currentTime);
      dronePeak.gain.setValueAtTime(2.5, ctx.currentTime);
      dronePeak.Q.setValueAtTime(1.8, ctx.currentTime);

      this.ambientDroneGain = ctx.createGain();
      this.ambientDroneGain.gain.setValueAtTime(this.isMuted ? 0 : 0.16, ctx.currentTime);

      // Subtle slow LFO wave modulation for organic crowd breathing
      try {
        this.ambientMurmurLfo = ctx.createOscillator();
        this.ambientMurmurLfoGain = ctx.createGain();
        this.ambientMurmurLfo.type = 'sine';
        this.ambientMurmurLfo.frequency.setValueAtTime(0.16, ctx.currentTime); // ~6.25 sec cycle
        this.ambientMurmurLfoGain.gain.setValueAtTime(0.035, ctx.currentTime);
        this.ambientMurmurLfo.connect(this.ambientMurmurLfoGain);
        this.ambientMurmurLfoGain.connect(this.ambientDroneGain.gain);
        this.ambientMurmurLfo.start();
      } catch {}

      this.ambientDroneSource.connect(dronePeak);
      dronePeak.connect(droneLowpass);
      droneLowpass.connect(this.ambientDroneGain);
      this.ambientDroneGain.connect(this.getAmbientDestination());

      this.ambientDroneSource.start();

      // 3. Master Gain for Rhythmic Chants
      this.chantMasterGain = ctx.createGain();
      this.chantMasterGain.gain.setValueAtTime(0, ctx.currentTime);
      this.chantMasterGain.connect(this.getAmbientDestination());

      // Start lookahead chant scheduler
      this.nextChantTime = ctx.currentTime + 0.2;
      this.chantStep = 0;
      this.chantSchedulerTimer = window.setInterval(() => {
        this.runChantScheduler();
      }, 75);

      // 4. Start occasional wind gusts scheduler
      this.scheduleNextWindGust();
    } catch (err) {
      console.warn('Ambient audio graph deferred:', err);
    }
  }

  /**
   * Schedules dynamic, natural wind gusts occurring every 14-26 seconds
   */
  private scheduleNextWindGust() {
    if (this.windSchedulerTimer !== null) {
      clearTimeout(this.windSchedulerTimer);
      this.windSchedulerTimer = null;
    }

    // Weather affects wind frequency and intensity
    const isOvercast = this.currentWeather === 'OVERCAST';
    const isRain = this.currentWeather === 'RAIN';
    const minDelay = isOvercast ? 10000 : isRain ? 12000 : 16000;
    const maxDelay = isOvercast ? 20000 : isRain ? 22000 : 28000;
    const randomDelay = minDelay + Math.random() * (maxDelay - minDelay);

    this.windSchedulerTimer = window.setTimeout(() => {
      if (!this.isMuted && this.ambientVolume > 0.05) {
        const intensity = isOvercast ? 0.75 : isRain ? 0.8 : 0.6;
        const duration = 3.5 + Math.random() * 2.5;
        this.triggerWindGust(intensity, duration);
      }
      this.scheduleNextWindGust();
    }, randomDelay);
  }

  /**
   * Synthesizes an atmospheric, natural wind gust sweeping across the stadium
   */
  public triggerWindGust(intensity: number = 0.65, duration: number = 4.5) {
    if (this.isMuted || this.ambientVolume < 0.02) return;
    const ctx = this.getContext();
    if (!ctx || !this.windMasterGain) return;
    if (ctx.state === 'suspended') return;

    try {
      const t = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * Math.min(duration, 7.0));
      const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      // Filtered pinkish turbulence noise
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        const pink = (b0 + b1 + b2) * 0.5;
        
        // Gentle amplitude shaping for smooth entry and exit
        const norm = i / bufferSize;
        const envelope = Math.sin(norm * Math.PI);
        left[i] = pink * envelope * (0.8 + Math.sin(norm * Math.PI * 3) * 0.2);
        right[i] = pink * envelope * (0.8 - Math.sin(norm * Math.PI * 3) * 0.2);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Sweeping resonant lowpass filter for wind whoosh
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      const startFreq = 180 + Math.random() * 60;
      const peakFreq = 520 + intensity * 450;
      const attackTime = duration * 0.38;

      filter.frequency.setValueAtTime(startFreq, t);
      filter.frequency.linearRampToValueAtTime(peakFreq, t + attackTime);
      filter.frequency.exponentialRampToValueAtTime(startFreq * 0.8, t + duration);
      filter.Q.setValueAtTime(2.2, t);

      // Second gentle high-frequency airy hiss filter
      const airFilter = ctx.createBiquadFilter();
      airFilter.type = 'bandpass';
      airFilter.frequency.setValueAtTime(1400, t);
      airFilter.Q.setValueAtTime(1.0, t);

      const gain = ctx.createGain();
      const maxGain = 0.28 * intensity;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(maxGain, t + attackTime);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.windMasterGain);

      noise.start(t);
      noise.stop(t + duration + 0.1);
    } catch (e) {
      console.warn('Wind gust generation deferred:', e);
    }
  }

  private runChantScheduler() {
    if (!this.ctx || this.isMuted || !this.chantMasterGain) return;
    if (this.ctx.state === 'suspended') return;

    const lookahead = 0.25;
    const beatDuration = 0.49;

    while (this.nextChantTime < this.ctx.currentTime + lookahead) {
      if (this.currentStreak > 0) {
        this.scheduleChantStep(this.ctx, this.nextChantTime, this.chantStep, this.currentStreak);
      }
      this.chantStep = (this.chantStep + 1) % 8;
      this.nextChantTime += beatDuration;
    }
  }

  private scheduleChantStep(ctx: AudioContext, time: number, step: number, streak: number) {
    if (!this.chantMasterGain) return;
    const intensity = Math.min(1.0, Math.max(0.3, (streak - 0.5) / 3.5));
    const baseFreq = streak >= 4 ? 174.61 : streak >= 2 ? 146.83 : 130.81;

    switch (step) {
      case 0:
        this.synthVocalChant(ctx, time, baseFreq, intensity);
        this.synthBleacherStomp(ctx, time, intensity);
        break;
      case 1:
        if (streak >= 3) this.synthHandclaps(ctx, time + 0.1, intensity * 0.8, 1);
        break;
      case 2:
        this.synthHandclaps(ctx, time, intensity, 2);
        break;
      case 3:
        if (streak >= 4) this.synthHandclaps(ctx, time + 0.12, intensity * 0.9, 1);
        break;
      case 4:
        this.synthVocalChant(ctx, time, baseFreq * 1.334, intensity);
        this.synthBleacherStomp(ctx, time, intensity);
        break;
      case 5:
        this.synthHandclaps(ctx, time, intensity, streak >= 2 ? 3 : 1);
        break;
      case 6:
        this.synthHandclaps(ctx, time, intensity, 2);
        break;
      case 7:
        if (streak >= 3) this.synthHandclaps(ctx, time + 0.08, intensity, 2);
        break;
    }
  }

  private synthVocalChant(ctx: AudioContext, time: number, pitchFreq: number, intensity: number) {
    if (!this.chantMasterGain) return;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(pitchFreq, time);
    osc.frequency.linearRampToValueAtTime(pitchFreq * 1.03, time + 0.08);
    osc.frequency.linearRampToValueAtTime(pitchFreq * 0.97, time + 0.28);

    const f1 = ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.setValueAtTime(450, time);
    f1.Q.setValueAtTime(3.5, time);

    const vocalGain = ctx.createGain();
    vocalGain.gain.setValueAtTime(0.001, time);
    vocalGain.gain.linearRampToValueAtTime(0.9 * intensity, time + 0.04);
    vocalGain.gain.exponentialRampToValueAtTime(0.001, time + 0.36);

    osc.connect(f1);
    f1.connect(vocalGain);
    vocalGain.connect(this.chantMasterGain);

    osc.start(time);
    osc.stop(time + 0.38);
  }

  private synthHandclaps(ctx: AudioContext, time: number, intensity: number, numClaps: number) {
    if (!this.chantMasterGain) return;
    for (let c = 0; c < numClaps; c++) {
      const clapTime = time + c * 0.035;
      const bufferSize = Math.floor(ctx.sampleRate * 0.05);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600 + Math.random() * 400, clapTime);
      filter.Q.setValueAtTime(2.0, clapTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.7 * intensity, clapTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clapTime + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.chantMasterGain);
      noise.start(clapTime);
    }
  }

  private synthBleacherStomp(ctx: AudioContext, time: number, intensity: number) {
    if (!this.chantMasterGain) return;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, time);
    osc.frequency.exponentialRampToValueAtTime(36, time + 0.18);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.9 * intensity, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    osc.connect(gain);
    gain.connect(this.chantMasterGain);

    osc.start(time);
    osc.stop(time + 0.22);
  }

  public updateBoundaryStreak(streak: number, isInningsOver: boolean) {
    this.currentStreak = isInningsOver ? 0 : streak;
    if (this.isMuted || !this.ctx) return;

    let targetChantGain = 0;
    let targetDroneGain = 0.16;

    if (streak === 1) {
      targetChantGain = 0.35;
      targetDroneGain = 0.20;
    } else if (streak === 2) {
      targetChantGain = 0.55;
      targetDroneGain = 0.25;
    } else if (streak === 3) {
      targetChantGain = 0.75;
      targetDroneGain = 0.30;
    } else if (streak >= 4) {
      targetChantGain = 1.0;
      targetDroneGain = 0.36;
    }

    this.rampChantGain(targetChantGain, 0.4);
    this.rampDroneGain(targetDroneGain, 0.5);
  }

  private rampChantGain(target: number, duration: number) {
    if (!this.chantMasterGain || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.chantMasterGain.gain.cancelScheduledValues(t);
    this.chantMasterGain.gain.setValueAtTime(this.chantMasterGain.gain.value, t);
    this.chantMasterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : target, t + duration);
  }

  private rampDroneGain(target: number, duration: number) {
    if (!this.ambientDroneGain || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.ambientDroneGain.gain.cancelScheduledValues(t);
    this.ambientDroneGain.gain.setValueAtTime(this.ambientDroneGain.gain.value, t);
    this.ambientDroneGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : target, t + duration);
  }

  // Master Volume Controls
  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(2.0, vol));
    try {
      localStorage.setItem('timing_cricket_volume', String(this.volume));
    } catch {}

    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.volume * 1.5;
      this.masterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  // Ambient Audio Volume Controls (Crowd murmur, stadium ambience, and wind gusts)
  public setAmbientVolume(vol: number) {
    this.ambientVolume = Math.max(0, Math.min(2.0, vol));
    try {
      localStorage.setItem('timing_cricket_ambient_volume', String(this.ambientVolume));
    } catch {}

    if (this.ambientMasterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.ambientVolume * 0.75;
      this.ambientMasterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }

    if (!this.isMuted && this.ambientVolume > 0) {
      this.startAmbientIfNeeded();
    }
  }

  public getAmbientVolume(): number {
    return this.ambientVolume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('timing_cricket_muted', String(this.isMuted));
    } catch {}

    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.volume * 1.5;
      this.masterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }

    if (this.ambientMasterGain && this.ctx) {
      const targetAmbientGain = this.isMuted ? 0 : this.ambientVolume * 0.75;
      this.ambientMasterGain.gain.setValueAtTime(targetAmbientGain, this.ctx.currentTime);
    }

    if (this.isMuted) {
      this.rampChantGain(0, 0.1);
      this.rampDroneGain(0, 0.1);
      this.rampHomeMusicGain(0, 0.1);
    } else {
      this.startAmbientIfNeeded();
      this.updateBoundaryStreak(this.currentStreak, false);
      if (this.isHomeMusicActive) {
        this.rampHomeMusicGain(0.36, 0.3);
      }
    }

    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private rampHomeMusicGain(target: number, duration: number) {
    if (!this.homeMusicGain || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.homeMusicGain.gain.cancelScheduledValues(t);
    this.homeMusicGain.gain.setValueAtTime(this.homeMusicGain.gain.value, t);
    this.homeMusicGain.gain.linearRampToValueAtTime(target, t + duration);
  }

  /**
   * Starts playing pleasant, relaxing, uplifting background music on the Home Page
   */
  public startHomeMusic() {
    this.isHomeMusicActive = true;
    const ctx = this.getContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    if (!this.homeMusicGain) {
      this.homeMusicGain = ctx.createGain();
      this.homeMusicGain.gain.setValueAtTime(0, ctx.currentTime);
      const dest = this.masterLimiter || this.masterGain || ctx.destination;
      this.homeMusicGain.connect(dest);
    }

    const targetGain = this.isMuted ? 0 : 0.36;
    this.rampHomeMusicGain(targetGain, 0.8);

    if (this.homeMusicTimer === null) {
      this.nextHomeMusicStepTime = ctx.currentTime + 0.08;
      this.homeMusicStep = 0;
      this.homeMusicTimer = window.setInterval(() => {
        this.runHomeMusicScheduler();
      }, 55);
    }
  }

  /**
   * Stops the home page music with a clean, smooth fade-out
   */
  public stopHomeMusic() {
    this.isHomeMusicActive = false;
    if (!this.ctx || !this.homeMusicGain) {
      if (this.homeMusicTimer !== null) {
        clearInterval(this.homeMusicTimer);
        this.homeMusicTimer = null;
      }
      return;
    }

    this.rampHomeMusicGain(0.0001, 0.4);

    setTimeout(() => {
      if (!this.isHomeMusicActive && this.homeMusicTimer !== null) {
        clearInterval(this.homeMusicTimer);
        this.homeMusicTimer = null;
      }
    }, 450);
  }

  public isHomeMusicPlaying(): boolean {
    return this.isHomeMusicActive && !this.isMuted;
  }

  private runHomeMusicScheduler() {
    if (!this.ctx || !this.homeMusicGain) return;
    if (this.ctx.state === 'suspended') return;

    const lookahead = 0.25;
    const stepDuration = 0.28; // ~107 BPM eighth notes (9.6s seamless loop)

    while (this.nextHomeMusicStepTime < this.ctx.currentTime + lookahead) {
      if (this.isHomeMusicActive && !this.isMuted) {
        this.scheduleHomeMusicStep(this.ctx, this.nextHomeMusicStepTime, this.homeMusicStep);
      }
      this.homeMusicStep = (this.homeMusicStep + 1) % 32;
      this.nextHomeMusicStepTime += stepDuration;
    }
  }

  private scheduleHomeMusicStep(ctx: AudioContext, time: number, step: number) {
    if (!this.homeMusicGain) return;

    // Harmonic Chord Progression: C -> G -> Am -> F (Epic Stadium Anthem vibe)
    const CHORD_DATA = [
      { bassFreq: 130.81, chordFreqs: [261.63, 329.63, 392.00, 523.25] }, // C major (C3, E3, G3, C4)
      { bassFreq: 98.00,  chordFreqs: [196.00, 246.94, 293.66, 392.00] }, // G major (G2, B2, D3, G3)
      { bassFreq: 110.00, chordFreqs: [220.00, 261.63, 329.63, 440.00] }, // A minor (A2, C3, E3, A3)
      { bassFreq: 87.31,  chordFreqs: [174.61, 220.00, 261.63, 349.23] }, // F major (F2, A2, C3, F3)
    ];

    const barIndex = Math.floor(step / 8);
    const barStep = step % 8;
    const chord = CHORD_DATA[barIndex];

    // 1. Driving Stadium Bass on beats 1, 3, and syncopated 6
    if (barStep === 0 || barStep === 4) {
      this.synthMusicBass(ctx, time, chord.bassFreq, 0.32);
    } else if (barStep === 6) {
      this.synthMusicBass(ctx, time, chord.bassFreq * 1.25, 0.22);
    }

    // 2. Lush Synth Chords on beat 1 and syncopated beat 3
    if (barStep === 0) {
      this.synthMusicChord(ctx, time, chord.chordFreqs, 0.18);
    } else if (barStep === 4) {
      this.synthMusicChord(ctx, time, chord.chordFreqs, 0.14);
    }

    // 3. Uplifting Stadium Glockenspiel & Marimba Lead Melody
    const MELODY_NOTES: (number | null)[] = [
      // Bar 0 (C): E5, G5, C6, B5, G5
      659.25, 783.99, 1046.50, 987.77, 783.99, 659.25, 523.25, 587.33,
      // Bar 1 (G): D5, G5, B5, A5, G5, E5, D5, 523.25
      587.33, 783.99, 987.77, 880.00, 783.99, 659.25, 587.33, 523.25,
      // Bar 2 (Am): C5, E5, A5, G5, E5, C5, D5, E5
      523.25, 659.25, 880.00, 783.99, 659.25, 523.25, 587.33, 659.25,
      // Bar 3 (F): F5, A5, C6, A5, G5, E5, D5, C5
      698.46, 880.00, 1046.50, 880.00, 783.99, 659.25, 587.33, 523.25,
    ];

    const melodyFreq = MELODY_NOTES[step];
    if (melodyFreq) {
      this.synthMusicMelody(ctx, time, melodyFreq, 0.28);
    }

    // 4. Crisp Stadium Kick & Shaker Beats
    if (barStep === 0 || barStep === 4) {
      this.synthMusicKick(ctx, time, 0.18);
    }
    if (barStep % 2 === 1) {
      this.synthMusicShaker(ctx, time, 0.045);
    }
  }

  private synthMusicBass(ctx: AudioContext, time: number, freq: number, gainLevel: number) {
    if (!this.homeMusicGain) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(gainLevel, time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.48);

    osc.connect(gain);
    gain.connect(this.homeMusicGain);

    osc.start(time);
    osc.stop(time + 0.5);
  }

  private synthMusicChord(ctx: AudioContext, time: number, freqs: number[], gainLevel: number) {
    if (!this.homeMusicGain) return;
    const noteGain = gainLevel / freqs.length;

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, time);
      filter.Q.setValueAtTime(1.0, time);

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(noteGain, time + 0.04);
      gain.gain.exponentialRampToValueAtTime(noteGain * 0.25, time + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.homeMusicGain!);

      osc.start(time);
      osc.stop(time + 0.72);
    });
  }

  private synthMusicMelody(ctx: AudioContext, time: number, freq: number, gainLevel: number) {
    if (!this.homeMusicGain) return;
    const oscMain = ctx.createOscillator();
    const oscOvertone = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, time);
    filter.Q.setValueAtTime(1.2, time);

    oscMain.type = 'sine';
    oscMain.frequency.setValueAtTime(freq, time);

    oscOvertone.type = 'triangle';
    oscOvertone.frequency.setValueAtTime(freq * 2, time);

    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.18, time);
    oscOvertone.connect(overtoneGain);
    overtoneGain.connect(filter);

    oscMain.connect(filter);
    filter.connect(gain);
    gain.connect(this.homeMusicGain);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(gainLevel, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(gainLevel * 0.35, time + 0.16);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.44);

    oscMain.start(time);
    oscMain.stop(time + 0.46);
    oscOvertone.start(time);
    oscOvertone.stop(time + 0.46);
  }

  private synthMusicKick(ctx: AudioContext, time: number, gainLevel: number) {
    if (!this.homeMusicGain) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.12);

    gain.gain.setValueAtTime(gainLevel, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.homeMusicGain);

    osc.start(time);
    osc.stop(time + 0.2);
  }

  private synthMusicShaker(ctx: AudioContext, time: number, gainLevel: number) {
    if (!this.homeMusicGain) return;
    const bufferSize = Math.floor(ctx.sampleRate * 0.025);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(6200, time);
    filter.Q.setValueAtTime(2.2, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainLevel, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.homeMusicGain);

    noise.start(time);
  }

  /**
   * Powerful, crisp, woody cricket bat crack.
   * Engineered with three distinct, loud acoustic layers:
   * 1. High-frequency willow impact snap & splinter transient (1800Hz - 4200Hz)
   * 2. Resonant wood body cavity ringing (360Hz - 780Hz)
   * 3. Solid sub-bass sweet-spot pop (60Hz - 150Hz)
   */
  public playBatHit(quality: 'PERFECT' | 'GOOD' | 'EDGED' | 'DEFENSIVE') {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    const t = ctx.currentTime;
    const dest = this.getSfxDestination();

    // 1. Explosive Willow Crack Snap (Broadband shaped noise transient)
    const isPerfect = quality === 'PERFECT';
    const isGood = quality === 'GOOD';
    const isEdged = quality === 'EDGED';

    const snapDuration = isPerfect ? 0.08 : isGood ? 0.065 : 0.05;
    const bufferSize = Math.floor(ctx.sampleRate * snapDuration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Exponentially shaped high-energy crack impulse
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.22));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const snapFilter = ctx.createBiquadFilter();
    snapFilter.type = 'bandpass';
    snapFilter.frequency.setValueAtTime(
      isEdged ? 3600 : isPerfect ? 2400 : 2000,
      t
    );
    snapFilter.Q.setValueAtTime(1.8, t);

    const snapGain = ctx.createGain();
    const snapVolume = isPerfect ? 1.4 : isGood ? 1.15 : isEdged ? 0.9 : 0.75;
    snapGain.gain.setValueAtTime(snapVolume, t);
    snapGain.gain.exponentialRampToValueAtTime(0.01, t + snapDuration);

    noise.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(dest);
    noise.start(t);

    // 2. Resonant Woody Body Thump (Dual harmonic willow wood resonance)
    const woodOsc = ctx.createOscillator();
    const woodGain = ctx.createGain();

    const baseFreq = isPerfect ? 480 : isGood ? 420 : isEdged ? 520 : 340;
    woodOsc.type = 'triangle';
    woodOsc.frequency.setValueAtTime(baseFreq, t);
    woodOsc.frequency.exponentialRampToValueAtTime(110, t + (isPerfect ? 0.18 : 0.12));

    const woodVolume = isPerfect ? 1.25 : isGood ? 1.0 : 0.65;
    woodGain.gain.setValueAtTime(woodVolume, t);
    woodGain.gain.exponentialRampToValueAtTime(0.001, t + (isPerfect ? 0.2 : 0.14));

    woodOsc.connect(woodGain);
    woodGain.connect(dest);
    woodOsc.start(t);
    woodOsc.stop(t + 0.22);

    // Willow Second Harmonic (Gives authentic hollow bat ping)
    if (isPerfect || isGood) {
      const harmOsc = ctx.createOscillator();
      const harmGain = ctx.createGain();
      harmOsc.type = 'sine';
      harmOsc.frequency.setValueAtTime(baseFreq * 1.85, t);
      harmOsc.frequency.exponentialRampToValueAtTime(220, t + 0.14);

      harmGain.gain.setValueAtTime(isPerfect ? 0.7 : 0.45, t);
      harmGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      harmOsc.connect(harmGain);
      harmGain.connect(dest);
      harmOsc.start(t);
      harmOsc.stop(t + 0.16);
    }

    // 3. Sub-Bass Sweet-Spot Pop (Visceral low punch for clean hits & sixes)
    if (isPerfect || isGood) {
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(isPerfect ? 160 : 130, t);
      subOsc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

      subGain.gain.setValueAtTime(isPerfect ? 1.1 : 0.8, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      subOsc.connect(subGain);
      subGain.connect(dest);
      subOsc.start(t);
      subOsc.stop(t + 0.15);
    }
  }

  /**
   * Timber / Stumps shattering sound:
   * Heavy ball impact + clattering flying wood + ringing airborne bails
   */
  public playBowledStumps() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    const t = ctx.currentTime;
    const dest = this.getSfxDestination();

    // 1. Initial Heavy Stump Punch
    const punchOsc = ctx.createOscillator();
    const punchGain = ctx.createGain();
    punchOsc.type = 'triangle';
    punchOsc.frequency.setValueAtTime(290, t);
    punchOsc.frequency.exponentialRampToValueAtTime(55, t + 0.16);
    punchGain.gain.setValueAtTime(1.3, t);
    punchGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    punchOsc.connect(punchGain);
    punchGain.connect(dest);
    punchOsc.start(t);
    punchOsc.stop(t + 0.2);

    // 2. Multiple Clattering Wooden Stumps
    for (let i = 0; i < 4; i++) {
      const delay = t + i * 0.028;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i % 2 === 0 ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(460 + i * 110, delay);
      osc.frequency.exponentialRampToValueAtTime(130, delay + 0.14);

      gain.gain.setValueAtTime(0.9 / (i * 0.4 + 1), delay);
      gain.gain.exponentialRampToValueAtTime(0.001, delay + 0.16);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(delay);
      osc.stop(delay + 0.18);
    }

    // 3. Ringing Airborne Bails
    const bailOsc = ctx.createOscillator();
    const bailGain = ctx.createGain();
    bailOsc.type = 'sine';
    bailOsc.frequency.setValueAtTime(2200, t + 0.02);
    bailOsc.frequency.exponentialRampToValueAtTime(950, t + 0.16);
    bailGain.gain.setValueAtTime(0.7, t + 0.02);
    bailGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    bailOsc.connect(bailGain);
    bailGain.connect(dest);
    bailOsc.start(t + 0.02);
    bailOsc.stop(t + 0.2);
  }

  public onCrowdAudioEvent(listener: (event: CrowdAudioEventType) => void): () => void {
    this.crowdEventListeners.add(listener);
    return () => {
      this.crowdEventListeners.delete(listener);
    };
  }

  private emitCrowdAudioEvent(event: CrowdAudioEventType) {
    this.crowdEventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch {}
    });
  }

  /**
   * Loud, roaring stadium crowd cheer for boundaries and sixes
   */
  public playCrowdCheer(isHuge: boolean = false) {
    this.emitCrowdAudioEvent(isHuge ? 'CHEER_HUGE' : 'CHEER');
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    const t = ctx.currentTime;
    const duration = isHuge ? 3.2 : 2.2;
    const dest = this.getSfxDestination();

    // 1. High Amplitude Pink Noise Roar
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2) * 0.95;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, t);
    filter.frequency.linearRampToValueAtTime(isHuge ? 1900 : 1400, t + 0.4);
    filter.frequency.exponentialRampToValueAtTime(450, t + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.linearRampToValueAtTime(isHuge ? 1.25 : 0.95, t + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start(t);

    // 2. Stadium Whistles & Fanfare in the Roar
    if (isHuge) {
      const whistle = ctx.createOscillator();
      const whistleGain = ctx.createGain();
      whistle.type = 'sine';
      whistle.frequency.setValueAtTime(2100, t + 0.1);
      whistle.frequency.linearRampToValueAtTime(2800, t + 0.35);
      whistle.frequency.linearRampToValueAtTime(1900, t + 0.7);

      whistleGain.gain.setValueAtTime(0.001, t + 0.1);
      whistleGain.gain.linearRampToValueAtTime(0.45, t + 0.25);
      whistleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

      whistle.connect(whistleGain);
      whistleGain.connect(dest);
      whistle.start(t + 0.1);
      whistle.stop(t + 0.8);
    }
  }

  /**
   * Iconic T20 Stadium Celebration Air Horn for Fours and Sixes
   */
  public playBoundaryHorn() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    const t = ctx.currentTime;
    const dest = this.getSfxDestination();

    // Dual-tone celebratory brass horn: D5 (587 Hz) and A4 (440 Hz)
    const hornPitches = [440, 587.33];
    hornPitches.forEach((freq) => {
      // Blast 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, t);

      gain1.gain.setValueAtTime(0.01, t);
      gain1.gain.linearRampToValueAtTime(0.5, t + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.28);

      osc1.connect(gain1);
      gain1.connect(dest);
      osc1.start(t);
      osc1.stop(t + 0.3);

      // Blast 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq, t + 0.32);

      gain2.gain.setValueAtTime(0.01, t + 0.32);
      gain2.gain.linearRampToValueAtTime(0.65, t + 0.36);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

      osc2.connect(gain2);
      gain2.connect(dest);
      osc2.start(t + 0.32);
      osc2.stop(t + 0.78);
    });
  }

  /**
   * Deep collective groan / gasp on wicket or missed opportunity
   */
  public playCrowdGroan() {
    this.emitCrowdAudioEvent('GROAN');
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    const t = ctx.currentTime;
    const duration = 1.6;
    const dest = this.getSfxDestination();

    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.9;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(220, t + duration);
    filter.Q.setValueAtTime(2.2, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(1.1, t + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start(t);

    // Rapidly duck chant track during groan
    if (this.chantMasterGain) {
      this.chantMasterGain.gain.cancelScheduledValues(t);
      this.chantMasterGain.gain.setValueAtTime(this.chantMasterGain.gain.value, t);
      this.chantMasterGain.gain.linearRampToValueAtTime(0, t + 0.2);
    }
  }

  /**
   * Ball pitching on pitch turf: crisp leather-on-clay impact
   */
  public playBallBounce() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    const t = ctx.currentTime;
    const dest = this.getSfxDestination();

    // 1. Turf impact thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);

    gain.gain.setValueAtTime(1.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.1);

    // 2. High turf friction snap
    const bufferSize = Math.floor(ctx.sampleRate * 0.03);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1700, t);
    filter.Q.setValueAtTime(2.2, t);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.85, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(t);
  }

  /**
   * Crisp, loud ball release whoosh cutting through the air
   * Uses both harmonic and turbulent noise sweeping for maximum speaker audibility
   */
  public playBallRelease() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    const t = ctx.currentTime;
    const dest = this.getSfxDestination();

    // 1. Turbulent Air Whoosh (Audible on all phone/laptop speakers)
    const bufferSize = Math.floor(ctx.sampleRate * 0.14);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, t);
    filter.frequency.exponentialRampToValueAtTime(650, t + 0.13);
    filter.Q.setValueAtTime(2.8, t);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.05, t);
    noiseGain.gain.linearRampToValueAtTime(1.15, t + 0.04);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(t);

    // 2. Pitch Sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(540, t + 0.12);

    gain.gain.setValueAtTime(0.75, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  /**
   * Bowler approaching crease run-up stride / turf spike scuffs
   */
  public playBowlerRunUp() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    const t = ctx.currentTime;
    const dest = this.getSfxDestination();

    // 3 distinct rhythmic spike scuffs on grass
    for (let i = 0; i < 3; i++) {
      const stepTime = t + i * 0.15;
      const bufferSize = Math.floor(ctx.sampleRate * 0.05);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.25));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400 + i * 150, stepTime);
      filter.Q.setValueAtTime(2.2, stepTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.85 + i * 0.12, stepTime);
      gain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      noise.start(stepTime);
    }
  }

  /**
   * Crisp UI click sound
   */
  public playUiClick() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    const t = ctx.currentTime;
    const dest = this.getSfxDestination();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1150, t + 0.04);

    gain.gain.setValueAtTime(0.75, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  /**
   * Energetic match start fanfare sound
   */
  public playMatchStart() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    const t = ctx.currentTime;
    const dest = this.getSfxDestination();
    const notes = [261.63, 329.63, 392.0, 523.25]; // C - E - G - C arpeggio

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = t + idx * 0.075;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.85, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(noteTime);
      osc.stop(noteTime + 0.3);
    });
  }

  /**
   * Instant Audio Test: Plays bat crack + boundary cheer for user volume testing
   */
  public testSound() {
    this.unlockAudio();
    this.playBatHit('PERFECT');
    setTimeout(() => {
      this.playBoundaryHorn();
      this.playCrowdCheer(true);
    }, 120);
  }

  /**
   * Ambient Audio Preview: Triggers crowd murmur swell and a gentle atmospheric stadium wind gust
   */
  public testAmbientSound() {
    this.unlockAudio();
    this.startAmbientIfNeeded();
    this.triggerWindGust(0.75, 4.0);
  }

  /**
   * Dynamically adjust crowd volume based on current run rate - higher run rates trigger louder, more excited cheering loops.
   */
  public updateRunRateCrowdVolume(currentRunRate: number) {
    if (this.isMuted || !this.ambientDroneGain || !this.ctx) return;
    try {
      const normalizedRate = Math.min(18, Math.max(0, currentRunRate));
      // Base murmur volume scales from 0.08 (slow run rate) up to 0.38 (explosive run rate)
      const targetGain = 0.08 + (normalizedRate / 18) * 0.30;
      this.ambientDroneGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.4);
    } catch (e) {
      // Ignore audio scheduling exceptions
    }
  }
}

export const soundFx = new SoundEffectsController();
