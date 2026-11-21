/**
 * Main Application Controller for Piano Learning App
 */

class PianoApp {
    constructor() {
        this.audio = window.pianoAudio;
        this.midi = window.midiManager;
        
        // App State
        this.activeMidis = new Set();
        this.activeMidiElements = new Map(); // midi -> HTMLElement
        this.keyRange = { start: 36, end: 96 }; // 61 keys: C2 (36) to C7 (96)
        this.octaveShift = 0; // -2 to +2
        this.keyboardKeyMap = new Map(); // keycode/key -> midi
        this.isMouseDown = false;
        this.sustainPedalActive = false;
        this.labelMode = 'notes'; // 'notes', 'solfege', 'keyboard', 'none'
        
        // Recording State
        this.isRecording = false;
        this.recordStartTime = 0;
        this.recordedEvents = [];
        this.savedRecordings = [];

        // Ear Training State
        this.earTrainingCurrentNote = null;
        this.earTrainingScore = 0;
        this.earTrainingStreak = 0;

        // Sight Reading State
        this.sightReadingTargetNote = null;
        this.sightReadingScore = 0;
        this.sightReadingStreak = 0;

        // DOM Elements
        this.pianoContainer = document.getElementById('piano-container');
        this.canvas = document.getElementById('falling-notes-canvas');
        this.staffCanvas = document.getElementById('sheet-music-canvas');
        this.chordDisplay = document.getElementById('active-chord-name');
        this.chordNotesDisplay = document.getElementById('active-chord-notes');

        // Engines
        this.visualizer = new FallingNotesVisualizer(this.canvas, this.pianoContainer);
        this.sheetMusic = new SheetMusicRenderer(this.staffCanvas);

        this.init();
    }

    init() {
        this.buildPianoKeyboard();
        this.setupKeyboardMapping();
        this.setupEvents();
        this.setupVisualizerCallbacks();
        this.setupMidi();
        this.populateSongSelector();
        this.populateScaleAndChordExplorers();
        this.loadRecordingsFromStorage();

        // Initial resize for canvases
        setTimeout(() => {
            this.visualizer.updateKeyPositions();
            this.sheetMusic.resize();
            this.sheetMusic.render();
        }, 100);

        window.addEventListener('resize', () => {
            this.visualizer.updateKeyPositions();
            this.sheetMusic.resize();
            this.sheetMusic.render(Array.from(this.activeMidis));
        });
    }

    // Build responsive on-screen piano keys
    buildPianoKeyboard() {
        this.pianoContainer.innerHTML = '';
        this.activeMidiElements.clear();

        const startMidi = this.keyRange.start;
        const endMidi = this.keyRange.end;

        const whiteKeysWrapper = document.createElement('div');
        whiteKeysWrapper.className = 'piano-white-keys';

        const blackKeysWrapper = document.createElement('div');
        blackKeysWrapper.className = 'piano-black-keys';

        for (let midi = startMidi; midi <= endMidi; midi++) {
            const isBlack = MusicTheory.isBlackKey(midi);
            const keyEl = document.createElement('div');
            keyEl.className = `piano-key ${isBlack ? 'black' : 'white'}`;
            keyEl.dataset.midi = midi;

            // Middle C highlight indicator
            if (midi === 60) {
                keyEl.classList.add('middle-c');
            }

            const labelEl = document.createElement('span');
            labelEl.className = 'key-label';
            keyEl.appendChild(labelEl);

            if (isBlack) {
                // Determine black key positioning relative to preceding white key
                blackKeysWrapper.appendChild(keyEl);
            } else {
                whiteKeysWrapper.appendChild(keyEl);
            }

            this.activeMidiElements.set(midi, keyEl);
        }

        this.pianoContainer.appendChild(whiteKeysWrapper);
        this.pianoContainer.appendChild(blackKeysWrapper);

        this.positionBlackKeys();
        this.updateKeyLabels();
    }

