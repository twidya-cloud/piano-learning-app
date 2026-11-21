/**
 * Synthesia-Style Falling Notes Canvas Engine & Hit Detection
 */

class FallingNotesVisualizer {
    constructor(canvas, pianoElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.pianoElement = pianoElement;
        
        this.song = null;
        this.currentTime = 0;
        this.isPlaying = false;
        this.mode = 'wait'; // 'wait' (practice), 'flow' (play along), 'demo' (autoplay)
        this.speed = 1.0;
        this.selectedHand = 'both'; // 'both', 'right', 'left'
        
        this.lookAheadTime = 3.5; // seconds visible above the hit line
        this.keyPositions = new Map(); // midi -> { x, width, isBlack }
        
        // Game scoring state
        this.score = 0;
        this.streak = 0;
        this.multiplier = 1;
        this.totalNotesInSong = 0;
        this.hitNotesCount = 0;
        this.feedbackText = '';
        this.feedbackColor = '#ffffff';
        this.feedbackTimer = 0;
        
        // Particles system for note hits
        this.particles = [];
        
        // Hit tracking for notes
        this.noteStates = new Map(); // noteIndex -> { hit: bool, missed: bool, pressedTime: number }

        this.animationId = null;
        this.lastFrameTime = performance.now();

        // Callbacks
        this.onSongComplete = null;
        this.onScoreUpdate = null;
        this.onTargetNotesChange = null;
        this.onAutoplayNote = null; // for demo mode

        window.addEventListener('resize', () => this.updateKeyPositions());
    }

    setSong(song) {
        this.song = song;
        this.reset();
    }

    reset() {
        this.currentTime = -1.5; // 1.5s countdown before song starts
        this.score = 0;
        this.streak = 0;
        this.multiplier = 1;
        this.hitNotesCount = 0;
        this.totalNotesInSong = this.song ? this.getFilteredNotes().length : 0;
        this.noteStates.clear();
        this.particles = [];
        this.feedbackText = '';
        this.notifyScore();
    }

    getFilteredNotes() {
        if (!this.song || !this.song.notes) return [];
        if (this.selectedHand === 'both') return this.song.notes;
        return this.song.notes.filter(n => n.hand === this.selectedHand);
    }

    start() {
        this.isPlaying = true;
        this.lastFrameTime = performance.now();
        if (!this.animationId) {
            this.loop(performance.now());
        }
    }

    pause() {
        this.isPlaying = false;
    }

    updateKeyPositions() {
        if (!this.canvas || !this.pianoElement) return;

        const rect = this.canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.resetTransform?.();
        this.ctx.scale(dpr, dpr);
        this.width = rect.width;
        this.height = rect.height;

        // Map each key DOM element to canvas coordinates
        this.keyPositions.clear();
        const keyElements = this.pianoElement.querySelectorAll('.piano-key');
        const containerRect = this.pianoElement.getBoundingClientRect();

        keyElements.forEach(keyEl => {
            const midi = parseInt(keyEl.dataset.midi, 10);
            const keyRect = keyEl.getBoundingClientRect();
            const relX = keyRect.left - containerRect.left;
            this.keyPositions.set(midi, {
                x: relX,
                width: keyRect.width,
                isBlack: keyEl.classList.contains('black')
            });
        });
    }

