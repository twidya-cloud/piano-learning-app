/**
 * Music Theory, Scales, Chord Recognition, and Sheet Music Staff Engine
 */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const SOLFEGE = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];

class MusicTheory {
    static midiToNoteName(midi, useFlats = false) {
        const noteIndex = midi % 12;
        const octave = Math.floor(midi / 12) - 1;
        const name = useFlats ? NOTE_NAMES_FLAT[noteIndex] : NOTE_NAMES[noteIndex];
        return `${name}${octave}`;
    }

    static noteNameToMidi(name) {
        const match = name.match(/^([A-Ga-g][#b]?)(-?\d+)$/);
        if (!match) return 60; // default C4
        const noteStr = match[1].charAt(0).toUpperCase() + match[1].slice(1);
        const octave = parseInt(match[2], 10);
        let noteIndex = NOTE_NAMES.indexOf(noteStr);
        if (noteIndex === -1) {
            noteIndex = NOTE_NAMES_FLAT.indexOf(noteStr);
        }
        if (noteIndex === -1) return 60;
        return (octave + 1) * 12 + noteIndex;
    }

    static getPitchClass(midi) {
        return midi % 12;
    }

    static getNoteBase(midi, useFlats = false) {
        return useFlats ? NOTE_NAMES_FLAT[midi % 12] : NOTE_NAMES[midi % 12];
    }

    static getSolfege(midi) {
        return SOLFEGE[midi % 12];
    }

    static isBlackKey(midi) {
        const pc = midi % 12;
        return pc === 1 || pc === 3 || pc === 6 || pc === 8 || pc === 10;
    }

    // Comprehensive chord formulas (intervals from root in semitones)
    static CHORD_DEFINITIONS = [
        { name: 'Major', symbol: '', intervals: [0, 4, 7] },
        { name: 'Minor', symbol: 'm', intervals: [0, 3, 7] },
        { name: 'Dominant 7th', symbol: '7', intervals: [0, 4, 7, 10] },
        { name: 'Major 7th', symbol: 'maj7', intervals: [0, 4, 7, 11] },
        { name: 'Minor 7th', symbol: 'm7', intervals: [0, 3, 7, 10] },
        { name: 'Diminished', symbol: 'dim', intervals: [0, 3, 6] },
        { name: 'Diminished 7th', symbol: 'dim7', intervals: [0, 3, 6, 9] },
        { name: 'Half-Diminished', symbol: 'm7b5', intervals: [0, 3, 6, 10] },
        { name: 'Augmented', symbol: 'aug', intervals: [0, 4, 8] },
        { name: 'Suspended 2nd', symbol: 'sus2', intervals: [0, 2, 7] },
        { name: 'Suspended 4th', symbol: 'sus4', intervals: [0, 5, 7] },
        { name: 'Add 9', symbol: 'add9', intervals: [0, 4, 7, 14] },
        { name: 'Major 6th', symbol: '6', intervals: [0, 4, 7, 9] },
        { name: 'Minor 6th', symbol: 'm6', intervals: [0, 3, 7, 9] },
        { name: 'Power Chord', symbol: '5', intervals: [0, 7] }
    ];

    // Scale formulas (intervals from root in semitones)
    static SCALE_DEFINITIONS = [
        { id: 'major', name: 'Major (Ionian)', intervals: [0, 2, 4, 5, 7, 9, 11], desc: 'Happy, bright, fundamental Western scale' },
        { id: 'natural_minor', name: 'Natural Minor (Aeolian)', intervals: [0, 2, 3, 5, 7, 8, 10], desc: 'Melancholic, emotive, classic minor sound' },
        { id: 'harmonic_minor', name: 'Harmonic Minor', intervals: [0, 2, 3, 5, 7, 8, 11], desc: 'Exotic, dramatic, neoclassical flair' },
        { id: 'pentatonic_major', name: 'Major Pentatonic', intervals: [0, 2, 4, 7, 9], desc: 'Versatile 5-note scale, sounds great everywhere' },
        { id: 'pentatonic_minor', name: 'Minor Pentatonic', intervals: [0, 3, 5, 7, 10], desc: 'Essential for Rock, Blues, and Pop solos' },
        { id: 'blues', name: 'Blues Scale', intervals: [0, 3, 5, 6, 7, 10], desc: 'Soulful with the expressive blue flat-fifth' },
        { id: 'dorian', name: 'Dorian Mode', intervals: [0, 2, 3, 5, 7, 9, 10], desc: 'Smooth jazzy minor with a bright natural 6th' },
        { id: 'mixolydian', name: 'Mixolydian Mode', intervals: [0, 2, 4, 5, 7, 9, 10], desc: 'Rock and blues major scale with flat 7th' }
    ];

    /**
     * Identify chords from an array of currently active MIDI note numbers
     */
    static identifyChord(activeNotes) {
        if (!activeNotes || activeNotes.length < 2) {
            if (activeNotes && activeNotes.length === 1) {
                const note = activeNotes[0];
                return {
                    name: `${MusicTheory.getNoteBase(note)} (${MusicTheory.midiToNoteName(note)})`,
                    short: MusicTheory.getNoteBase(note),
                    type: 'Single Note',
                    notes: [note]
                };
            }
            return null;
        }

        const sorted = Array.from(new Set(activeNotes)).sort((a, b) => a - b);
        const pitchClasses = Array.from(new Set(sorted.map(n => n % 12)));
        const lowestMidi = sorted[0];
        const bassPitchClass = lowestMidi % 12;

        let bestMatch = null;

        // Test each pitch class as potential root
        for (let root = 0; root < 12; root++) {
            const rootName = NOTE_NAMES[root];
            // Normalize pitch classes relative to root
            const relativePCs = pitchClasses.map(pc => (pc - root + 12) % 12).sort((a, b) => a - b);

            for (const chordDef of MusicTheory.CHORD_DEFINITIONS) {
                const chordPCs = Array.from(new Set(chordDef.intervals.map(i => i % 12))).sort((a, b) => a - b);

                // Check exact match
                if (relativePCs.length === chordPCs.length && relativePCs.every((val, idx) => val === chordPCs[idx])) {
                    const isInversion = bassPitchClass !== root;
                    const bassName = NOTE_NAMES[bassPitchClass];
                    const fullName = `${rootName} ${chordDef.name}${isInversion ? ` / ${bassName}` : ''}`;
                    const symbol = `${rootName}${chordDef.symbol}${isInversion ? `/${bassName}` : ''}`;

                    return {
                        name: fullName,
                        short: symbol,
                        root: rootName,
                        type: chordDef.name,
                        bass: bassName,
                        notes: sorted
                    };
                }
            }
        }

        // If no strict match, show bass note and active notes
        const noteNames = sorted.map(n => MusicTheory.getNoteBase(n)).join(' - ');
        return {
            name: `${noteNames}`,
            short: noteNames,
            type: 'Cluster',
            notes: sorted
        };
    }

    /**
     * Get notes belonging to a scale given root and scale ID
     */
    static getScaleNotes(rootNoteName, scaleId, startOctave = 4, count = 8) {
        const rootIndex = NOTE_NAMES.indexOf(rootNoteName);
        if (rootIndex === -1) return [];

        const scaleDef = MusicTheory.SCALE_DEFINITIONS.find(s => s.id === scaleId) || MusicTheory.SCALE_DEFINITIONS[0];
        const intervals = scaleDef.intervals;
        const notes = [];
        const baseMidi = (startOctave + 1) * 12 + rootIndex;

        for (let i = 0; i < count; i++) {
            const octaveOffset = Math.floor(i / intervals.length) * 12;
            const interval = intervals[i % intervals.length];
            notes.push(baseMidi + octaveOffset + interval);
        }

        return notes;
    }

    /**
     * Get notes belonging to a chord
     */
    static getChordNotes(rootNoteName, chordName, startOctave = 4) {
        const rootIndex = NOTE_NAMES.indexOf(rootNoteName);
        if (rootIndex === -1) return [];

        const chordDef = MusicTheory.CHORD_DEFINITIONS.find(c => c.name.toLowerCase() === chordName.toLowerCase()) || MusicTheory.CHORD_DEFINITIONS[0];
        const baseMidi = (startOctave + 1) * 12 + rootIndex;

        return chordDef.intervals.map(interval => baseMidi + interval);
    }
}

/**
 * Interactive Sheet Music Staff Renderer
 * Draws Treble Clef and Bass Clef with accurate staff positions, ledger lines, and notes
 */
class SheetMusicRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.activeNotes = new Set();
        this.currentSongNotes = [];
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.resetTransform?.();
            this.ctx.scale(dpr, dpr);
            this.width = rect.width;
            this.height = rect.height;
        }
    }