    positionBlackKeys() {
        // Calculate exact horizontal positions of black keys overlaying white keys
        const whiteKeys = this.pianoContainer.querySelectorAll('.piano-key.white');
        const blackKeys = this.pianoContainer.querySelectorAll('.piano-key.black');

        requestAnimationFrame(() => {
            const containerRect = this.pianoContainer.getBoundingClientRect();
            if (containerRect.width === 0) return;

            blackKeys.forEach(blackKey => {
                const midi = parseInt(blackKey.dataset.midi, 10);
                // Preceding white key is midi - 1
                const prevWhiteKey = this.activeMidiElements.get(midi - 1);
                if (prevWhiteKey) {
                    const whiteRect = prevWhiteKey.getBoundingClientRect();
                    const leftOffset = whiteRect.right - containerRect.left;
                    blackKey.style.left = `${leftOffset}px`;
                }
            });

            this.visualizer.updateKeyPositions();
        });
    }

    setupKeyboardMapping() {
        // Two full octaves mapped to computer keyboard
        // Lower octave (C3 to B3):
        // Z S X D C V G B H N J M
        // Upper octave (C4 to E5):
        // Q 2 W 3 E R 5 T 6 Y 7 U I 9 O 0 P
        this.baseComputerMap = {
            // Octave 3 (Bass)
            'KeyZ': 48, // C3
            'KeyS': 49, // C#3
            'KeyX': 50, // D3
            'KeyD': 51, // D#3
            'KeyC': 52, // E3
            'KeyV': 53, // F3
            'KeyG': 54, // F#3
            'KeyB': 55, // G3
            'KeyH': 56, // G#3
            'KeyN': 57, // A3
            'KeyJ': 58, // A#3
            'KeyM': 59, // B3

            // Octave 4 & 5 (Middle C is Q)
            'KeyQ': 60, // C4 (Middle C)
            'Digit2': 61, // C#4
            'KeyW': 62, // D4
            'Digit3': 63, // D#4
            'KeyE': 64, // E4
            'KeyR': 65, // F4
            'Digit5': 66, // F#4
            'KeyT': 67, // G4
            'Digit6': 68, // G#4
            'KeyY': 69, // A4 (440Hz)
            'Digit7': 70, // A#4
            'KeyU': 71, // B4
            'KeyI': 72, // C5
            'Digit9': 73, // C#5
            'KeyO': 74, // D5
            'Digit0': 75, // D#5
            'KeyP': 76, // E5
            'BracketLeft': 77, // F5
            'Equal': 78, // F#5
            'BracketRight': 79 // G5
        };
    }

    getMidiForKeyboardCode(code) {
        const base = this.baseComputerMap[code];
        if (base === undefined) return null;
        return base + (this.octaveShift * 12);
    }

    getKeyboardShortcutForMidi(midi) {
        const shiftedMidi = midi - (this.octaveShift * 12);
        for (const [code, val] of Object.entries(this.baseComputerMap)) {
            if (val === shiftedMidi) {
                // Clean display label (e.g. KeyQ -> Q, Digit2 -> 2)
                return code.replace('Key', '').replace('Digit', '').replace('BracketLeft', '[').replace('BracketRight', ']').replace('Equal', '=');
            }
        }
        return '';
    }

    updateKeyLabels() {
        this.activeMidiElements.forEach((el, midi) => {
            const labelEl = el.querySelector('.key-label');
            if (!labelEl) return;

            if (this.labelMode === 'notes') {
                labelEl.textContent = MusicTheory.midiToNoteName(midi);
            } else if (this.labelMode === 'solfege') {
                labelEl.textContent = MusicTheory.getSolfege(midi);
            } else if (this.labelMode === 'keyboard') {
                const shortcut = this.getKeyboardShortcutForMidi(midi);
                labelEl.textContent = shortcut;
            } else {
                labelEl.textContent = '';
            }
        });
    }