    loop(timestamp) {
        this.animationId = requestAnimationFrame((ts) => this.loop(ts));
        const dt = (timestamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timestamp;

        if (this.isPlaying && this.song) {
            this.update(dt);
        }

        this.render();
    }

    update(dt) {
        const filteredNotes = this.getFilteredNotes();
        const hitWindow = 0.18; // hit tolerance window in seconds

        // Identify current target notes (notes that are right now at the hit line)
        const targetNotes = [];
        let shouldHoldForWaitMode = false;

        filteredNotes.forEach((n, idx) => {
            const timeDiff = n.time - this.currentTime;
            const state = this.noteStates.get(idx);

            // If note is within the active hit zone
            if (timeDiff <= 0.05 && timeDiff >= -n.duration) {
                if (!state || !state.hit) {
                    targetNotes.push(n.midi);
                    if (this.mode === 'wait' && this.currentTime >= n.time - 0.02) {
                        shouldHoldForWaitMode = true;
                    }
                }
            }

            // In demo mode, trigger autoplay sound
            if (this.mode === 'demo' && !state && timeDiff <= 0 && timeDiff > -0.05) {
                this.noteStates.set(idx, { hit: true });
                if (this.onAutoplayNote) {
                    this.onAutoplayNote(n.midi, n.duration, n.hand);
                }
            }

            // Flow mode: Check for missed notes
            if (this.mode === 'flow' && (!state || (!state.hit && !state.missed))) {
                if (timeDiff < -hitWindow - 0.1) {
                    this.noteStates.set(idx, { hit: false, missed: true });
                    this.streak = 0;
                    this.multiplier = 1;
                    this.triggerFeedback('MISS', '#ef4444');
                    this.notifyScore();
                }
            }
        });

        if (this.onTargetNotesChange) {
            this.onTargetNotesChange(targetNotes);
        }

        // In practice (wait) mode, freeze time until required notes are hit
        if (shouldHoldForWaitMode) {
            // Frozen at current hit line
        } else {
            this.currentTime += dt * this.speed;
        }

        // Update hit feedback timer
        if (this.feedbackTimer > 0) {
            this.feedbackTimer -= dt;
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= dt;
            p.alpha = Math.max(0, p.life / p.maxLife);
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Check if song has finished
        const lastNote = filteredNotes[filteredNotes.length - 1];
        if (lastNote && this.currentTime > lastNote.time + lastNote.duration + 2.0) {
            this.isPlaying = false;
            if (this.onSongComplete) {
                this.onSongComplete({
                    score: this.score,
                    hitCount: this.hitNotesCount,
                    totalCount: this.totalNotesInSong,
                    accuracy: this.totalNotesInSong > 0 ? Math.round((this.hitNotesCount / this.totalNotesInSong) * 100) : 100
                });
            }
        }
    }

    handleUserKeyPress(midi) {
        if (!this.song || !this.isPlaying || this.mode === 'demo') return false;

        const filteredNotes = this.getFilteredNotes();
        const hitWindow = this.mode === 'wait' ? 0.35 : 0.22;
        let matched = false;

        for (let i = 0; i < filteredNotes.length; i++) {
            const n = filteredNotes[i];
            if (n.midi !== midi) continue;

            const state = this.noteStates.get(i);
            if (state && state.hit) continue;

            const timeDiff = Math.abs(n.time - this.currentTime);

            // Note is in hittable range
            if (timeDiff <= hitWindow || (this.mode === 'wait' && this.currentTime >= n.time - 0.1 && this.currentTime <= n.time + n.duration + 0.2)) {
                this.noteStates.set(i, { hit: true, pressedTime: this.currentTime });
                this.hitNotesCount++;
                this.streak++;
                this.multiplier = Math.min(4, 1 + Math.floor(this.streak / 5));

                let points = 50;
                let text = 'GOOD!';
                let color = '#38bdf8';

                if (timeDiff < 0.08) {
                    points = 100;
                    text = 'PERFECT!';
                    color = '#fbbf24';
                }

                this.score += points * this.multiplier;
                this.triggerFeedback(text, color);
                this.spawnParticles(midi, color);
                this.notifyScore();
                matched = true;
                break;
            }
        }

        return matched;
    }

    triggerFeedback(text, color) {
        this.feedbackText = text;
        this.feedbackColor = color;
        this.feedbackTimer = 0.8;
    }

    spawnParticles(midi, color) {
        const keyInfo = this.keyPositions.get(midi);
        if (!keyInfo) return;

        const targetX = keyInfo.x + keyInfo.width / 2;
        const targetY = this.height - 10;

        for (let i = 0; i < 20; i++) {
            const angle = (Math.random() * Math.PI) + Math.PI; // upward burst
            const speed = 1.5 + Math.random() * 4.5;
            this.particles.push({
                x: targetX,
                y: targetY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                size: 2 + Math.random() * 3.5,
                life: 0.6 + Math.random() * 0.4,
                maxLife: 1.0,
                alpha: 1.0
            });
        }
    }

    notifyScore() {
        if (this.onScoreUpdate) {
            this.onScoreUpdate({
                score: this.score,
                streak: this.streak,
                multiplier: this.multiplier,
                hitCount: this.hitNotesCount,
                totalCount: this.totalNotesInSong
            });
        }
    }

    render() {
        if (!this.width || !this.height) this.updateKeyPositions();
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        ctx.clearRect(0, 0, w, h);

        // 1. Draw subtle background lane guidelines matching white/black keys
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(0, 0, w, h);

        this.keyPositions.forEach((info) => {
            if (info.isBlack) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                ctx.fillRect(info.x, 0, info.width, h);
            } else {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
                ctx.strokeRect(info.x, 0, info.width, h);
            }
        });

        // 2. Draw Hit Line at the bottom
        const hitLineY = h - 6;
        ctx.save();
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#818cf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(0, hitLineY);
        ctx.lineTo(w, hitLineY);
        ctx.stroke();
        ctx.restore();

        // 3. Draw Falling Notes
        if (this.song) {
            const filteredNotes = this.getFilteredNotes();
            const pixelsPerSecond = (h - 20) / this.lookAheadTime;

            filteredNotes.forEach((n, idx) => {
                const keyInfo = this.keyPositions.get(n.midi);
                if (!keyInfo) return;

                const timeUntilHit = n.time - this.currentTime;
                // Position Y where note hits the line:
                // noteBottom = hitLineY - (timeUntilHit * pixelsPerSecond)
                const noteHeight = Math.max(16, n.duration * pixelsPerSecond);
                const noteBottom = hitLineY - (timeUntilHit * pixelsPerSecond);
                const noteTop = noteBottom - noteHeight;

                // Only render if visible in canvas
                if (noteBottom < 0 || noteTop > h) return;

                const state = this.noteStates.get(idx);
                const isHit = state && state.hit;
                const isMissed = state && state.missed;

                const x = keyInfo.x + 2;
                const width = Math.max(4, keyInfo.width - 4);
                const radius = 6;

                // Color based on hand & state
                let primaryColor = n.hand === 'left' ? '#f59e0b' : '#38bdf8'; // Amber (Left) / Cyan (Right)
                let glowColor = n.hand === 'left' ? 'rgba(245, 158, 11, 0.6)' : 'rgba(56, 189, 248, 0.6)';

                if (isHit) {
                    primaryColor = '#10b981'; // Green on successful hit
                    glowColor = 'rgba(16, 185, 129, 0.7)';
                } else if (isMissed) {
                    primaryColor = '#ef4444'; // Red if missed
                    glowColor = 'rgba(239, 68, 68, 0.4)';
                }

                // Render glowing rounded note rectangle
                ctx.save();
                ctx.shadowColor = glowColor;
                ctx.shadowBlur = isHit ? 16 : 8;

                // Gradient fill for glass-neon look
                const grad = ctx.createLinearGradient(x, noteTop, x, noteBottom);
                grad.addColorStop(0, primaryColor);
                grad.addColorStop(1, '#ffffff');

                ctx.fillStyle = grad;
                this.fillRoundedRect(ctx, x, noteTop, width, noteHeight, radius);

                // Note letter name label on the head of the note
                if (noteHeight > 22 && width > 16) {
                    ctx.font = 'bold 11px system-ui';
                    ctx.fillStyle = '#0f172a';
                    ctx.textAlign = 'center';
                    ctx.fillText(MusicTheory.midiToNoteName(n.midi), x + width / 2, noteBottom - 6);
                }

                ctx.restore();
            });
        }

        // 4. Draw Particles
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // 5. Draw Hit Feedback ("PERFECT!", "GOOD!", "MISS")
        if (this.feedbackTimer > 0 && this.feedbackText) {
            ctx.save();
            ctx.font = 'bold 26px system-ui, -apple-system';
            ctx.textAlign = 'center';
            ctx.fillStyle = this.feedbackColor;
            ctx.shadowColor = this.feedbackColor;
            ctx.shadowBlur = 18;
            ctx.globalAlpha = Math.min(1.0, this.feedbackTimer * 1.5);
            ctx.fillText(this.feedbackText, w / 2, h * 0.45);
            ctx.restore();
        }

        // 6. Draw Countdown if beginning
        if (this.isPlaying && this.currentTime < 0) {
            const count = Math.ceil(-this.currentTime);
            ctx.save();
            ctx.font = 'bold 54px system-ui, -apple-system';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#60a5fa';
            ctx.shadowColor = '#3b82f6';
            ctx.shadowBlur = 24;
            ctx.fillText(`Get Ready: ${count}`, w / 2, h * 0.5);
            ctx.restore();
        }
    }

    fillRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }
}

window.FallingNotesVisualizer = FallingNotesVisualizer;
