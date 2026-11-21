# 🎹 PianoMaster - Interactive Piano Learning App

A modern, responsive, full-featured interactive piano learning web application built with HTML5, CSS3, JavaScript, Web Audio API, and Web MIDI API. Runs standalone with zero external dependencies.

---

## 🌟 Key Features

### 1. 🎵 Synthesia-Style Falling Notes Game
- **Interactive 60 FPS Visualizer**: Cascading visual notes aligning with the virtual piano keys.
- **Three Learning Modes**:
  - **Wait For Me (Practice)**: The song pauses at each note until you hit the right key—ideal for beginners learning finger placements.
  - **Flow (Play Along)**: Play notes in real-time as they cross the hit line. Evaluates timing accuracy (`PERFECT! +100`, `GOOD! +50`, `MISS`) with combo multipliers and streaks.
  - **Demo (Listen & Watch)**: Autoplays the piece with sound and illuminated keys.
- **Speed Slider**: Practice slowly at 0.5x, 0.8x, or full speed (1.0x - 1.5x).
- **Hand Isolation**: Practice Left Hand (Bass), Right Hand (Melody), or Both Hands together.

### 2. 🎼 Curated Classical & Popular Song Library
- **Twinkle Twinkle Little Star** (Beginner)
- **Ode to Joy** – Ludwig van Beethoven (Beginner)
- **Für Elise** – Ludwig van Beethoven (Intermediate)
- **Canon in D** – Johann Pachelbel (Intermediate)
- **Moonlight Sonata** – Ludwig van Beethoven (Intermediate)
- **Happy Birthday to You** (Beginner)

### 3. 🎹 High-Fidelity Acoustic Sound Engine (Web Audio API)
- Physical modeling synthesis with multi-harmonic additive oscillators, hammer strike mechanical transients, and acoustic soundboard damping.
- **Synthetic Convolution Reverb**: Simulates the acoustic ambiance of a concert hall.
- **Dynamics Compressor**: Clean, distortion-free sound when playing big polyphonic chords.
- **Sustain Pedal**: Hold <kbd>Spacebar</kbd> or click the Pedal button for natural acoustic ringing.

### 4. 🎛️ Real-Time Chord Detection
- Automatically identifies any chord you play on the piano (e.g., `C Major`, `A Minor 7th`, `G7 / B`, `D Diminished`).
- Displays both chord names and individual note breakdowns.

### 5. 📚 Chords & Scales Academy
- **Chord Explorer**: Audition and visualize major, minor, 7th, maj7, m7, dim, aug, and suspended chords with interval theory.
- **Scale Explorer**: Interactive scales (Major, Natural Minor, Harmonic Minor, Pentatonic, Blues, Dorian, Mixolydian) with one-click arpeggio playback.

### 6. 𝄞 Sight Reading & Ear Training
- **Sheet Music Staff Trainer**: Real-time Grand Staff (Treble & Bass clefs) flashcards with ledger lines and note identification.
- **Ear Training Game**: Test and improve your pitch memory by guessing mystery notes.

### 7. ⏺ Performance Recorder & Studio
- Record your live performances, save them locally in your browser, and play them back anytime.

### 8. 🔌 Web MIDI Hardware Support
- Automatically detects and connects to any USB or Bluetooth MIDI keyboard / digital piano (Yamaha, Roland, Casio, Korg, Arturia, Novation, etc.).

---

## 🚀 How to Run

### Quick Launch:
In your terminal, navigate to this directory and run:
```bash
./run.sh
```
Or simply open `index.html` in any modern web browser (Safari, Google Chrome, Brave, Edge, Firefox):
```bash
open index.html
```

### Local HTTP Server (Optional):
```bash
./run.sh --server
```

---

## ⌨️ Computer Keyboard Shortcuts

| Key | Piano Note | Key | Piano Note |
|---|---|---|---|
| <kbd>Z</kbd> | C3 | <kbd>Q</kbd> | C4 (Middle C) |
| <kbd>S</kbd> | C#3 | <kbd>2</kbd> | C#4 |
| <kbd>X</kbd> | D3 | <kbd>W</kbd> | D4 |
| <kbd>D</kbd> | D#3 | <kbd>3</kbd> | D#4 |
| <kbd>C</kbd> | E3 | <kbd>E</kbd> | E4 |
| <kbd>V</kbd> | F3 | <kbd>R</kbd> | F4 |
| <kbd>G</kbd> | F#3 | <kbd>5</kbd> | F#4 |
| <kbd>B</kbd> | G3 | <kbd>T</kbd> | G4 |
| <kbd>H</kbd> | G#3 | <kbd>6</kbd> | G#4 |
| <kbd>N</kbd> | A3 | <kbd>Y</kbd> | A4 (440Hz) |
| <kbd>J</kbd> | A#3 | <kbd>7</kbd> | A#4 |
| <kbd>M</kbd> | B3 | <kbd>U</kbd> | B4 |
| | | <kbd>I</kbd> | C5 |
| | | <kbd>9</kbd> | C#5 |
| | | <kbd>O</kbd> | D5 |
| | | <kbd>0</kbd> | D#5 |
| | | <kbd>P</kbd> | E5 |

- <kbd>Spacebar</kbd> (Hold): **Sustain Pedal**
- <kbd>-</kbd> / <kbd>+</kbd>: **Shift Octave Down / Up**