    setupEvents() {
        // 1. Mouse & Touch Events on Virtual Piano (supports dragging/glissando)
        this.pianoContainer.addEventListener('mousedown', (e) => {
            const key = e.target.closest('.piano-key');
            if (!key) return;
            this.isMouseDown = true;
            const midi = parseInt(key.dataset.midi, 10);
            this.triggerNoteOn(midi, 0.85);
        });

        window.addEventListener('mouseup', () => {
            if (this.isMouseDown) {
                this.isMouseDown = false;
                Array.from(this.activeMidis).forEach(midi => this.triggerNoteOff(midi));
            }
        });

        this.pianoContainer.addEventListener('mouseover', (e) => {
            if (!this.isMouseDown) return;
            const key = e.target.closest('.piano-key');
            if (!key) return;
            const midi = parseInt(key.dataset.midi, 10);
            if (!this.activeMidis.has(midi)) {
                this.triggerNoteOn(midi, 0.85);
            }
        });

        this.pianoContainer.addEventListener('mouseout', (e) => {
            if (!this.isMouseDown) return;
            const key = e.target.closest('.piano-key');
            if (!key) return;
            const midi = parseInt(key.dataset.midi, 10);
            this.triggerNoteOff(midi);
        });

        // Touch support for mobile / tablets
        this.pianoContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                const key = target ? target.closest('.piano-key') : null;
                if (key) {
                    const midi = parseInt(key.dataset.midi, 10);
                    this.triggerNoteOn(midi, 0.85);
                }
            }
        }, { passive: false });

        this.pianoContainer.addEventListener('touchend', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                const key = target ? target.closest('.piano-key') : null;
                if (key) {
                    const midi = parseInt(key.dataset.midi, 10);
                    this.triggerNoteOff(midi);
                }
            }
        });

        // 2. Computer Keyboard Events
        window.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

            // Sustain pedal with Spacebar
            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault();
                this.toggleSustainPedal(true);
                return;
            }

            // Octave shift shortcuts: [Z / X with shift or - / +]
            if (e.key === '-' || e.key === '_') {
                this.changeOctaveShift(-1);
                return;
            }
            if (e.key === '=' || e.key === '+') {
                this.changeOctaveShift(1);
                return;
            }

            if (e.repeat) return;

            const midi = this.getMidiForKeyboardCode(e.code);
            if (midi !== null) {
                e.preventDefault();
                this.triggerNoteOn(midi, 0.85);
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                this.toggleSustainPedal(false);
                return;
            }

            const midi = this.getMidiForKeyboardCode(e.code);
            if (midi !== null) {
                this.triggerNoteOff(midi);
            }
        });

        // 3. UI Navigation Tabs
        const tabButtons = document.querySelectorAll('.nav-tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // 4. Volume, Reverb & Sustain Controls
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.audio.setVolume(parseFloat(e.target.value));
            });
        }

        const reverbSlider = document.getElementById('reverb-slider');
        if (reverbSlider) {
            reverbSlider.addEventListener('input', (e) => {
                this.audio.setReverb(parseFloat(e.target.value));
            });
        }

        const sustainBtn = document.getElementById('sustain-pedal-btn');
        if (sustainBtn) {
            sustainBtn.addEventListener('click', () => {
                this.toggleSustainPedal(!this.sustainPedalActive);
            });
        }

        // Octave shift buttons
        document.getElementById('octave-down-btn')?.addEventListener('click', () => this.changeOctaveShift(-1));
        document.getElementById('octave-up-btn')?.addEventListener('click', () => this.changeOctaveShift(1));

        // Key label dropdown
        document.getElementById('label-mode-select')?.addEventListener('change', (e) => {
            this.labelMode = e.target.value;
            this.updateKeyLabels();
        });

        // Keyboard range select (36, 61, 88 keys)
        document.getElementById('key-range-select')?.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === '36') {
                this.keyRange = { start: 48, end: 84 }; // C3 - C6
            } else if (val === '61') {
                this.keyRange = { start: 36, end: 96 }; // C2 - C7
            } else if (val === '88') {
                this.keyRange = { start: 21, end: 108 }; // A0 - C8 (Full Grand Piano)
            }
            this.buildPianoKeyboard();
        });

        // Song visualizer controls
        document.getElementById('play-song-btn')?.addEventListener('click', () => this.playSong());
        document.getElementById('pause-song-btn')?.addEventListener('click', () => this.pauseSong());
        document.getElementById('restart-song-btn')?.addEventListener('click', () => this.restartSong());
        
        document.getElementById('song-mode-select')?.addEventListener('change', (e) => {
            this.visualizer.mode = e.target.value;
        });

        document.getElementById('song-speed-slider')?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.visualizer.speed = val;
            const display = document.getElementById('song-speed-val');
            if (display) display.textContent = `${val.toFixed(1)}x`;
        });

        document.getElementById('song-hand-select')?.addEventListener('change', (e) => {
            this.visualizer.selectedHand = e.target.value;
            this.visualizer.reset();
        });

        // Record controls
        document.getElementById('record-btn')?.addEventListener('click', () => this.toggleRecording());
        document.getElementById('play-recording-btn')?.addEventListener('click', () => this.playUserRecording());

        // Ear Training Buttons
        document.getElementById('ear-play-note-btn')?.addEventListener('click', () => this.startEarTrainingRound());
        document.getElementById('ear-replay-btn')?.addEventListener('click', () => this.replayEarTrainingNote());

        // Sight Reading Buttons
        document.getElementById('sight-next-btn')?.addEventListener('click', () => this.startSightReadingRound());
    }

    setupVisualizerCallbacks() {
        this.visualizer.onScoreUpdate = (stats) => {
            document.getElementById('stat-score').textContent = stats.score;
            document.getElementById('stat-streak').textContent = `${stats.streak}🔥`;
            document.getElementById('stat-multiplier').textContent = `${stats.multiplier}x`;
            const accuracy = stats.totalCount > 0 ? Math.round((stats.hitCount / stats.totalCount) * 100) : 100;
            document.getElementById('stat-accuracy').textContent = `${accuracy}%`;
        };

        this.visualizer.onTargetNotesChange = (targetMidis) => {
            // Highlight target notes in golden amber glow on virtual keys
            this.activeMidiElements.forEach((el, midi) => {
                if (targetMidis.includes(midi)) {
                    el.classList.add('target-key');
                } else {
                    el.classList.remove('target-key');
                }
            });
            this.sheetMusic.render(Array.from(this.activeMidis), targetMidis);
        };

        this.visualizer.onAutoplayNote = (midi, duration) => {
            this.triggerNoteOn(midi, 0.75, false);
            setTimeout(() => {
                this.triggerNoteOff(midi, false);
            }, duration * 1000);
        };

        this.visualizer.onSongComplete = (summary) => {
            alert(`🎉 Song Completed!\nFinal Score: ${summary.score}\nAccuracy: ${summary.accuracy}% (${summary.hitCount}/${summary.totalCount} notes)`);
            document.getElementById('play-song-btn').innerHTML = '<span>▶</span> Play';
        };
    }

    setupMidi() {
        this.midi.onNoteOn = (midi, velocity) => {
            this.triggerNoteOn(midi, velocity);
        };

        this.midi.onNoteOff = (midi) => {
            this.triggerNoteOff(midi);
        };

        this.midi.onPedalChange = (isDown) => {
            this.toggleSustainPedal(isDown);
        };

        this.midi.onDeviceStatusChange = (statusObj) => {
            const badge = document.getElementById('midi-status-badge');
            if (!badge) return;

            if (statusObj.status === 'connected') {
                const devName = statusObj.devices[0]?.name || 'MIDI Keyboard';
                badge.className = 'status-badge connected';
                badge.innerHTML = `<span class="dot"></span> MIDI Connected: <strong>${devName}</strong>`;
            } else if (statusObj.status === 'unsupported') {
                badge.className = 'status-badge error';
                badge.innerHTML = `<span class="dot"></span> Web MIDI Unavailable`;
            } else {
                badge.className = 'status-badge disconnected';
                badge.innerHTML = `<span class="dot"></span> No MIDI Devices (Connect USB/BT)`;
            }
        };

        // Try initializing Web MIDI
        this.midi.init();
    }

    triggerNoteOn(midi, velocity = 0.8, checkVisualizer = true) {
        this.audio.playNote(midi, velocity);
        this.activeMidis.add(midi);

        // Highlight piano key
        const keyEl = this.activeMidiElements.get(midi);
        if (keyEl) {
            keyEl.classList.add('active');
        }

        // Hit detection in game mode
        if (checkVisualizer) {
            this.visualizer.handleUserKeyPress(midi);
        }

        // Check Ear Training answer
        if (this.earTrainingCurrentNote !== null) {
            this.checkEarTrainingAnswer(midi);
        }

        // Check Sight Reading answer
        if (this.sightReadingTargetNote !== null) {
            this.checkSightReadingAnswer(midi);
        }

        // Recording
        if (this.isRecording) {
            this.recordedEvents.push({
                type: 'noteOn',
                midi: midi,
                time: (performance.now() - this.recordStartTime) / 1000,
                velocity: velocity
            });
        }

        this.updateChordDisplay();
        this.sheetMusic.render(Array.from(this.activeMidis));
    }

    triggerNoteOff(midi, checkVisualizer = true) {
        this.audio.stopNote(midi);
        this.activeMidis.delete(midi);

        const keyEl = this.activeMidiElements.get(midi);
        if (keyEl) {
            keyEl.classList.remove('active');
        }

        if (this.isRecording) {
            this.recordedEvents.push({
                type: 'noteOff',
                midi: midi,
                time: (performance.now() - this.recordStartTime) / 1000
            });
        }

        this.updateChordDisplay();
        this.sheetMusic.render(Array.from(this.activeMidis));
    }

    toggleSustainPedal(isDown) {
        this.sustainPedalActive = isDown;
        this.audio.setSustainPedal(isDown);
        const btn = document.getElementById('sustain-pedal-btn');
        if (btn) {
            if (isDown) {
                btn.classList.add('pedal-active');
            } else {
                btn.classList.remove('pedal-active');
            }
        }
    }

    changeOctaveShift(delta) {
        this.octaveShift = Math.max(-2, Math.min(2, this.octaveShift + delta));
        const display = document.getElementById('octave-display');
        if (display) {
            const sign = this.octaveShift > 0 ? `+${this.octaveShift}` : `${this.octaveShift}`;
            display.textContent = `Octave: ${sign}`;
        }
        this.updateKeyLabels();
    }

    updateChordDisplay() {
        const activeArray = Array.from(this.activeMidis);
        const chord = MusicTheory.identifyChord(activeArray);

        if (chord) {
            this.chordDisplay.textContent = chord.name;
            const noteNames = chord.notes.map(m => MusicTheory.midiToNoteName(m)).join(' - ');
            this.chordNotesDisplay.textContent = noteNames;
        } else {
            this.chordDisplay.textContent = 'Play keys to detect chord';
            this.chordNotesDisplay.textContent = '---';
        }
    }

    switchTab(tabId) {
        document.querySelectorAll('.nav-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        document.querySelectorAll('.tab-content-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `tab-${tabId}`);
        });

        if (tabId === 'songs') {
            this.visualizer.updateKeyPositions();
        } else if (tabId === 'sheet-music') {
            this.sheetMusic.resize();
            this.startSightReadingRound();
        } else if (tabId === 'ear-training') {
            this.startEarTrainingRound();
        }
    }

    // Song Selection & Player
    populateSongSelector() {
        const select = document.getElementById('song-selector');
        if (!select) return;

        select.innerHTML = '';
        SONGS_DATABASE.forEach(song => {
            const opt = document.createElement('option');
            opt.value = song.id;
            opt.textContent = `${song.title} (${song.difficulty})`;
            select.appendChild(opt);
        });

        select.addEventListener('change', () => {
            const selectedSong = SONGS_DATABASE.find(s => s.id === select.value);
            if (selectedSong) {
                this.loadSong(selectedSong);
            }
        });

        // Load first song by default
        if (SONGS_DATABASE.length > 0) {
            this.loadSong(SONGS_DATABASE[0]);
        }
    }

    loadSong(song) {
        this.visualizer.setSong(song);
        document.getElementById('song-info-title').textContent = song.title;
        document.getElementById('song-info-composer').textContent = song.composer;
        document.getElementById('song-info-key').textContent = song.key;
        document.getElementById('song-info-difficulty').textContent = song.difficulty;
        document.getElementById('song-info-desc').textContent = song.description;
        document.getElementById('play-song-btn').innerHTML = '<span>▶</span> Play';
    }

    playSong() {
        this.visualizer.start();
        document.getElementById('play-song-btn').innerHTML = '<span>❚❚</span> Playing...';
    }

    pauseSong() {
        this.visualizer.pause();
        document.getElementById('play-song-btn').innerHTML = '<span>▶</span> Resume';
    }

    restartSong() {
        this.visualizer.reset();
        this.playSong();
    }

    // Chords and Scales Explorer
    populateScaleAndChordExplorers() {
        // Root Notes
        const rootSelectChord = document.getElementById('chord-root-select');
        const rootSelectScale = document.getElementById('scale-root-select');
        const chordTypeSelect = document.getElementById('chord-type-select');
        const scaleTypeSelect = document.getElementById('scale-type-select');

        NOTE_NAMES.forEach(name => {
            const opt1 = document.createElement('option');
            opt1.value = name;
            opt1.textContent = name;
            rootSelectChord.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = name;
            opt2.textContent = name;
            rootSelectScale.appendChild(opt2);
        });

        // Chord types
        MusicTheory.CHORD_DEFINITIONS.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.name;
            opt.textContent = `${c.name} (${c.symbol || 'maj'})`;
            chordTypeSelect.appendChild(opt);
        });

        // Scale types
        MusicTheory.SCALE_DEFINITIONS.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = s.name;
            scaleTypeSelect.appendChild(opt);
        });

        // Event listeners for explorer preview
        const updateChordView = () => {
            const root = rootSelectChord.value;
            const type = chordTypeSelect.value;
            const notes = MusicTheory.getChordNotes(root, type, 4);
            this.highlightExplorerNotes(notes);

            const chordDef = MusicTheory.CHORD_DEFINITIONS.find(c => c.name.toLowerCase() === type.toLowerCase());
            document.getElementById('chord-formula-display').textContent = `Intervals: ${chordDef ? chordDef.intervals.join(' - ') : ''}`;
            document.getElementById('chord-notes-list').textContent = `Notes: ${notes.map(m => MusicTheory.midiToNoteName(m)).join(', ')}`;
        };

        const updateScaleView = () => {
            const root = rootSelectScale.value;
            const scaleId = scaleTypeSelect.value;
            const notes = MusicTheory.getScaleNotes(root, scaleId, 4, 8);
            this.highlightExplorerNotes(notes);

            const scaleDef = MusicTheory.SCALE_DEFINITIONS.find(s => s.id === scaleId);
            document.getElementById('scale-desc-display').textContent = scaleDef ? scaleDef.desc : '';
            document.getElementById('scale-notes-list').textContent = `Notes: ${notes.map(m => MusicTheory.midiToNoteName(m)).join(', ')}`;
        };

        rootSelectChord.addEventListener('change', updateChordView);
        chordTypeSelect.addEventListener('change', updateChordView);
        rootSelectScale.addEventListener('change', updateScaleView);
        scaleTypeSelect.addEventListener('change', updateScaleView);

        // Play Chord / Arpeggio buttons
        document.getElementById('play-chord-btn')?.addEventListener('click', () => {
            const root = rootSelectChord.value;
            const type = chordTypeSelect.value;
            const notes = MusicTheory.getChordNotes(root, type, 4);
            notes.forEach(midi => this.triggerNoteOn(midi, 0.8, false));
            setTimeout(() => {
                notes.forEach(midi => this.triggerNoteOff(midi, false));
            }, 1200);
        });

        document.getElementById('play-scale-btn')?.addEventListener('click', () => {
            const root = rootSelectScale.value;
            const scaleId = scaleTypeSelect.value;
            const notes = MusicTheory.getScaleNotes(root, scaleId, 4, 8);
            notes.forEach((midi, idx) => {
                setTimeout(() => {
                    this.triggerNoteOn(midi, 0.8, false);
                    setTimeout(() => this.triggerNoteOff(midi, false), 320);
                }, idx * 350);
            });
        });

        updateChordView();
    }

    highlightExplorerNotes(notes) {
        this.activeMidiElements.forEach((el, midi) => {
            if (notes.includes(midi)) {
                el.classList.add('explorer-highlight');
            } else {
                el.classList.remove('explorer-highlight');
            }
        });
        this.sheetMusic.render([], notes);
    }

    // Ear Training
    startEarTrainingRound() {
        // Random note between C4 (60) and C5 (72)
        const note = 60 + Math.floor(Math.random() * 13);
        this.earTrainingCurrentNote = note;
        document.getElementById('ear-feedback-msg').textContent = '🎵 Listen carefully... click the matching key!';
        document.getElementById('ear-feedback-msg').className = 'feedback-neutral';
        this.replayEarTrainingNote();
    }

    replayEarTrainingNote() {
        if (this.earTrainingCurrentNote !== null) {
            this.audio.playNote(this.earTrainingCurrentNote, 0.85);
            setTimeout(() => {
                this.audio.stopNote(this.earTrainingCurrentNote);
            }, 900);
        }
    }

    checkEarTrainingAnswer(midi) {
        if (this.earTrainingCurrentNote === null) return;

        const target = this.earTrainingCurrentNote;
        const msgEl = document.getElementById('ear-feedback-msg');

        if (midi === target) {
            this.earTrainingScore += 100;
            this.earTrainingStreak++;
            msgEl.textContent = `✅ CORRECT! It was ${MusicTheory.midiToNoteName(target)}!`;
            msgEl.className = 'feedback-success';
            document.getElementById('ear-score').textContent = this.earTrainingScore;
            document.getElementById('ear-streak').textContent = this.earTrainingStreak;
            this.earTrainingCurrentNote = null;
            setTimeout(() => this.startEarTrainingRound(), 1500);
        } else {
            this.earTrainingStreak = 0;
            const diff = midi - target;
            const hint = diff > 0 ? 'too high' : 'too low';
            msgEl.textContent = `❌ Not quite! That was ${hint}. Try again!`;
            msgEl.className = 'feedback-error';
            document.getElementById('ear-streak').textContent = 0;
        }
    }

    // Sight Reading Trainer (Musical Staff Flashcards)
    startSightReadingRound() {
        // Random note in treble clef: C4 (60) to G5 (79)
        const note = 60 + Math.floor(Math.random() * 20);
        this.sightReadingTargetNote = note;
        document.getElementById('sight-reading-msg').textContent = 'Find and play this note on the piano!';
        document.getElementById('sight-reading-msg').className = 'feedback-neutral';
        this.sheetMusic.render([], [note]);
    }

    checkSightReadingAnswer(midi) {
        if (this.sightReadingTargetNote === null) return;

        const target = this.sightReadingTargetNote;
        const msgEl = document.getElementById('sight-reading-msg');

        if (midi === target) {
            this.sightReadingScore += 100;
            this.sightReadingStreak++;
            msgEl.textContent = `🎯 Excellent! That was ${MusicTheory.midiToNoteName(target)}!`;
            msgEl.className = 'feedback-success';
            document.getElementById('sight-score').textContent = this.sightReadingScore;
            document.getElementById('sight-streak').textContent = this.sightReadingStreak;
            this.sightReadingTargetNote = null;
            setTimeout(() => this.startSightReadingRound(), 1400);
        } else {
            this.sightReadingStreak = 0;
            msgEl.textContent = `❌ Played ${MusicTheory.midiToNoteName(midi)}. Keep looking!`;
            msgEl.className = 'feedback-error';
            document.getElementById('sight-streak').textContent = 0;
        }
    }

    // Recording & Playback
    toggleRecording() {
        const btn = document.getElementById('record-btn');
        if (!this.isRecording) {
            this.isRecording = true;
            this.recordStartTime = performance.now();
            this.recordedEvents = [];
            btn.innerHTML = '<span class="rec-dot pulsing"></span> Stop Recording';
            btn.classList.add('recording-active');
        } else {
            this.isRecording = false;
            btn.innerHTML = '<span class="rec-dot"></span> Record Performance';
            btn.classList.remove('recording-active');

            if (this.recordedEvents.length > 0) {
                const title = prompt('Enter a name for your recording:', `My Song ${new Date().toLocaleTimeString()}`);
                if (title) {
                    const recording = {
                        id: 'rec_' + Date.now(),
                        title: title,
                        date: new Date().toLocaleDateString(),
                        events: this.recordedEvents
                    };
                    this.savedRecordings.unshift(recording);
                    this.saveRecordingsToStorage();
                    this.updateRecordingsList();
                }
            }
        }
    }

    saveRecordingsToStorage() {
        try {
            localStorage.setItem('piano_recordings', JSON.stringify(this.savedRecordings));
        } catch (e) {
            console.warn('LocalStorage save failed:', e);
        }
    }

    loadRecordingsFromStorage() {
        try {
            const data = localStorage.getItem('piano_recordings');
            if (data) {
                this.savedRecordings = JSON.parse(data);
                this.updateRecordingsList();
            }
        } catch (e) {}
    }

    updateRecordingsList() {
        const container = document.getElementById('saved-recordings-list');
        if (!container) return;
        container.innerHTML = '';

        if (this.savedRecordings.length === 0) {
            container.innerHTML = '<div class="empty-state">No saved recordings yet. Click "Record Performance" to create one!</div>';
            return;
        }

        this.savedRecordings.forEach((rec, idx) => {
            const item = document.createElement('div');
            item.className = 'recording-item';
            item.innerHTML = `
                <div class="rec-info">
                    <strong>${rec.title}</strong>
                    <span>${rec.date} • ${rec.events.length} notes</span>
                </div>
                <div class="rec-actions">
                    <button class="btn btn-secondary btn-sm play-rec-btn" data-index="${idx}">▶ Play</button>
                    <button class="btn btn-danger btn-sm del-rec-btn" data-index="${idx}">✕</button>
                </div>
            `;
            container.appendChild(item);
        });

        container.querySelectorAll('.play-rec-btn').forEach(b => {
            b.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index, 10);
                this.playRecordedEvents(this.savedRecordings[idx].events);
            });
        });

        container.querySelectorAll('.del-rec-btn').forEach(b => {
            b.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index, 10);
                this.savedRecordings.splice(idx, 1);
                this.saveRecordingsToStorage();
                this.updateRecordingsList();
            });
        });
    }

    playRecordedEvents(events) {
        if (!events || events.length === 0) return;
        events.forEach(evt => {
            setTimeout(() => {
                if (evt.type === 'noteOn') {
                    this.triggerNoteOn(evt.midi, evt.velocity || 0.8, false);
                } else if (evt.type === 'noteOff') {
                    this.triggerNoteOff(evt.midi, false);
                }
            }, evt.time * 1000);
        });
    }
}

// Instantiate App on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    window.pianoApp = new PianoApp();
});
