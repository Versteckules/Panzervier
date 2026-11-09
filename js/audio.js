/**
 * Advanced Web Audio API Sound Synthesizer for Panzerknacker IV
 * Synthesizes all tactile acoustic effects, safe resonances, valve hisses,
 * crystal refractions, and fanfares on-the-fly.
 * 100% offline, zero external MP3s.
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.radioGainNode) {
            try {
                this.radioGainNode.gain.value = this.muted ? 0 : 1.35;
            } catch (e) {}
        }
        if (this.radioAudio) {
            try {
                this.radioAudio.muted = this.muted;
            } catch (e) {}
        }
        return this.muted;
    }

    playClick(freq = 800, duration = 0.04) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    }

    playGearTick() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(180, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.025);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.025);
        } catch (e) {}
    }

    playResonance(proximity) { // 0.0 to 1.0 (closeness to tumbler peak)
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const baseFreq = 300 + (proximity * 650);
            osc.type = proximity > 0.85 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.05 + (proximity * 0.15), this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.06);
        } catch (e) {}
    }

    playValveHiss() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            // White noise simulation with bandpass
            const bufferSize = this.ctx.sampleRate * 0.15;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
            filter.Q.setValueAtTime(2, this.ctx.currentTime);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start();
        } catch (e) {}
    }

    playPrismRefract() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            [587.33, 880, 1174.66].forEach((f, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const t = this.ctx.currentTime + (idx * 0.04);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, t);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.2);
            });
        } catch (e) {}
    }

    playSnap() {
        this.playClick(1400, 0.03);
    }

    playSuccess() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const chord = [523.25, 659.25, 783.99, 1046.50];
            chord.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const start = this.ctx.currentTime + (idx * 0.07);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, start);
                gain.gain.setValueAtTime(0.14, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(start);
                osc.stop(start + 0.35);
            });
        } catch (e) {}
    }

    playError() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(130, now);
            osc.frequency.linearRampToValueAtTime(70, now + 0.35);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.35);
        } catch (e) {}
    }

    playUnlock() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const osc1 = this.ctx.createOscillator();
            const gain1 = this.ctx.createGain();
            const now = this.ctx.currentTime;
            osc1.type = 'square';
            osc1.frequency.setValueAtTime(80, now);
            gain1.gain.setValueAtTime(0.3, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
            osc1.connect(gain1);
            gain1.connect(this.ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.45);

            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(220, now + 0.08);
            gain2.gain.setValueAtTime(0.25, now + 0.08);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
            osc2.connect(gain2);
            gain2.connect(this.ctx.destination);
            osc2.start(now + 0.08);
            osc2.stop(now + 0.85);
        } catch (e) {}
    }

    playVictoryFanfare() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const notes = [
                { f: 523.25, d: 0.14, p: 0.0 },   // C5
                { f: 659.25, d: 0.14, p: 0.15 },  // E5
                { f: 783.99, d: 0.18, p: 0.30 },  // G5
                { f: 1046.50, d: 0.65, p: 0.50 }  // C6
            ];
            notes.forEach(n => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const start = this.ctx.currentTime + n.p;
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(n.f, start);
                gain.gain.setValueAtTime(0.25, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + n.d);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(start);
                osc.stop(start + n.d);
            });
        } catch (e) {}
    }

    // =========================================================================
    // AUTHENTIC FRANCONIAN RADIO VOICE TRANSMISSIONS (WALKIE-TALKIE FX)
    // =========================================================================
    toggleRadioTransmission(levelNum) {
        if (this.currentRadioLevel === levelNum && this.radioAudio && !this.radioAudio.paused) {
            this.stopRadioTransmission();
            return;
        }
        this.playRadioTransmission(levelNum);
    }

    playRadioSquelch(type = 'start') {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            // Short burst of filtered radio noise
            const bufSize = Math.floor(this.ctx.sampleRate * (type === 'start' ? 0.08 : 0.06));
            const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
            const noise = this.ctx.createBufferSource();
            noise.buffer = buf;
            const bpf = this.ctx.createBiquadFilter();
            bpf.type = 'bandpass';
            bpf.frequency.value = 2200;
            bpf.Q.value = 1.0;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + (type === 'start' ? 0.08 : 0.06));
            noise.connect(bpf);
            bpf.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start(now);

            // Radio Roger/Handshake beep
            const osc = this.ctx.createOscillator();
            const oscGain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(type === 'start' ? 1720 : 1240, now);
            oscGain.gain.setValueAtTime(0.12, now);
            oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.connect(oscGain);
            oscGain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.05);
        } catch (e) {}
    }

    playRadioTransmission(levelNum) {
        this.stopRadioTransmission();
        this.init();
        this.currentRadioLevel = levelNum;

        this.playRadioSquelch('start');

        const audio = new Audio(`audio/funk_${levelNum}.mp3?v=7`);
        audio.crossOrigin = "anonymous";
        audio.defaultPlaybackRate = 1.55;
        audio.playbackRate = 1.55;
        if ('preservesPitch' in audio) audio.preservesPitch = true;
        if ('mozPreservesPitch' in audio) audio.mozPreservesPitch = true;
        if ('webkitPreservesPitch' in audio) audio.webkitPreservesPitch = true;
        audio.addEventListener('loadedmetadata', () => {
            audio.playbackRate = 1.55;
        });
        this.radioAudio = audio;

        // Visual button state
        this.updateRadioButtons(levelNum, true);

        // Web Audio Walkie-Talkie Filter Chain
        if (this.ctx) {
            try {
                const source = this.ctx.createMediaElementSource(audio);
                const bpf = this.ctx.createBiquadFilter();
                bpf.type = 'bandpass';
                bpf.frequency.value = 1450; // authentic telephone/radio speech band
                bpf.Q.value = 0.95;

                const gainNode = this.ctx.createGain();
                gainNode.gain.value = this.muted ? 0 : 1.35;
                this.radioGainNode = gainNode;

                source.connect(bpf);
                bpf.connect(gainNode);
                gainNode.connect(this.ctx.destination);
            } catch (e) {
                // If createMediaElementSource fails (e.g. CORS or reuse), standard audio fallback
                audio.volume = this.muted ? 0 : 1.0;
            }
        }

        audio.play().catch(err => {
            console.warn("Audio play prevented:", err);
            this.stopRadioTransmission();
        });

        audio.onended = () => {
            this.playRadioSquelch('end');
            this.stopRadioTransmission();
        };

        audio.onerror = () => {
            this.stopRadioTransmission();
        };
    }

    stopRadioTransmission() {
        if (this.radioAudio) {
            try {
                this.radioAudio.pause();
                this.radioAudio.currentTime = 0;
            } catch (e) {}
            this.radioAudio = null;
        }
        this.radioGainNode = null;
        if (this.currentRadioLevel) {
            this.updateRadioButtons(this.currentRadioLevel, false);
            this.currentRadioLevel = null;
        }
    }

    updateRadioButtons(levelNum, isPlaying) {
        document.querySelectorAll('.radio-play-btn').forEach(btn => {
            btn.classList.remove('playing');
            const lbl = btn.querySelector('.radio-label');
            if (lbl) lbl.textContent = "FUNKSPRUCH ABHÖREN (FRÄNKISCH)";
            const icon = btn.querySelector('.radio-icon');
            if (icon) icon.textContent = "📻";
        });

        if (isPlaying && levelNum) {
            const activeBtn = document.getElementById(`radio-btn-${levelNum}`);
            if (activeBtn) {
                activeBtn.classList.add('playing');
                const lbl = activeBtn.querySelector('.radio-label');
                if (lbl) lbl.textContent = "FUNKSPRUCH STOPPEN ⏹️";
                const icon = activeBtn.querySelector('.radio-icon');
                if (icon) icon.textContent = "📡";
            }
        }
    }
}

window.soundEngine = new SoundEngine();
window.gameAudio = window.soundEngine;