    // Convert MIDI note number to staff line step
    // Middle C (C4 = 60) is:
    // Treble: 1 ledger line below bottom line (step = -2 relative to bottom line E4 = 64)
    // Bass: 1 ledger line above top line (step = 10 relative to bottom line G2 = 43)
    static midiToStaffStep(midi) {
        // Natural note step mapping: C=0, D=1, E=2, F=3, G=4, A=5, B=6
        const diatonicSteps = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
        const octave = Math.floor(midi / 12) - 1;
        const pc = midi % 12;
        return octave * 7 + diatonicSteps[pc];
    }

    render(activeMidis = [], targetMidis = []) {
        if (!this.width || !this.height) this.resize();
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        ctx.clearRect(0, 0, w, h);

        const lineSpacing = 12;
        const staffLineColor = 'rgba(255, 255, 255, 0.22)';
        const clefColor = '#a5b4fc';

        // Treble staff lines (E4 to F5)
        const trebleCenterY = h * 0.32;
        const trebleBottomY = trebleCenterY + lineSpacing * 2;
        // Bass staff lines (G2 to A3)
        const bassCenterY = h * 0.72;
        const bassBottomY = bassCenterY + lineSpacing * 2;

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = staffLineColor;

        // Draw Treble Staff (5 lines)
        for (let i = 0; i < 5; i++) {
            const y = trebleCenterY + (i - 2) * lineSpacing;
            ctx.beginPath();
            ctx.moveTo(30, y);
            ctx.lineTo(w - 30, y);
            ctx.stroke();
        }

        // Draw Bass Staff (5 lines)
        for (let i = 0; i < 5; i++) {
            const y = bassCenterY + (i - 2) * lineSpacing;
            ctx.beginPath();
            ctx.moveTo(30, y);
            ctx.lineTo(w - 30, y);
            ctx.stroke();
        }

        // Draw Clef Labels & Braces
        ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
        ctx.fillStyle = clefColor;
        ctx.fillText('𝄞 Treble Clef', 38, trebleCenterY - lineSpacing * 2.8);
        ctx.fillText('𝄢 Bass Clef', 38, bassCenterY - lineSpacing * 2.8);

        // Vertical bracket connecting staves
        ctx.strokeStyle = 'rgba(165, 180, 252, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(30, trebleCenterY - lineSpacing * 2);
        ctx.lineTo(30, bassCenterY + lineSpacing * 2);
        ctx.stroke();

        // Draw Target Notes (e.g. from song or quiz)
        if (targetMidis && targetMidis.length > 0) {
            targetMidis.forEach((midi, idx) => {
                const x = w * 0.45 + idx * 45;
                this.drawNoteOnStaff(ctx, midi, x, trebleBottomY, bassBottomY, lineSpacing, '#38bdf8', 'Target');
            });
        }

        // Draw Active Notes (currently played by user)
        if (activeMidis && activeMidis.length > 0) {
            activeMidis.forEach((midi, idx) => {
                const x = w * 0.65 + idx * 45;
                this.drawNoteOnStaff(ctx, midi, x, trebleBottomY, bassBottomY, lineSpacing, '#10b981', 'Played');
            });
        }
    }

