import { useState, useRef, useEffect, useCallback } from 'react';

const PRESETS = [
  {
    id: 'forest-morning',
    name: 'Forest Morning',
    emoji: '🌲',
    description: 'Low brown noise + filtered birdsong',
  },
  {
    id: 'gentle-stream',
    name: 'Gentle Stream',
    emoji: '💧',
    description: 'Pink noise with bandpass filter + slow LFO',
  },
  {
    id: 'soft-rain',
    name: 'Soft Rain',
    emoji: '🌧',
    description: 'Filtered white noise with gentle amplitude envelope',
  },
  {
    id: 'magical-glow',
    name: 'Magical Glow',
    emoji: '✨',
    description: 'Bell-like sine oscillators with long decay',
  },
  {
    id: 'cozy-fireplace',
    name: 'Cozy Fireplace',
    emoji: '🔥',
    description: 'Brown noise with crackle bursts',
  },
  {
    id: 'starlight-lullaby',
    name: 'Starlight Lullaby',
    emoji: '🌙',
    description: 'Soft sine wave chords with slow tremolo',
  },
];

/**
 * Generates a buffer of white noise samples.
 */
function createWhiteNoiseBuffer(ctx, durationSec = 2) {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * durationSec;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * Generates a buffer of brown noise (white noise integrated / low-passed heavily).
 */
function createBrownNoiseBuffer(ctx, durationSec = 2) {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * durationSec;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    // Simple 1-pole lowpass — heavy smoothing
    lastOut = lastOut + 0.02 * (white - lastOut);
    data[i] = lastOut * 3.5; // amplify
  }
  return buffer;
}

/**
 * Generates a buffer of pink noise (approximated by filtering white).
 */
function createPinkNoiseBuffer(ctx, durationSec = 2) {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * durationSec;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  // Paul Kellet's pink noise approximation
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  return buffer;
}

