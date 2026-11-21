/**
 * Piano Sound Engine using Web Audio API
 * Realistic acoustic piano synthesis using multi-harmonic additive synthesis,
 * dynamic hammer strike excitation, frequency-dependent damping, and synthetic convolution reverb.
 */

class PianoAudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.reverbNode = null;
        this.reverbGain = null;
        this.dryGain = null;
        this.compressor = null;
        
        this.activeVoices = new Map(); // midiNote -> array of active oscillators / gain nodes
        this.sustainPedal = false;
        this.sustainedNotes = new Set(); // notes being held by sustain pedal
        
        this.masterVolume = 0.8;
        this.reverbAmount = 0.35;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();

        // Dynamics compressor to prevent distortion during rich polyphonic chords
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(10, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

        // Dry & Wet (Reverb) paths
        this.dryGain = this.ctx.createGain();
        this.dryGain.gain.setValueAtTime(1.0 - this.reverbAmount * 0.5, this.ctx.currentTime);

        this.reverbGain = this.ctx.createGain();
        this.reverbGain.gain.setValueAtTime(this.reverbAmount, this.ctx.currentTime);

        // Generate synthetic acoustic piano impulse response (Concert Hall / Studio resonance)
        this.reverbNode = this.ctx.createConvolver();
        this.reverbNode.buffer = this.buildPianoImpulseResponse(2.2, 2.5);

        // Routing:
        // Sources -> Compressor -> dryGain -> masterGain -> destination
        //                       -> reverbNode -> reverbGain -> masterGain
        this.compressor.connect(this.dryGain);
        this.dryGain.connect(this.masterGain);

        this.compressor.connect(this.reverbNode);
        this.reverbNode.connect(this.reverbGain);
        this.reverbGain.connect(this.masterGain);

        this.masterGain.connect(this.ctx.destination);
        this.initialized = true;
    }

    /**
     * Generates a warm, natural concert hall acoustic impulse response
     */
    buildPianoImpulseResponse(duration, decay) {
        const rate = this.ctx.sampleRate;
        const length = Math.floor(rate * duration);
        const impulse = this.ctx.createBuffer(2, length, rate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const t = i / rate;
            // Exponential decay envelope with slight initial room reflections
            const envelope = Math.exp(-decay * t);
            // Low-pass filtered noise for warm wooden soundboard acoustics
            const noiseL = (Math.random() * 2 - 1) * envelope;
            const noiseR = (Math.random() * 2 - 1) * envelope;

            left[i] = noiseL;
            right[i] = noiseR;
        }

        return impulse;
    }

    ensureContext() {
        if (!this.initialized) {
            this.init();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setVolume(val) {
        this.masterVolume = Math.max(0, Math.min(1, val));
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
        }
    }

    setReverb(val) {
        this.reverbAmount = Math.max(0, Math.min(1, val));
        if (this.reverbGain && this.dryGain && this.ctx) {
            this.reverbGain.gain.setTargetAtTime(this.reverbAmount, this.ctx.currentTime, 0.05);
            this.dryGain.gain.setTargetAtTime(1.0 - this.reverbAmount * 0.4, this.ctx.currentTime, 0.05);
        }
    }

    setSustainPedal(isDown) {
        this.sustainPedal = isDown;
        if (!isDown) {
            // Release all notes that were kept ringing by the pedal
            const notesToRelease = Array.from(this.sustainedNotes);
            this.sustainedNotes.clear();
            notesToRelease.forEach(note => this.stopNote(note, true));
        }
    }

    midiToFrequency(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    /**
     * Synthesize acoustic piano note
     * Uses additive synthesis with harmonics + hammer strike transient
     * @param {number} midi - MIDI note number (21 = A0, 60 = C4, 108 = C8)
     * @param {number} velocity - 0 to 1
     */
    playNote(midi, velocity = 0.75) {
        this.ensureContext();
        if (midi < 21 || midi > 108) return;

        // If note is already playing, gracefully fade it out before starting new one
        if (this.activeVoices.has(midi)) {
            this.stopNote(midi, true);
        }

        const now = this.ctx.currentTime;
        const freq = this.midiToFrequency(midi);
        const voiceNodes = [];

        // Voice master gain for this note
        const voiceGain = this.ctx.createGain();
        voiceGain.connect(this.compressor);

        // Velocity affects amplitude and harmonic brightness
        const gainVal = Math.pow(velocity, 1.3) * 0.6;
        voiceGain.gain.setValueAtTime(gainVal, now);

        // 1. Hammer strike mechanical transient (short impulse for percussive attack)
        const hammerBufSize = Math.floor(this.ctx.sampleRate * 0.025); // 25ms
        const hammerBuf = this.ctx.createBuffer(1, hammerBufSize, this.ctx.sampleRate);
        const hammerData = hammerBuf.getChannelData(0);
        for (let i = 0; i < hammerBufSize; i++) {
            hammerData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (hammerBufSize * 0.2));
        }
        const hammerSource = this.ctx.createBufferSource();
        hammerSource.buffer = hammerBuf;

        // Bandpass filter centered around fundamental/attack
        const hammerFilter = this.ctx.createBiquadFilter();
        hammerFilter.type = 'bandpass';
        hammerFilter.frequency.setValueAtTime(Math.min(freq * 2.5, 6000), now);
        hammerFilter.Q.setValueAtTime(2.0, now);

        const hammerGain = this.ctx.createGain();
        hammerGain.gain.setValueAtTime(0.25 * velocity, now);

        hammerSource.connect(hammerFilter);
        hammerFilter.connect(hammerGain);
        hammerGain.connect(voiceGain);

        hammerSource.start(now);
        hammerSource.stop(now + 0.03);

        // 2. Multi-harmonic string synthesis
        // Lower notes have more audible harmonics; higher notes have fewer and faster decays.
        const harmonicWeights = [
            { mult: 1.0,  amp: 1.0,   decayMult: 1.0 },
            { mult: 2.0,  amp: 0.55 * (0.8 + velocity * 0.4),  decayMult: 0.8 },
            { mult: 3.0,  amp: 0.28 * (0.6 + velocity * 0.5),  decayMult: 0.65 },
            { mult: 4.0,  amp: 0.16 * (0.5 + velocity * 0.6),  decayMult: 0.5 },
            { mult: 5.0,  amp: 0.09 * (0.4 + velocity * 0.7),  decayMult: 0.4 },
            { mult: 6.0,  amp: 0.04 * (0.3 + velocity * 0.8),  decayMult: 0.3 }
        ];

        // Overall sustain time decreases for higher pitch keys (bass rings out for 4-6s, trebles ~1.5s)
        const baseDecayTime = Math.max(1.2, 5.0 - (midi - 21) * 0.045);

        harmonicWeights.forEach(h => {
            const osc = this.ctx.createOscillator();
            const hGain = this.ctx.createGain();

            // Slight detune for natural acoustic chorus/beating of triple strings
            const detuneCents = (Math.random() - 0.5) * 3.5;
            osc.frequency.setValueAtTime(freq * h.mult, now);
            osc.detune.setValueAtTime(detuneCents, now);
            osc.type = 'triangle'; // triangle has soft odd harmonics, perfect base for piano strings

            // ADSR Envelope
            const attackTime = 0.003 + (108 - midi) * 0.00004; // 3-7ms attack
            const decayTime = baseDecayTime * h.decayMult;

            hGain.gain.setValueAtTime(0.0001, now);
            hGain.gain.linearRampToValueAtTime(h.amp, now + attackTime);
            hGain.gain.exponentialRampToValueAtTime(h.amp * 0.25, now + attackTime + 0.3);
            hGain.gain.exponentialRampToValueAtTime(0.0001, now + attackTime + decayTime);

            osc.connect(hGain);
            hGain.connect(voiceGain);

            osc.start(now);
            osc.stop(now + attackTime + decayTime + 0.1);

            voiceNodes.push(osc);
        });

        // Store active voice
        this.activeVoices.set(midi, {
            gainNode: voiceGain,
            nodes: voiceNodes,
            startTime: now,
            midi: midi
        });

        return voiceGain;
    }

    /**
     * Stop/Release a piano note (damper touches strings)
     */
    stopNote(midi, force = false) {
        if (this.sustainPedal && !force) {
            // Keep note held until pedal is released
            this.sustainedNotes.add(midi);
            return;
        }

        const voice = this.activeVoices.get(midi);
        if (!voice || !this.ctx) return;

        const now = this.ctx.currentTime;
        const gainNode = voice.gainNode;

        // Acoustic release: damper falls on strings, taking ~120-180ms to damp vibrations
        const releaseTime = 0.15;
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(Math.max(gainNode.gain.value, 0.0001), now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);

        // Schedule cleanup
        setTimeout(() => {
            try {
                gainNode.disconnect();
                voice.nodes.forEach(n => {
                    try { n.stop(); n.disconnect(); } catch (e) {}
                });
            } catch (e) {}
            if (this.activeVoices.get(midi) === voice) {
                this.activeVoices.delete(midi);
            }
        }, releaseTime * 1000 + 50);

        this.sustainedNotes.delete(midi);
    }

    /**
     * Stop all active notes immediately
     */
    stopAllNotes() {
        this.activeVoices.forEach((voice, midi) => {
            this.stopNote(midi, true);
        });
        this.activeVoices.clear();
        this.sustainedNotes.clear();
    }
}

// Global audio engine singleton
window.pianoAudio = new PianoAudioEngine();