    drawNoteOnStaff(ctx, midi, x, trebleBottomY, bassBottomY, lineSpacing, color, label) {
        // Step calculation
        // E4 is MIDI 64 = treble bottom line. Staff step = 4 * 7 + 2 = 30
        const E4_STEP = 30;
        // G2 is MIDI 43 = bass bottom line. Staff step = 2 * 7 + 4 = 18
        const G2_STEP = 18;

        const step = SheetMusicRenderer.midiToStaffStep(midi);
        const isTreble = midi >= 60; // Middle C (60) or above on Treble

        let noteY;
        let bottomStep;
        let staffBottomY;

        if (isTreble) {
            bottomStep = E4_STEP;
            staffBottomY = trebleBottomY;
            noteY = staffBottomY - (step - bottomStep) * (lineSpacing / 2);
        } else {
            bottomStep = G2_STEP;
            staffBottomY = bassBottomY;
            noteY = staffBottomY - (step - bottomStep) * (lineSpacing / 2);
        }

        // Ledger lines
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        // Middle C (MIDI 60): step 28. In treble, 1 line below staff (noteY = trebleBottomY + lineSpacing)
        if (midi === 60) {
            // Draw ledger line for Middle C
            ctx.beginPath();
            ctx.moveTo(x - 14, noteY);
            ctx.lineTo(x + 14, noteY);
            ctx.stroke();
        } else if (isTreble && noteY > staffBottomY + 2) {
            for (let ly = staffBottomY + lineSpacing; ly <= noteY + 1; ly += lineSpacing) {
                ctx.beginPath();
                ctx.moveTo(x - 14, ly);
                ctx.lineTo(x + 14, ly);
                ctx.stroke();
            }
        } else if (isTreble && noteY < staffBottomY - 4 * lineSpacing - 2) {
            const topY = staffBottomY - 4 * lineSpacing;
            for (let ly = topY - lineSpacing; ly >= noteY - 1; ly -= lineSpacing) {
                ctx.beginPath();
                ctx.moveTo(x - 14, ly);
                ctx.lineTo(x + 14, ly);
                ctx.stroke();
            }
        }

        // Draw Note Head (Tilted Ellipse)
        ctx.save();
        ctx.translate(x, noteY);
        ctx.rotate(-0.25);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw Accidental if sharp/flat
        const isSharp = MusicTheory.isBlackKey(midi);
        if (isSharp) {
            ctx.font = 'bold 15px serif';
            ctx.fillStyle = color;
            ctx.fillText('♯', x - 20, noteY + 5);
        }

        // Draw Stem
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        if (noteY < (isTreble ? trebleBottomY - lineSpacing * 2 : bassBottomY - lineSpacing * 2)) {
            // Stem down
            ctx.moveTo(x - 7, noteY);
            ctx.lineTo(x - 7, noteY + 32);
        } else {
            // Stem up
            ctx.moveTo(x + 7, noteY);
            ctx.lineTo(x + 7, noteY - 32);
        }
        ctx.stroke();

        // Note Label below/above
        ctx.font = 'bold 11px system-ui';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(MusicTheory.midiToNoteName(midi), x, noteY + 24);
    }
}

window.MusicTheory = MusicTheory;
window.SheetMusicRenderer = SheetMusicRenderer;