export default function InteractiveAudioEngine() {
  const [activePreset, setActivePreset] = useState(null);
  const [volumes, setVolumes] = useState(() =>
    Object.fromEntries(PRESETS.map((p) => [p.id, 50]))
  );
  const [audioSupported, setAudioSupported] = useState(true);

  const ctxRef = useRef(null);
  const nodesRef = useRef({}); // { [presetId]: { gain, sources, ... } }
  const animFrameRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      try {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) {
          setAudioSupported(false);
          return null;
        }
        ctxRef.current = new Ctor();
      } catch {
        setAudioSupported(false);
        return null;
      }
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const stopAll = useCallback(() => {
    Object.values(nodesRef.current).forEach((nodeGroup) => {
      nodeGroup.sources.forEach((src) => {
        try { src.stop?.(); } catch {}
        try { src.disconnect?.(); } catch {}
      });
      try { nodeGroup.gain?.disconnect?.(); } catch {}
    });
    nodesRef.current = {};
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const setVolume = useCallback((presetId, vol) => {
    setVolumes((prev) => ({ ...prev, [presetId]: vol }));
    const nodeGroup = nodesRef.current[presetId];
    if (nodeGroup?.gain) {
      const gainVal = vol / 100;
      nodeGroup.gain.gain.setTargetAtTime(gainVal, ctxRef.current.currentTime, 0.05);
    }
  }, []);

  // ──── Soundscape generators ────

  const startForestMorning = useCallback((ctx, masterGain) => {
    const sources = [];

    // Brown noise base
    const brownBuf = createBrownNoiseBuffer(ctx, 3);
    const brownSrc = ctx.createBufferSource();
    brownSrc.buffer = brownBuf;
    brownSrc.loop = true;
    const brownFilter = ctx.createBiquadFilter();
    brownFilter.type = 'lowpass';
    brownFilter.frequency.value = 400;
    const brownGain = ctx.createGain();
    brownGain.gain.value = 0.3;
    brownSrc.connect(brownFilter);
    brownFilter.connect(brownGain);
    brownGain.connect(masterGain);
    brownSrc.start();
    sources.push(brownSrc);

    // Birdsong — high-freq oscillators with random interval triggers
    const birdGain = ctx.createGain();
    birdGain.gain.value = 0.15;
    birdGain.connect(masterGain);

    let birdInterval;
    const scheduleBird = () => {
      const birdOsc = ctx.createOscillator();
      birdOsc.type = 'sine';
      birdOsc.frequency.value = 2000 + Math.random() * 3000;
      const birdEnv = ctx.createGain();
      birdEnv.gain.setValueAtTime(0, ctx.currentTime);
      birdEnv.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      birdEnv.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      birdOsc.connect(birdEnv);
      birdEnv.connect(birdGain);
      birdOsc.start();
      birdOsc.stop(ctx.currentTime + 0.35);
      sources.push(birdOsc);
    };
    scheduleBird();
    birdInterval = setInterval(scheduleBird, 1500 + Math.random() * 3000);

    nodesRef.current['forest-morning'] = {
      gain: masterGain,
      sources,
      cleanup: () => clearInterval(birdInterval),
    };
  }, []);

  const startGentleStream = useCallback((ctx, masterGain) => {
    const sources = [];

    // Pink noise with bandpass
    const pinkBuf = createPinkNoiseBuffer(ctx, 3);
    const pinkSrc = ctx.createBufferSource();
    pinkSrc.buffer = pinkBuf;
    pinkSrc.loop = true;
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 800;
    bandpass.Q.value = 1.5;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.25;
    pinkSrc.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(masterGain);
    pinkSrc.start();
    sources.push(pinkSrc);

    // Slow LFO on bandpass frequency
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.3; // very slow
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 300;
    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);
    lfo.start();
    sources.push(lfo);

    nodesRef.current['gentle-stream'] = { gain: masterGain, sources };
  }, []);

  const startSoftRain = useCallback((ctx, masterGain) => {
    const sources = [];

    const whiteBuf = createWhiteNoiseBuffer(ctx, 3);
    const src = ctx.createBufferSource();
    src.buffer = whiteBuf;
    src.loop = true;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 2000;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.2;

    // Gentle amplitude envelope via LFO
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain);
    lfoGain.connect(noiseGain.gain);

    src.connect(lowpass);
    lowpass.connect(noiseGain);
    noiseGain.connect(masterGain);
    src.start();
    lfo.start();
    sources.push(src, lfo);

    nodesRef.current['soft-rain'] = { gain: masterGain, sources };
  }, []);

  const startMagicalGlow = useCallback((ctx, masterGain) => {
    const sources = [];
    // Bell-like sine tones at harmonic intervals with long decay
    const harmonics = [
      { freq: 523.25, delay: 0 },
      { freq: 659.25, delay: 0.8 },
      { freq: 783.99, delay: 1.6 },
      { freq: 1046.5, delay: 2.4 },
      { freq: 1318.5, delay: 3.2 },
    ];

    harmonics.forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, ctx.currentTime + delay);
      env.gain.linearRampToValueAtTime(0.15, ctx.currentTime + delay + 0.1);
      env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 2.5);
      osc.connect(env);
      env.connect(masterGain);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 3);
      sources.push(osc);
    });

    // Repeat the harmonic pattern
    const repeatInterval = setInterval(() => {
      if (ctx.state === 'closed') return;
      harmonics.forEach(({ freq, delay }) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const env = ctx.createGain();
        const t = ctx.currentTime;
        env.gain.setValueAtTime(0, t + delay);
        env.gain.linearRampToValueAtTime(0.12, t + delay + 0.1);
        env.gain.exponentialRampToValueAtTime(0.001, t + delay + 2.5);
        osc.connect(env);
        env.connect(masterGain);
        osc.start(t + delay);
        osc.stop(t + delay + 3);
      });
    }, 5000);

    nodesRef.current['magical-glow'] = {
      gain: masterGain,
      sources,
      cleanup: () => clearInterval(repeatInterval),
    };
  }, []);

  const startCozyFireplace = useCallback((ctx, masterGain) => {
    const sources = [];

    // Brown noise base
    const brownBuf = createBrownNoiseBuffer(ctx, 3);
    const brownSrc = ctx.createBufferSource();
    brownSrc.buffer = brownBuf;
    brownSrc.loop = true;
    const brownGain = ctx.createGain();
    brownGain.gain.value = 0.3;
    brownSrc.connect(brownGain);
    brownGain.connect(masterGain);
    brownSrc.start();
    sources.push(brownSrc);

    // Crackle — random short bursts of higher-freq noise
    const crackleGain = ctx.createGain();
    crackleGain.gain.value = 0.2;
    crackleGain.connect(masterGain);

    const scheduleCrackle = () => {
      const crackleOsc = ctx.createOscillator();
      crackleOsc.type = 'sawtooth';
      crackleOsc.frequency.value = 300 + Math.random() * 1200;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, ctx.currentTime);
      env.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
      env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      crackleOsc.connect(env);
      env.connect(crackleGain);
      crackleOsc.start();
      crackleOsc.stop(ctx.currentTime + 0.1);
      sources.push(crackleOsc);
    };

    const crackleInterval = setInterval(() => {
      if (Math.random() < 0.4) {
        scheduleCrackle();
      }
    }, 200);

    nodesRef.current['cozy-fireplace'] = {
      gain: masterGain,
      sources,
      cleanup: () => clearInterval(crackleInterval),
    };
  }, []);

  const startStarlightLullaby = useCallback((ctx, masterGain) => {
    const sources = [];
    // Soft sine wave chords (root + fifth + octave) with slow tremolo
    const rootFreq = 196; // G3

    const notes = [rootFreq, rootFreq * 1.5, rootFreq * 2]; // root, fifth, octave

    notes.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const noteGain = ctx.createGain();
      noteGain.gain.value = 0.08;

      // Tremolo LFO per note
      const tremolo = ctx.createOscillator();
      tremolo.type = 'sine';
      tremolo.frequency.value = 0.5 + Math.random() * 0.3;
      const tremGain = ctx.createGain();
      tremGain.gain.value = 0.04;
      tremolo.connect(tremGain);
      tremGain.connect(noteGain.gain);
      tremolo.start();

      osc.connect(noteGain);
      noteGain.connect(masterGain);
      osc.start();
      sources.push(osc, tremolo);
    });

    nodesRef.current['starlight-lullaby'] = { gain: masterGain, sources };
  }, []);

  // ──── Play / Pause ────

  const startPreset = useCallback(
    (presetId) => {
      const ctx = getCtx();
      if (!ctx) return;

      // Stop currently playing
      stopAll();

      const masterGain = ctx.createGain();
      masterGain.gain.value = (volumes[presetId] || 50) / 100;
      masterGain.connect(ctx.destination);

      switch (presetId) {
        case 'forest-morning':
          startForestMorning(ctx, masterGain);
          break;
        case 'gentle-stream':
          startGentleStream(ctx, masterGain);
          break;
        case 'soft-rain':
          startSoftRain(ctx, masterGain);
          break;
        case 'magical-glow':
          startMagicalGlow(ctx, masterGain);
          break;
        case 'cozy-fireplace':
          startCozyFireplace(ctx, masterGain);
          break;
        case 'starlight-lullaby':
          startStarlightLullaby(ctx, masterGain);
          break;
        default:
          break;
      }

      setActivePreset(presetId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getCtx, stopAll, volumes]
  );

  const stopPreset = useCallback(() => {
    stopAll();
    setActivePreset(null);
  }, [stopAll]);

  const togglePreset = useCallback(
    (presetId) => {
      if (activePreset === presetId) {
        stopPreset();
      } else {
        startPreset(presetId);
      }
    },
    [activePreset, startPreset, stopPreset]
  );

  // ──── Render ────

  if (!audioSupported) {
    return (
      <main className="flex-1 flex items-center justify-center bg-brand-obsidian">
        <div className="text-center px-6">
          <div className="text-4xl mb-3">🔇</div>
          <p className="text-gray-400">Audio not supported in this browser.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-brand-obsidian">
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-brand-gold">Audio Soundscapes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ambient background sounds generated with procedural audio. Click a card to
            start — only one plays at a time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRESETS.map((preset) => {
            const isActive = activePreset === preset.id;
            const vol = volumes[preset.id] || 50;

            return (
              <div
                key={preset.id}
                className={`bg-brand-charcoal rounded-lg p-5 border transition-colors duration-200 ${
                  isActive ? 'border-brand-gold' : 'border-transparent hover:border-[#2a2a3a]'
                }`}
              >
                {/* Header with emoji + name */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{preset.emoji}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-brand-gold">
                      {preset.name}
                    </h3>
                    <p className="text-xs text-gray-500">{preset.description}</p>
                  </div>
                </div>

                {/* Play/Pause button + volume slider */}
                <div className="flex items-center gap-3">
                  {/* Circular play/pause button */}
                  <button
                    onClick={() => togglePreset(preset.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 flex-shrink-0 ${
                      isActive
                        ? 'border-brand-gold bg-brand-gold text-brand-obsidian'
                        : 'border-brand-gold text-brand-gold hover:bg-brand-gold/10'
                    }`}
                    title={isActive ? 'Stop' : 'Play'}
                  >
                    {isActive ? (
                      /* Pause icon */
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      /* Play icon */
                      <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    )}
                  </button>

                  {/* Volume slider */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={vol}
                    onChange={(e) =>
                      setVolume(preset.id, parseInt(e.target.value, 10))
                    }
                    className="flex-1 h-1 appearance-none bg-[#2a2a3a] rounded-full cursor-pointer"
                    style={{
                      accentColor: '#F5C842',
                    }}
                    title={`Volume: ${vol}%`}
                  />
                  <span className="text-xs text-gray-500 w-8 text-right">
                    {vol}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
