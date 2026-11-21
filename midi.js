/**
 * Web MIDI API Manager
 * Connects physical MIDI keyboards (USB or Bluetooth) to the virtual piano
 */

class MidiManager {
    constructor() {
        this.midiAccess = null;
        this.connectedDevices = [];
        this.onNoteOn = null;
        this.onNoteOff = null;
        this.onPedalChange = null;
        this.onDeviceStatusChange = null;
        this.isSupported = !!navigator.requestMIDIAccess;
    }

    async init() {
        if (!this.isSupported) {
            console.warn('Web MIDI API is not supported in this browser.');
            this.notifyStatus('unsupported');
            return false;
        }

        try {
            this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
            this.setupInputs();
            this.midiAccess.onstatechange = (e) => this.onStateChange(e);
            return true;
        } catch (err) {
            console.warn('MIDI Access request denied or failed:', err);
            this.notifyStatus('error', err.message);
            return false;
        }
    }

    setupInputs() {
        this.connectedDevices = [];
        const inputs = this.midiAccess.inputs.values();
        for (let input of inputs) {
            this.connectedDevices.push({
                id: input.id,
                name: input.name || 'Generic MIDI Device',
                manufacturer: input.manufacturer || 'Standard'
            });
            input.onmidimessage = (msg) => this.handleMidiMessage(msg);
        }
        this.notifyStatus(this.connectedDevices.length > 0 ? 'connected' : 'no_devices');
    }

    onStateChange(event) {
        this.setupInputs();
    }

    handleMidiMessage(event) {
        const data = event.data;
        if (!data || data.length < 2) return;

        const status = data[0];
        const cmd = status >> 4;
        const channel = status & 0xf;
        const note = data[1];
        const velocity = data.length > 2 ? data[2] : 0;

        // Note On (cmd 9 = 1001)
        if (cmd === 9) {
            if (velocity > 0) {
                if (this.onNoteOn) this.onNoteOn(note, velocity / 127);
            } else {
                // Note on with 0 velocity is effectively note off
                if (this.onNoteOff) this.onNoteOff(note);
            }
        }
        // Note Off (cmd 8 = 1000)
        else if (cmd === 8) {
            if (this.onNoteOff) this.onNoteOff(note);
        }
        // Control Change (cmd 11 = 1011)
        else if (cmd === 11) {
            const controllerNumber = data[1];
            const value = data[2];
            // CC 64 is Sustain / Damper Pedal
            if (controllerNumber === 64) {
                const isDown = value >= 64;
                if (this.onPedalChange) this.onPedalChange(isDown);
            }
        }
    }

    notifyStatus(status, details = '') {
        if (this.onDeviceStatusChange) {
            this.onDeviceStatusChange({
                status: status,
                devices: this.connectedDevices,
                details: details
            });
        }
    }
}

window.midiManager = new MidiManager();
