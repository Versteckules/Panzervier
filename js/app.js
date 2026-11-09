/**
 * Main Application Controller for Panzerknacker IV: Projekt Taschango1
 * Coordinates UI, screen transitions, state saving & final coordinates reveal.
 */

class App {
    constructor() {
        this.currentLevel = 0; // 0 = boot-screen
        this.savedLevel = 1;
        this.solvedLevels = [];
        this.tokens = [];
        this.storage = window.gameStorage;
        this.sound = window.soundEngine;
        this.crypto = window.gameCrypto;
        this.puzzles = null;
    }

    init() {
        this.puzzles = new window.PuzzleManager(this);
        window.puzzleManager = this.puzzles;

        // Check for saved progress
        const saved = this.storage.load();
        if (saved && saved.level > 1 && saved.tokens && saved.tokens.length > 0) {
            this.savedLevel = saved.level;
            this.solvedLevels = saved.solved || [];
            this.tokens = saved.tokens || [];
        } else {
            this.savedLevel = 1;
            this.solvedLevels = [];
            this.tokens = [];
        }

        // ALWAYS start at the boot screen on page load
        this.currentLevel = 0;
        this.switchScreen('boot-screen');
        this.renderBootScreen();
        this.updateStatusBar();
    }

    renderBootScreen() {
        const actionsEl = document.getElementById('boot-actions');
        if (!actionsEl) return;

        if (this.savedLevel && this.savedLevel > 1) {
            // Player has an existing savegame
            const lvlLabel = this.savedLevel > 10 ? "MISSION ERFÜLLT" : `SEKTOR ${String(this.savedLevel).padStart(2, '0')}`;
            actionsEl.innerHTML = `
                <button class="boot-btn boot-btn-continue" onclick="window.app.continueGame()">
                    ▶ FORTSETZEN // ${lvlLabel}
                </button>
                <button class="boot-btn boot-btn-restart" onclick="window.app.startNewGame()">
                    ↺ NEUSTART // AB SEKTOR 01
                </button>
            `;
        } else {
            // Fresh game
            actionsEl.innerHTML = `
                <button class="boot-btn boot-btn-start" onclick="window.app.startNewGame()">
                    ⚡ INFILTRATION STARTEN // SEKTOR 01 ⚡
                </button>
            `;
        }
    }

    continueGame() {
        this.sound.playClick(1000);
        if (this.savedLevel > 10) {
            this.currentLevel = 11;
            this.showFinalScreen();
            return;
        }
        this.currentLevel = this.savedLevel;
        this.switchScreen(`level-${this.currentLevel}`);
        this.updateStatusBar();
        setTimeout(() => this.initCurrentLevelPuzzle(), 80);
    }

    startNewGame() {
        this.sound.playClick(1000);
        this.currentLevel = 1;
        this.savedLevel = 1;
        this.solvedLevels = [];
        this.tokens = [];
        this.saveCurrentState();
        this.switchScreen('level-1');
        this.updateStatusBar();
        setTimeout(() => this.initCurrentLevelPuzzle(), 80);
    }

    switchScreen(screenId) {
        if (this.puzzles) this.puzzles.cancelAllAnimations();
        if (this.sound) this.sound.stopRadioTransmission();
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Show/hide status bar depending on screen
        const bar = document.querySelector('.status-bar');
        if (bar) {
            if (screenId === 'boot-screen') {
                bar.classList.add('hidden');
            } else {
                bar.classList.remove('hidden');
            }
        }
    }

    updateStatusBar() {
        const lvlDisplay = document.getElementById('status-level');
        const rstBtn = document.getElementById('btn-reset-level');
        if (lvlDisplay) {
            if (this.currentLevel >= 1 && this.currentLevel <= 10) {
                lvlDisplay.innerText = `LEVEL [ ${String(this.currentLevel).padStart(2, '0')} / 10 ]`;
                if (rstBtn) rstBtn.style.display = 'inline-flex';
            } else if (this.currentLevel > 10) {
                lvlDisplay.innerText = "MISSION ERFÜLLT";
                if (rstBtn) rstBtn.style.display = 'none';
            } else {
                lvlDisplay.innerText = "STANDBY";
                if (rstBtn) rstBtn.style.display = 'none';
            }
        }
    }

    initCurrentLevelPuzzle() {
        if (!this.puzzles) return;
        const methodName = `initL${this.currentLevel}`;
        if (typeof this.puzzles[methodName] === 'function') {
            this.puzzles[methodName]();
        }
    }

