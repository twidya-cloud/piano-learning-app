/**
 * Curated Song Library with Note Timings, Durations, and Left/Right Hand Parts
 */

const SONGS_DATABASE = [
    {
        id: 'twinkle',
        title: 'Twinkle Twinkle Little Star',
        composer: 'Traditional',
        difficulty: 'Beginner',
        tempo: 90,
        key: 'C Major',
        description: 'Perfect for beginners. Simple repetitive melodic intervals in C Major.',
        notes: [
            // C C G G A A G
            { midi: 60, time: 0.0, duration: 0.5, hand: 'right' },
            { midi: 48, time: 0.0, duration: 1.0, hand: 'left' },
            { midi: 60, time: 0.6, duration: 0.5, hand: 'right' },
            { midi: 67, time: 1.2, duration: 0.5, hand: 'right' },
            { midi: 55, time: 1.2, duration: 1.0, hand: 'left' },
            { midi: 67, time: 1.8, duration: 0.5, hand: 'right' },
            { midi: 69, time: 2.4, duration: 0.5, hand: 'right' },
            { midi: 57, time: 2.4, duration: 1.0, hand: 'left' },
            { midi: 69, time: 3.0, duration: 0.5, hand: 'right' },
            { midi: 67, time: 3.6, duration: 1.0, hand: 'right' },
            { midi: 55, time: 3.6, duration: 1.0, hand: 'left' },

            // F F E E D D C
            { midi: 65, time: 4.8, duration: 0.5, hand: 'right' },
            { midi: 53, time: 4.8, duration: 1.0, hand: 'left' },
            { midi: 65, time: 5.4, duration: 0.5, hand: 'right' },
            { midi: 64, time: 6.0, duration: 0.5, hand: 'right' },
            { midi: 52, time: 6.0, duration: 1.0, hand: 'left' },
            { midi: 64, time: 6.6, duration: 0.5, hand: 'right' },
            { midi: 62, time: 7.2, duration: 0.5, hand: 'right' },
            { midi: 50, time: 7.2, duration: 1.0, hand: 'left' },
            { midi: 62, time: 7.8, duration: 0.5, hand: 'right' },
            { midi: 60, time: 8.4, duration: 1.2, hand: 'right' },
            { midi: 48, time: 8.4, duration: 1.2, hand: 'left' },

            // G G F F E E D
            { midi: 67, time: 10.0, duration: 0.5, hand: 'right' },
            { midi: 55, time: 10.0, duration: 1.0, hand: 'left' },
            { midi: 67, time: 10.6, duration: 0.5, hand: 'right' },
            { midi: 65, time: 11.2, duration: 0.5, hand: 'right' },
            { midi: 53, time: 11.2, duration: 1.0, hand: 'left' },
            { midi: 65, time: 11.8, duration: 0.5, hand: 'right' },
            { midi: 64, time: 12.4, duration: 0.5, hand: 'right' },
            { midi: 52, time: 12.4, duration: 1.0, hand: 'left' },
            { midi: 64, time: 13.0, duration: 0.5, hand: 'right' },
            { midi: 62, time: 13.6, duration: 1.0, hand: 'right' },
            { midi: 50, time: 13.6, duration: 1.0, hand: 'left' },

            // G G F F E E D
            { midi: 67, time: 14.8, duration: 0.5, hand: 'right' },
            { midi: 55, time: 14.8, duration: 1.0, hand: 'left' },
            { midi: 67, time: 15.4, duration: 0.5, hand: 'right' },
            { midi: 65, time: 16.0, duration: 0.5, hand: 'right' },
            { midi: 53, time: 16.0, duration: 1.0, hand: 'left' },
            { midi: 65, time: 16.6, duration: 0.5, hand: 'right' },
            { midi: 64, time: 17.2, duration: 0.5, hand: 'right' },
            { midi: 52, time: 17.2, duration: 1.0, hand: 'left' },
            { midi: 64, time: 17.8, duration: 0.5, hand: 'right' },
            { midi: 62, time: 18.4, duration: 1.0, hand: 'right' },
            { midi: 50, time: 18.4, duration: 1.0, hand: 'left' },

            // Final C C G G A A G ...
            { midi: 60, time: 19.6, duration: 0.5, hand: 'right' },
            { midi: 48, time: 19.6, duration: 1.0, hand: 'left' },
            { midi: 60, time: 20.2, duration: 0.5, hand: 'right' },
            { midi: 67, time: 20.8, duration: 0.5, hand: 'right' },
            { midi: 55, time: 20.8, duration: 1.0, hand: 'left' },
            { midi: 67, time: 21.4, duration: 0.5, hand: 'right' },
            { midi: 69, time: 22.0, duration: 0.5, hand: 'right' },
            { midi: 57, time: 22.0, duration: 1.0, hand: 'left' },
            { midi: 69, time: 22.6, duration: 0.5, hand: 'right' },
            { midi: 67, time: 23.2, duration: 1.2, hand: 'right' },
            { midi: 55, time: 23.2, duration: 1.2, hand: 'left' }
        ]
    },
    {
        id: 'ode_to_joy',
        title: 'Ode to Joy (Symphony No. 9)',
        composer: 'Ludwig van Beethoven',
        difficulty: 'Beginner',
        tempo: 110,
        key: 'C Major',
        description: 'Triumphant and universally recognized. Great for finger coordination.',
        notes: [
            // E E F G | G F E D | C C D E | E D D
            { midi: 64, time: 0.0, duration: 0.45, hand: 'right' },
            { midi: 48, time: 0.0, duration: 1.0, hand: 'left' },
            { midi: 64, time: 0.55, duration: 0.45, hand: 'right' },
            { midi: 65, time: 1.1, duration: 0.45, hand: 'right' },
            { midi: 67, time: 1.65, duration: 0.45, hand: 'right' },
            { midi: 55, time: 1.65, duration: 1.0, hand: 'left' },

            { midi: 67, time: 2.2, duration: 0.45, hand: 'right' },
            { midi: 65, time: 2.75, duration: 0.45, hand: 'right' },
            { midi: 64, time: 3.3, duration: 0.45, hand: 'right' },
            { midi: 48, time: 3.3, duration: 1.0, hand: 'left' },
            { midi: 62, time: 3.85, duration: 0.45, hand: 'right' },

            { midi: 60, time: 4.4, duration: 0.45, hand: 'right' },
            { midi: 60, time: 4.95, duration: 0.45, hand: 'right' },
            { midi: 53, time: 4.95, duration: 1.0, hand: 'left' },
            { midi: 62, time: 5.5, duration: 0.45, hand: 'right' },
            { midi: 64, time: 6.05, duration: 0.45, hand: 'right' },
            { midi: 48, time: 6.05, duration: 1.0, hand: 'left' },

            { midi: 64, time: 6.6, duration: 0.6, hand: 'right' },
            { midi: 62, time: 7.3, duration: 0.25, hand: 'right' },
            { midi: 55, time: 7.3, duration: 1.0, hand: 'left' },
            { midi: 62, time: 7.7, duration: 0.8, hand: 'right' },

            // Second phrase: E E F G | G F E D | C C D E | D C C
            { midi: 64, time: 8.8, duration: 0.45, hand: 'right' },
            { midi: 48, time: 8.8, duration: 1.0, hand: 'left' },
            { midi: 64, time: 9.35, duration: 0.45, hand: 'right' },
            { midi: 65, time: 9.9, duration: 0.45, hand: 'right' },
            { midi: 67, time: 10.45, duration: 0.45, hand: 'right' },
            { midi: 55, time: 10.45, duration: 1.0, hand: 'left' },

            { midi: 67, time: 11.0, duration: 0.45, hand: 'right' },
            { midi: 65, time: 11.55, duration: 0.45, hand: 'right' },
            { midi: 64, time: 12.1, duration: 0.45, hand: 'right' },
            { midi: 48, time: 12.1, duration: 1.0, hand: 'left' },
            { midi: 62, time: 12.65, duration: 0.45, hand: 'right' },

            { midi: 60, time: 13.2, duration: 0.45, hand: 'right' },
            { midi: 60, time: 13.75, duration: 0.45, hand: 'right' },
            { midi: 53, time: 13.75, duration: 1.0, hand: 'left' },
            { midi: 62, time: 14.3, duration: 0.45, hand: 'right' },
            { midi: 64, time: 14.85, duration: 0.45, hand: 'right' },
            { midi: 48, time: 14.85, duration: 1.0, hand: 'left' },

            { midi: 62, time: 15.4, duration: 0.6, hand: 'right' },
            { midi: 55, time: 15.4, duration: 1.0, hand: 'left' },
            { midi: 60, time: 16.1, duration: 0.25, hand: 'right' },
            { midi: 60, time: 16.5, duration: 1.2, hand: 'right' },
            { midi: 48, time: 16.5, duration: 1.2, hand: 'left' }
        ]
    },
    {
        id: 'fur_elise',
        title: 'Für Elise (Bagatelle No. 25)',
        composer: 'Ludwig van Beethoven',
        difficulty: 'Intermediate',
        tempo: 125,
        key: 'A Minor',
        description: 'The world\'s most famous piano piece. Teaches semitone oscillation and arpeggios.',
        notes: [
            // E D# E D# E B D C A
            { midi: 76, time: 0.0, duration: 0.28, hand: 'right' }, // E5
            { midi: 75, time: 0.32, duration: 0.28, hand: 'right' }, // D#5
            { midi: 76, time: 0.64, duration: 0.28, hand: 'right' }, // E5
            { midi: 75, time: 0.96, duration: 0.28, hand: 'right' }, // D#5
            { midi: 76, time: 1.28, duration: 0.28, hand: 'right' }, // E5
            { midi: 71, time: 1.60, duration: 0.28, hand: 'right' }, // B4
            { midi: 74, time: 1.92, duration: 0.28, hand: 'right' }, // D5
            { midi: 72, time: 2.24, duration: 0.28, hand: 'right' }, // C5
            { midi: 69, time: 2.56, duration: 0.75, hand: 'right' }, // A4
            // Left hand A minor arpeggio
            { midi: 45, time: 2.56, duration: 0.4, hand: 'left' },  // A2
            { midi: 52, time: 2.90, duration: 0.4, hand: 'left' },  // E3
            { midi: 57, time: 3.24, duration: 0.4, hand: 'left' },  // A3

            // C E A B
            { midi: 60, time: 3.58, duration: 0.28, hand: 'right' }, // C4
            { midi: 64, time: 3.90, duration: 0.28, hand: 'right' }, // E4
            { midi: 69, time: 4.22, duration: 0.28, hand: 'right' }, // A4
            { midi: 71, time: 4.54, duration: 0.75, hand: 'right' }, // B4
            // Left hand E major arpeggio
            { midi: 40, time: 4.54, duration: 0.4, hand: 'left' },  // E2
            { midi: 52, time: 4.88, duration: 0.4, hand: 'left' },  // E3
            { midi: 56, time: 5.22, duration: 0.4, hand: 'left' },  // G#3

            // E G# B C
            { midi: 64, time: 5.56, duration: 0.28, hand: 'right' }, // E4
            { midi: 68, time: 5.88, duration: 0.28, hand: 'right' }, // G#4
            { midi: 71, time: 6.20, duration: 0.28, hand: 'right' }, // B4
            { midi: 72, time: 6.52, duration: 0.75, hand: 'right' }, // C5
            // Left hand A minor arpeggio
            { midi: 45, time: 6.52, duration: 0.4, hand: 'left' },  // A2
            { midi: 52, time: 6.86, duration: 0.4, hand: 'left' },  // E3
            { midi: 57, time: 7.20, duration: 0.4, hand: 'left' },  // A3

            // E D# E D# E B D C A (Repeat theme)
            { midi: 76, time: 7.60, duration: 0.28, hand: 'right' },
            { midi: 75, time: 7.92, duration: 0.28, hand: 'right' },
            { midi: 76, time: 8.24, duration: 0.28, hand: 'right' },
            { midi: 75, time: 8.56, duration: 0.28, hand: 'right' },
            { midi: 76, time: 8.88, duration: 0.28, hand: 'right' },
            { midi: 71, time: 9.20, duration: 0.28, hand: 'right' },
            { midi: 74, time: 9.52, duration: 0.28, hand: 'right' },
            { midi: 72, time: 9.84, duration: 0.28, hand: 'right' },
            { midi: 69, time: 10.16, duration: 0.9, hand: 'right' },
            { midi: 45, time: 10.16, duration: 0.9, hand: 'left' }
        ]
    },
    {
        id: 'canon_in_d',
        title: 'Canon in D',
        composer: 'Johann Pachelbel',
        difficulty: 'Intermediate',
        tempo: 80,
        key: 'D Major',
        description: 'Serene baroque masterpiece built over a famous 8-chord progression.',
        notes: [
            // Measure 1: D chord
            { midi: 74, time: 0.0, duration: 1.0, hand: 'right' }, // F#5 -> D5
            { midi: 50, time: 0.0, duration: 1.5, hand: 'left' },  // D3
            // Measure 2: A chord
            { midi: 73, time: 1.5, duration: 1.0, hand: 'right' }, // C#5
            { midi: 45, time: 1.5, duration: 1.5, hand: 'left' },  // A2
            // Measure 3: B minor chord
            { midi: 71, time: 3.0, duration: 1.0, hand: 'right' }, // B4
            { midi: 47, time: 3.0, duration: 1.5, hand: 'left' },  // B2
            // Measure 4: F# minor chord
            { midi: 69, time: 4.5, duration: 1.0, hand: 'right' }, // A4
            { midi: 42, time: 4.5, duration: 1.5, hand: 'left' },  // F#2
            // Measure 5: G chord
            { midi: 67, time: 6.0, duration: 1.0, hand: 'right' }, // G4
            { midi: 43, time: 6.0, duration: 1.5, hand: 'left' },  // G2
            // Measure 6: D chord
            { midi: 66, time: 7.5, duration: 1.0, hand: 'right' }, // F#4
            { midi: 50, time: 7.5, duration: 1.5, hand: 'left' },  // D3
            // Measure 7: G chord
            { midi: 67, time: 9.0, duration: 1.0, hand: 'right' }, // G4
            { midi: 43, time: 9.0, duration: 1.5, hand: 'left' },  // G2
            // Measure 8: A chord
            { midi: 69, time: 10.5, duration: 1.2, hand: 'right' }, // A4
            { midi: 45, time: 10.5, duration: 1.5, hand: 'left' },  // A2

            // Flowing melody variation:
            { midi: 74, time: 12.0, duration: 0.4, hand: 'right' }, // D5
            { midi: 73, time: 12.5, duration: 0.4, hand: 'right' }, // C#5
            { midi: 74, time: 13.0, duration: 0.4, hand: 'right' }, // D5
            { midi: 62, time: 12.0, duration: 1.5, hand: 'left' },
            { midi: 74, time: 13.5, duration: 0.4, hand: 'right' },
            { midi: 73, time: 14.0, duration: 0.4, hand: 'right' },
            { midi: 69, time: 14.5, duration: 0.4, hand: 'right' }
        ]
    },
    {
        id: 'moonlight_sonata',
        title: 'Moonlight Sonata (Adagio sostenuto)',
        composer: 'Ludwig van Beethoven',
        difficulty: 'Intermediate',
        tempo: 60,
        key: 'C# Minor',
        description: 'Haunting and expressive triplets with sustained bass notes.',
        notes: [
            // Bass octave C#
            { midi: 37, time: 0.0, duration: 3.5, hand: 'left' }, // C#2
            { midi: 49, time: 0.0, duration: 3.5, hand: 'left' }, // C#3
            // Triplet 1: G#3 C#4 E4
            { midi: 56, time: 0.0, duration: 0.4, hand: 'right' },
            { midi: 61, time: 0.4, duration: 0.4, hand: 'right' },
            { midi: 64, time: 0.8, duration: 0.4, hand: 'right' },
            // Triplet 2: G#3 C#4 E4
            { midi: 56, time: 1.2, duration: 0.4, hand: 'right' },
            { midi: 61, time: 1.6, duration: 0.4, hand: 'right' },
            { midi: 64, time: 2.0, duration: 0.4, hand: 'right' },
            // Triplet 3: G#3 C#4 E4
            { midi: 56, time: 2.4, duration: 0.4, hand: 'right' },
            { midi: 61, time: 2.8, duration: 0.4, hand: 'right' },
            { midi: 64, time: 3.2, duration: 0.4, hand: 'right' },

            // Measure 2: Bass B, G#3 B3 E4
            { midi: 35, time: 3.8, duration: 3.5, hand: 'left' }, // B1
            { midi: 47, time: 3.8, duration: 3.5, hand: 'left' }, // B2
            { midi: 56, time: 3.8, duration: 0.4, hand: 'right' },
            { midi: 59, time: 4.2, duration: 0.4, hand: 'right' },
            { midi: 64, time: 4.6, duration: 0.4, hand: 'right' },
            { midi: 56, time: 5.0, duration: 0.4, hand: 'right' },
            { midi: 59, time: 5.4, duration: 0.4, hand: 'right' },
            { midi: 64, time: 5.8, duration: 0.4, hand: 'right' },

            // Melodic entrance G#4
            { midi: 68, time: 6.2, duration: 1.8, hand: 'right' },
            { midi: 56, time: 6.2, duration: 0.4, hand: 'right' },
            { midi: 60, time: 6.6, duration: 0.4, hand: 'right' },
            { midi: 64, time: 7.0, duration: 0.4, hand: 'right' }
        ]
    },
    {
        id: 'happy_birthday',
        title: 'Happy Birthday to You',
        composer: 'Traditional',
        difficulty: 'Beginner',
        tempo: 100,
        key: 'F Major',
        description: 'Sing along favorite! Great for practicing dotted rhythms and fourth jumps.',
        notes: [
            // C4 C4 D4 C4 F4 E4
            { midi: 60, time: 0.0, duration: 0.35, hand: 'right' },
            { midi: 60, time: 0.4, duration: 0.25, hand: 'right' },
            { midi: 62, time: 0.7, duration: 0.6, hand: 'right' },
            { midi: 53, time: 0.7, duration: 1.2, hand: 'left' },
            { midi: 60, time: 1.4, duration: 0.6, hand: 'right' },
            { midi: 65, time: 2.1, duration: 0.6, hand: 'right' },
            { midi: 53, time: 2.1, duration: 1.2, hand: 'left' },
            { midi: 64, time: 2.8, duration: 1.1, hand: 'right' },

            // C4 C4 D4 C4 G4 F4
            { midi: 60, time: 4.2, duration: 0.35, hand: 'right' },
            { midi: 60, time: 4.6, duration: 0.25, hand: 'right' },
            { midi: 62, time: 4.9, duration: 0.6, hand: 'right' },
            { midi: 55, time: 4.9, duration: 1.2, hand: 'left' },
            { midi: 60, time: 5.6, duration: 0.6, hand: 'right' },
            { midi: 67, time: 6.3, duration: 0.6, hand: 'right' },
            { midi: 55, time: 6.3, duration: 1.2, hand: 'left' },
            { midi: 65, time: 7.0, duration: 1.1, hand: 'right' },

            // C4 C4 C5 A4 F4 E4 D4
            { midi: 60, time: 8.4, duration: 0.35, hand: 'right' },
            { midi: 60, time: 8.8, duration: 0.25, hand: 'right' },
            { midi: 72, time: 9.1, duration: 0.6, hand: 'right' }, // Octave jump!
            { midi: 53, time: 9.1, duration: 1.2, hand: 'left' },
            { midi: 69, time: 9.8, duration: 0.6, hand: 'right' },
            { midi: 65, time: 10.5, duration: 0.6, hand: 'right' },
            { midi: 57, time: 10.5, duration: 1.2, hand: 'left' },
            { midi: 64, time: 11.2, duration: 0.6, hand: 'right' },
            { midi: 62, time: 11.9, duration: 1.1, hand: 'right' },

            // Bb4 Bb4 A4 F4 G4 F4
            { midi: 70, time: 13.3, duration: 0.35, hand: 'right' },
            { midi: 70, time: 13.7, duration: 0.25, hand: 'right' },
            { midi: 69, time: 14.0, duration: 0.6, hand: 'right' },
            { midi: 50, time: 14.0, duration: 1.2, hand: 'left' },
            { midi: 65, time: 14.7, duration: 0.6, hand: 'right' },
            { midi: 67, time: 15.4, duration: 0.6, hand: 'right' },
            { midi: 55, time: 15.4, duration: 1.2, hand: 'left' },
            { midi: 65, time: 16.1, duration: 1.5, hand: 'right' },
            { midi: 53, time: 16.1, duration: 1.5, hand: 'left' }
        ]
    }
];

window.SONGS_DATABASE = SONGS_DATABASE;