    completeLevel(levelNum, token) {
        if (this.currentLevel !== levelNum) return;
        if (!this.solvedLevels.includes(levelNum)) {
            this.solvedLevels.push(levelNum);
        }
        if (!this.tokens.includes(token)) {
            this.tokens.push(token);
        }

        if (levelNum < 10) {
            this.currentLevel = levelNum + 1;
            this.savedLevel = this.currentLevel;
            this.saveCurrentState();
            setTimeout(() => {
                this.switchScreen(`level-${this.currentLevel}`);
                this.updateStatusBar();
                setTimeout(() => this.initCurrentLevelPuzzle(), 80);
            }, 600);
        } else {
            // Level 10 Complete!
            this.currentLevel = 11;
            this.savedLevel = 11;
            this.saveCurrentState();
            setTimeout(() => {
                this.showFinalScreen();
            }, 600);
        }
    }

    async showFinalScreen() {
        this.switchScreen('final-screen');
        this.updateStatusBar();
        this.sound.playVictoryFanfare();

        const coordsEl = document.getElementById('final-coords');
        if (coordsEl) {
            coordsEl.innerText = "ENTSCHLÜSSELE SATELLITEN-DATEN...";
            try {
                const decrypted = await this.crypto.decryptCoordinates(this.tokens);
                coordsEl.dataset.rawCoords = decrypted;
                const parts = decrypted.trim().split(/\s{2,}/);
                if (parts.length === 2) {
                    coordsEl.innerHTML = `<span class="coord-part">${parts[0]}</span><span class="coord-part">${parts[1]}</span>`;
                } else {
                    coordsEl.innerText = decrypted;
                }
            } catch (e) {
                console.error("Decryption error:", e);
                coordsEl.innerText = "FEHLER BEI DER DECHIFFRIERUNG";
            }
        }
    }

    saveCurrentState() {
        this.storage.save({
            level: this.currentLevel,
            solved: this.solvedLevels,
            tokens: this.tokens
        });
    }

    // Reset current puzzle level
    resetCurrentLevel() {
        this.sound.playClick(500);
        this.initCurrentLevelPuzzle();
    }

    // Modal Confirmation for Complete Game Reset
    promptFullReset() {
        this.sound.playClick(400);
        const modal = document.getElementById('reset-modal');
        if (modal) modal.classList.add('active');
    }

    cancelFullReset() {
        this.sound.playClick(600);
        const modal = document.getElementById('reset-modal');
        if (modal) modal.classList.remove('active');
    }

    confirmFullReset() {
        this.sound.playClick(300);
        this.storage.reset();
        this.currentLevel = 0;
        this.savedLevel = 1;
        this.solvedLevels = [];
        this.tokens = [];
        const modal = document.getElementById('reset-modal');
        if (modal) modal.classList.remove('active');

        this.switchScreen('boot-screen');
        this.renderBootScreen();
        this.updateStatusBar();
    }

    toggleMute() {
        const isMuted = this.sound.toggleMute();
        const btn = document.getElementById('btn-sound-toggle');
        if (btn) {
            btn.innerHTML = isMuted ? '🔇 <span class="hide-mobile">TON AUS</span>' : '🔊 <span class="hide-mobile">TON AN</span>';
        }
    }

    copyCoords() {
        const coordsEl = document.getElementById('final-coords');
        if (!coordsEl) return;
        const text = coordsEl.dataset.rawCoords || coordsEl.innerText.replace(/\s+/g, ' ').trim();
        const showCopiedFeedback = () => {
            const btn = document.getElementById('btn-copy-coords');
            if (btn) {
                btn.innerText = "KOORDINATEN KOPIERT! ✓";
                setTimeout(() => btn.innerText = "KOORDINATEN KOPIEREN 📋", 2000);
            }
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(showCopiedFeedback).catch(() => {
                this.fallbackCopyText(text, showCopiedFeedback);
            });
        } else {
            this.fallbackCopyText(text, showCopiedFeedback);
        }
    }

    fallbackCopyText(text, onSuccess) {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            if (onSuccess) onSuccess();
        } catch (e) {}
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();

    // Non-destructive Mobile & Tablet Orientation / Resize Responsiveness
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.app && window.app.puzzles && window.app.currentLevel >= 1 && window.app.currentLevel <= 10) {
                window.app.puzzles.refreshActiveCanvas(window.app.currentLevel);
            }
        }, 200);
    });

    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            if (window.app && window.app.puzzles && window.app.currentLevel >= 1 && window.app.currentLevel <= 10) {
                window.app.puzzles.refreshActiveCanvas(window.app.currentLevel);
            }
        }, 250);
    });
});
