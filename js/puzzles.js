/**
 * High-End Interactive Puzzles for Panzerknacker IV: Projekt Taschango1
 * Verified 100% Solvable, High Visual Polish, Skeuomorphic & Cyber-Vault Design.
 * 100% Mobile & Tablet Optimized with Retina/HiDPI vector sharpness & touch handling.
 */

class PuzzleManager {
    constructor(app) {
        this.app = app;
        this.sound = window.soundEngine;
        this.storage = window.gameStorage;

        // Level state containers
        this.l1 = { prismAngle: 12, lens1Y: 90, lens2Y: 170, dragging: null, solved: false };
        this.l2 = { nodes: [], edges: [], dragging: null, solved: false };
        this.l3 = { dialAngle: 0, currentStep: 0, targets: [38, 74, 19], locked: [false, false, false], isDragging: false, lastAngle: 0, solved: false };
        this.l4 = { board: [], rot: [], activePath: [], passivePath: [], solved: false };
        this.l5 = { hpf: 200, lpf: 8000, notch: 100, solved: false };
        this.l6 = { m: [3.5, 2.5, 5.0, 3.0], v: [false, false, false, false], solved: false };
        this.l7 = { solved: false, mirrors: [], sensors: [], collector: null, activeAlarm: null, collectorEnergized: false, laserPath: [] };
        this.l8 = { rOuter: 0, rMid: 0, rInner: 0, dragRing: null, lastAngle: 0, solved: false };
        this.l9 = { angle: 0, teeth: 0, isRunning: false, solved: false };
        this.l10 = { posX: 140, posY: 110, isDragging: false, solved: false };

        this.animFrames = {};
    }

    cancelAllAnimations() {
        Object.keys(this.animFrames).forEach(k => {
            if (this.animFrames[k]) cancelAnimationFrame(this.animFrames[k]);
        });
        this.animFrames = {};
    }

    // =========================================================================
    // CANVAS & GRAPHICS HELPERS (HiDPI Sharp Vector & Multi-Pass Glow)
    // =========================================================================
    setupCanvas(canvasId, logicalW = 500, logicalH = 265) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        canvas.width = Math.round(logicalW * dpr);
        canvas.height = Math.round(logicalH * dpr);
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        const ctx = canvas.getContext('2d');
        if (ctx.resetTransform) ctx.resetTransform();
        ctx.scale(dpr, dpr);

        // Prevent native touch gestures on canvas
        canvas.style.touchAction = 'none';
        return canvas;
    }

    // Non-destructive HiDPI canvas refresh on mobile resize / keyboard toggle
    refreshActiveCanvas(levelNum) {
        if (!levelNum || levelNum === 4) return;
        this.setupCanvas(`canvas-l${levelNum}`);
    }

    getCanvasPos(canvas, e, logicalW = 500, logicalH = 265) {
        const rect = canvas.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;
        if ((clientX === undefined || clientY === undefined) && e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if ((clientX === undefined || clientY === undefined) && e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        }
        return {
            x: (clientX - rect.left) * (logicalW / rect.width),
            y: (clientY - rect.top) * (logicalH / rect.height)
        };
    }

    // Multi-pass neon laser beam rendering with aura, corona, and white core
    drawLaserBeam(ctx, x1, y1, x2, y2, auraColor, coronaColor, auraW = 12, coronaW = 5, coreW = 2) {
        ctx.save();
        ctx.lineCap = 'round';

        // 1. Broad diffuse aura
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = auraColor;
        ctx.lineWidth = auraW;
        ctx.stroke();

        // 2. High-intensity corona
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = coronaColor;
        ctx.lineWidth = coronaW;
        ctx.stroke();

        // 3. Incandescent white-hot core
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = coreW;
        ctx.stroke();

        ctx.restore();
    }

    // High-tech blueprint / CRT military reticle background with depth & vignette
    drawCyberGrid(ctx, W, H, spacing = 25, color = 'rgba(0, 229, 255, 0.05)') {
        ctx.save();
        // Subtle CRT Vignette Depth
        const vig = ctx.createRadialGradient(W / 2, H / 2, W * 0.28, W / 2, H / 2, W * 0.72);
        vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vig.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        for (let x = spacing; x < W; x += spacing) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = spacing; y < H; y += spacing) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        // Center Crosshair Reticle
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(W / 2 - 12, H / 2); ctx.lineTo(W / 2 + 12, H / 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(W / 2, H / 2 - 12); ctx.lineTo(W / 2, H / 2 + 12); ctx.stroke();

        // Corner optical brackets
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
        ctx.lineWidth = 1.5;
        const b = 12;
        // Top-Left
        ctx.beginPath(); ctx.moveTo(10, 10 + b); ctx.lineTo(10, 10); ctx.lineTo(10 + b, 10); ctx.stroke();
        // Top-Right
        ctx.beginPath(); ctx.moveTo(W - 10 - b, 10); ctx.lineTo(W - 10, 10); ctx.lineTo(W - 10, 10 + b); ctx.stroke();
        // Bottom-Left
        ctx.beginPath(); ctx.moveTo(10, H - 10 - b); ctx.lineTo(10, H - 10); ctx.lineTo(10 + b, H - 10); ctx.stroke();
        // Bottom-Right
        ctx.beginPath(); ctx.moveTo(W - 10 - b, H - 10); ctx.lineTo(W - 10, H - 10); ctx.lineTo(W - 10, H - 10 - b); ctx.stroke();

        ctx.restore();
    }

    // =========================================================================
    // LEVEL 1: PRISMA-SPEKTRALLABOR
    // =========================================================================
    initL1() {
        this.cancelAllAnimations();
        this.l1 = { prismAngle: 12, lens1Y: 90, lens2Y: 170, dragging: null, solved: false };
        const canvas = this.setupCanvas('canvas-l1');
        if (!canvas) return;

        this.bindL1Touch(canvas);
        this.startL1Loop();
    }

    bindL1Touch(canvas) {
        canvas.style.touchAction = 'none';
        if (canvas.dataset.touchBound === '1') return;
        canvas.dataset.touchBound = '1';

        const onDown = (e) => {
            if (this.l1.solved) return;
            e.preventDefault();
            const pos = this.getCanvasPos(canvas, e);
            const nearLensX = Math.abs(pos.x - 300) < 52;
            const dL1 = Math.abs(pos.y - this.l1.lens1Y);
            const dL2 = Math.abs(pos.y - this.l1.lens2Y);

            if (nearLensX && (dL1 < 48 || dL2 < 48)) {
                if (dL1 <= dL2) {
                    this.l1.dragging = 'lens1';
                    this.l1.dragOffsetY = pos.y - this.l1.lens1Y;
                } else {
                    this.l1.dragging = 'lens2';
                    this.l1.dragOffsetY = pos.y - this.l1.lens2Y;
                }
            } else if (Math.hypot(pos.x - 175, pos.y - 132) < 85 || (pos.x >= 95 && pos.x <= 245 && pos.y >= 45 && pos.y <= 220)) {
                this.l1.dragging = 'prism';
                this.l1.dragStartX = pos.x;
                this.l1.dragStartY = pos.y;
                this.l1.dragStartAngle = this.l1.prismAngle;
            }
            if (this.l1.dragging && canvas.setPointerCapture && e.pointerId !== undefined) {
                try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
            }
        };

        const onMove = (e) => {
            if (!this.l1.dragging || this.l1.solved) return;
            e.preventDefault();
            const pos = this.getCanvasPos(canvas, e);
            const now = performance.now();

            if (this.l1.dragging === 'lens1') {
                let nextY = Math.max(38, Math.min(124, pos.y - (this.l1.dragOffsetY || 0)));
                const rad = (this.l1.prismAngle * Math.PI) / 180;
                const rY = 132.5 + Math.tan(rad - 0.28) * 125;
                const idealL1 = 96 + (55 - rY) / 0.85;
                if (Math.abs(nextY - idealL1) < 4.5) nextY = idealL1;
                if (Math.abs(nextY - this.l1.lens1Y) >= 0.8 && (!this.l1.lastSoundAt || now - this.l1.lastSoundAt > 50)) {
                    this.sound.playClick(650, 0.015);
                    this.l1.lastSoundAt = now;
                }
                this.l1.lens1Y = nextY;
            } else if (this.l1.dragging === 'lens2') {
                let nextY = Math.max(140, Math.min(227, pos.y - (this.l1.dragOffsetY || 0)));
                const rad = (this.l1.prismAngle * Math.PI) / 180;
                const bY = 132.5 + Math.tan(rad + 0.28) * 125;
                const idealL2 = 168 + (210 - bY) / 0.85;
                if (Math.abs(nextY - idealL2) < 4.5) nextY = idealL2;
                if (Math.abs(nextY - this.l1.lens2Y) >= 0.8 && (!this.l1.lastSoundAt || now - this.l1.lastSoundAt > 50)) {
                    this.sound.playClick(650, 0.015);
                    this.l1.lastSoundAt = now;
                }
                this.l1.lens2Y = nextY;
            } else if (this.l1.dragging === 'prism') {
                const dy = pos.y - this.l1.dragStartY;
                const dx = pos.x - this.l1.dragStartX;
                let nextAngle = Math.max(-35, Math.min(35, this.l1.dragStartAngle + dy * 0.45 + dx * 0.2));
                if (Math.abs(nextAngle) < 2.2) nextAngle = 0;
                if (Math.abs(nextAngle - this.l1.prismAngle) >= 0.6 && (!this.l1.lastSoundAt || now - this.l1.lastSoundAt > 50)) {
                    this.sound.playClick(600, 0.015);
                    this.l1.lastSoundAt = now;
                }
                this.l1.prismAngle = nextAngle;
            }
        };

        const onUp = (e) => {
            if (this.l1.dragging) {
                this.l1.dragging = null;
                if (canvas.releasePointerCapture && e.pointerId !== undefined) {
                    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
                }
            }
        };

        canvas.addEventListener('pointerdown', onDown);
        canvas.addEventListener('pointermove', onMove);
        canvas.addEventListener('pointerup', onUp);
        canvas.addEventListener('pointercancel', onUp);
    }

    l1AdjustPrism(delta) {
        if (this.l1.solved) return;
        this.sound.playClick(600, 0.02);
        this.l1.prismAngle = Math.max(-35, Math.min(35, this.l1.prismAngle + delta));
    }

    l1AdjustLens(lens, delta) {
        if (this.l1.solved) return;
        this.sound.playClick(700, 0.02);
        if (lens === 'lens1') {
            this.l1.lens1Y = Math.max(38, Math.min(227, this.l1.lens1Y + delta));
        } else if (lens === 'lens2') {
            this.l1.lens2Y = Math.max(38, Math.min(227, this.l1.lens2Y + delta));
        }
    }

    startL1Loop() {
        const canvas = document.getElementById('canvas-l1');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let time = 0;

        const loop = () => {
            time += 0.04;
            const W = 500, H = 265;
            ctx.clearRect(0, 0, W, H);

            // 1. Cyber-Grid with CRT Depth Vignette
            this.drawCyberGrid(ctx, W, H, 20);

            // 2. Optical bench rail along the bottom with micrometer markings
            ctx.fillStyle = '#080d16';
            ctx.fillRect(15, H - 24, W - 30, 10);
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(15, H - 24, W - 30, 10);
            for (let x = 25; x < W - 25; x += 12) {
                ctx.beginPath();
                ctx.moveTo(x, H - 24);
                ctx.lineTo(x, (x % 24 === 0) ? H - 16 : H - 20);
                ctx.strokeStyle = (x % 24 === 0) ? '#00e5ff' : 'rgba(0, 229, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // 3. High-Power Laser Emitter (Left)
            const emX = 12, emY = H/2 - 26, emW = 42, emH = 52;
            ctx.save();
            const emGrad = ctx.createLinearGradient(emX, emY, emX + emW, emY + emH);
            emGrad.addColorStop(0, '#334155');
            emGrad.addColorStop(0.5, '#1e293b');
            emGrad.addColorStop(1, '#090d16');
            ctx.fillStyle = emGrad;
            ctx.beginPath();
            ctx.roundRect(emX, emY, emW, emH, 6);
            ctx.fill();
            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Laser Warning Chevrons on Housing
            ctx.fillStyle = '#f59e0b';
            for (let i = 0; i < 4; i++) {
                ctx.fillRect(emX + 8 + i * 8, emY + 8, 3.5, emH - 16);
            }

            // Machined Brass Collimator Barrel
            ctx.fillStyle = '#b45309';
            ctx.fillRect(emX + emW, H/2 - 9, 10, 18);
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 1;
            ctx.strokeRect(emX + emW, H/2 - 9, 10, 18);

            // Pulsing Laser Exit Aperture
            const pulseGlow = 14 + Math.sin(time * 3) * 6;
            ctx.beginPath();
            ctx.arc(emX + emW + 10, H/2, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = pulseGlow;
            ctx.fill();
            ctx.restore();

            // 4. White Primary Incident Laser Beam (Multi-Pass with traveling photons)
            const beamEndX = 160;
            this.drawLaserBeam(ctx, emX + emW + 10, H/2, beamEndX, H/2, 'rgba(0, 229, 255, 0.25)', '#00e5ff', 12, 5, 2.5);
            for (let k = 0; k < 3; k++) {
                const pt = (time * 0.4 + k * 0.33) % 1;
                const px = (emX + emW + 10) + (beamEndX - (emX + emW + 10)) * pt;
                ctx.beginPath();
                ctx.arc(px, H/2, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 10;
                ctx.fill();
            }

            // 5. Precision Optical Crystal Prism (Rotatable)
            const isPrismActive = (this.l1.dragging === 'prism');
            const isPrismAligned = Math.abs(this.l1.prismAngle) < 6;
            ctx.save();
            ctx.translate(175, H/2);
            ctx.rotate((this.l1.prismAngle * Math.PI) / 180);

            // Turntable Degree Scale
            ctx.beginPath();
            ctx.arc(0, 0, 50, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.strokeStyle = isPrismActive ? '#00e5ff' : (isPrismAligned ? '#00e676' : 'rgba(0, 229, 255, 0.35)');
            ctx.lineWidth = isPrismActive ? 2.5 : 1.5;
            if (isPrismActive) {
                ctx.shadowColor = '#00e5ff';
                ctx.shadowBlur = 14;
            }
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;

            for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * 44, Math.sin(a) * 44);
                ctx.lineTo(Math.cos(a) * 50, Math.sin(a) * 50);
                ctx.strokeStyle = '#00e5ff';
                ctx.lineWidth = (a % (Math.PI / 6) === 0) ? 2 : 1;
                ctx.stroke();
            }

            // Glass Prism Triangle with Specular Facets
            ctx.beginPath();
            ctx.moveTo(-28, 40);
            ctx.lineTo(30, 0);
            ctx.lineTo(-28, -40);
            ctx.closePath();
            const prismGrad = ctx.createLinearGradient(-28, -40, 30, 40);
            prismGrad.addColorStop(0, 'rgba(0, 229, 255, 0.55)');
            prismGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.45)');
            prismGrad.addColorStop(0.7, 'rgba(0, 180, 216, 0.6)');
            prismGrad.addColorStop(1, 'rgba(15, 23, 42, 0.8)');
            ctx.fillStyle = prismGrad;
            ctx.fill();

            // Internal Chromatic Caustic Fan
            ctx.save();
            const rainbowGrad = ctx.createLinearGradient(-16, -10, 26, 10);
            rainbowGrad.addColorStop(0, 'rgba(255, 23, 68, 0.6)');
            rainbowGrad.addColorStop(0.5, 'rgba(0, 230, 118, 0.6)');
            rainbowGrad.addColorStop(1, 'rgba(41, 121, 255, 0.6)');
            ctx.fillStyle = rainbowGrad;
            ctx.beginPath();
            ctx.moveTo(-18, 0);
            ctx.lineTo(26, -16 + Math.sin(time*2)*1.5);
            ctx.lineTo(26, 16 - Math.sin(time*2)*1.5);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Specular Reflection Streak
            ctx.beginPath();
            ctx.moveTo(-24, -34);
            ctx.lineTo(24, -4);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.restore();

            // 6. Spectral Dispersion Calculations
            const rad = (this.l1.prismAngle * Math.PI) / 180;
            const rY = H/2 + Math.tan(rad - 0.28) * 125;
            const gY = H/2 + Math.tan(rad) * 125;
            const bY = H/2 + Math.tan(rad + 0.28) * 125;

            // 7. Moveable Optical Lenses (x = 300)
            const drawLens = (y, lbl, isActive) => {
                ctx.save();
                // Vertical Micrometer Slide Rail
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(300, 18);
                ctx.lineTo(300, H - 24);
                ctx.stroke();

                for (let ry = 25; ry < H - 25; ry += 10) {
                    ctx.beginPath();
                    ctx.moveTo(297, ry);
                    ctx.lineTo(303, ry);
                    ctx.strokeStyle = '#64748b';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                // Polished Optical Crown Glass Lens with Dielectric Anti-Reflective Glare
                ctx.beginPath();
                ctx.ellipse(300, y, 12, 32, 0, 0, Math.PI * 2);
                const lensGrad = ctx.createRadialGradient(297, y - 8, 2, 300, y, 28);
                lensGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
                lensGrad.addColorStop(0.3, 'rgba(0, 229, 255, 0.35)');
                lensGrad.addColorStop(0.7, 'rgba(147, 51, 234, 0.25)');
                lensGrad.addColorStop(1, 'rgba(15, 23, 42, 0.7)');
                ctx.fillStyle = lensGrad;
                ctx.fill();

                ctx.strokeStyle = isActive ? '#00e5ff' : '#ffffff';
                ctx.lineWidth = 2;
                ctx.shadowColor = isActive ? '#00e5ff' : 'transparent';
                ctx.shadowBlur = isActive ? 12 : 0;
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Precision Stainless Mount Clamps
                ctx.fillStyle = '#64748b';
                ctx.fillRect(290, y - 36, 20, 6);
                ctx.fillRect(290, y + 30, 20, 6);
                ctx.strokeStyle = '#cbd5e1';
                ctx.lineWidth = 1;
                ctx.strokeRect(290, y - 36, 20, 6);
                ctx.strokeRect(290, y + 30, 20, 6);

                // Label HUD (offset left of the rail so it never clips or overlaps the other lens)
                ctx.fillStyle = isActive ? '#00e5ff' : '#cbd5e1';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'right';
                ctx.fillText(lbl, 282, lbl.startsWith('L1') ? y - 14 : y + 18);
                ctx.restore();
            };

            const isL1Active = (this.l1.dragging === 'lens1');
            const isL2Active = (this.l1.dragging === 'lens2');
            drawLens(this.l1.lens1Y, 'L1 [α-ROT]', isL1Active);
            drawLens(this.l1.lens2Y, 'L2 [γ-BLAU]', isL2Active);

            // 8. Lens Refraction Geometry (calibrated so lens1Y≈55..62 and lens2Y≈202..210 center directly on sensors α and γ)
            const rLensEffect = (this.l1.lens1Y - 96) * 0.85;
            const bLensEffect = (this.l1.lens2Y - 168) * 0.85;
            const finalRY = rY + rLensEffect;
            const finalGY = gY;
            const finalBY = bY + bLensEffect;

            // 9. Multi-Pass Chromatic Laser Beams
            this.drawLaserBeam(ctx, 195, H/2, 300, rY, 'rgba(255, 23, 68, 0.25)', '#ff1744', 10, 4, 1.5);
            this.drawLaserBeam(ctx, 300, rY, W - 40, finalRY, 'rgba(255, 23, 68, 0.35)', '#ff1744', 12, 5, 2);

            this.drawLaserBeam(ctx, 195, H/2, W - 40, finalGY, 'rgba(0, 230, 118, 0.3)', '#00e676', 10, 4, 1.8);

            this.drawLaserBeam(ctx, 195, H/2, 300, bY, 'rgba(41, 121, 255, 0.25)', '#2979ff', 10, 4, 1.5);
            this.drawLaserBeam(ctx, 300, bY, W - 40, finalBY, 'rgba(41, 121, 255, 0.35)', '#2979ff', 12, 5, 2);

            // Traveling Chromatic Energy Packets
            for (let k = 0; k < 2; k++) {
                const pt = (time * 0.5 + k * 0.5) % 1;
                const rpx = 300 + (W - 40 - 300) * pt;
                const rpy = rY + (finalRY - rY) * pt;
                ctx.beginPath(); ctx.arc(rpx, rpy, 2.5, 0, Math.PI*2); ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#ff1744'; ctx.shadowBlur = 8; ctx.fill();

                const gpx = 195 + (W - 40 - 195) * pt;
                const gpy = H/2 + (finalGY - H/2) * pt;
                ctx.beginPath(); ctx.arc(gpx, gpy, 2.5, 0, Math.PI*2); ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#00e676'; ctx.shadowBlur = 8; ctx.fill();

                const bpx = 300 + (W - 40 - 300) * pt;
                const bpy = bY + (finalBY - bY) * pt;
                ctx.beginPath(); ctx.arc(bpx, bpy, 2.5, 0, Math.PI*2); ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#2979ff'; ctx.shadowBlur = 8; ctx.fill();
            }

            // 10. Sensor Alignment Receptors
            const sensors = [
                { y: 55, color: '#ff1744', name: 'α (ROT)' },
                { y: 132, color: '#00e676', name: 'β (GRÜN)' },
                { y: 210, color: '#2979ff', name: 'γ (BLAU)' }
            ];

            const hitR = Math.abs(finalRY - sensors[0].y) < 14;
            const hitG = Math.abs(finalGY - sensors[1].y) < 14;
            const hitB = Math.abs(finalBY - sensors[2].y) < 14;

            sensors.forEach((s, idx) => {
                const hit = (idx === 0 && hitR) || (idx === 1 && hitG) || (idx === 2 && hitB);
                ctx.save();
                ctx.fillStyle = '#0f172a';
                ctx.strokeStyle = hit ? s.color : '#334155';
                ctx.lineWidth = hit ? 3 : 2;
                ctx.beginPath();
                ctx.arc(W - 35, s.y, 16, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(W - 35, s.y, 8, 0, Math.PI * 2);
                ctx.fillStyle = hit ? s.color : 'rgba(255,255,255,0.08)';
                ctx.fill();

                if (hit) {
                    ctx.save();
                    ctx.translate(W - 35, s.y);
                    ctx.rotate(time * 0.8);

                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(-18, 0); ctx.lineTo(18, 0);
                    ctx.moveTo(0, -18); ctx.lineTo(0, 18);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(0, 0, 7, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowColor = s.color;
                    ctx.shadowBlur = 22;
                    ctx.fill();
                    ctx.restore();

                    const lockR = 20 + Math.sin(time * 4) * 3;
                    ctx.beginPath();
                    ctx.arc(W - 35, s.y, lockR, 0, Math.PI * 2);
                    ctx.strokeStyle = s.color;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }

                ctx.fillStyle = hit ? '#00e676' : '#94a3b8';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'right';
                ctx.fillText(s.name, W - 58, s.y + 4);
                ctx.restore();
            });

            const lcd = document.getElementById('lcd-1');
            if (hitR && hitG && hitB && !this.l1.solved) {
                this.l1.solved = true;
                this.sound.playSuccess();
                if (lcd) lcd.innerText = "SPEKTRAL-RESONANZ 100% // ENTSPERRT!";
                setTimeout(() => this.app.completeLevel(1, 'L1_PRISM'), 800);
            } else if (!this.l1.solved) {
                if (lcd) {
                    const hits = [hitR ? 'α' : '-', hitG ? 'β' : '-', hitB ? 'γ' : '-'].join(' ');
                    lcd.innerText = `SPEKTRAL-SENSOREN: [ ${hits} ] // PRISMA JUSTIEREN`;
                }
            }

            this.animFrames.l1 = requestAnimationFrame(loop);
        };

        this.animFrames.l1 = requestAnimationFrame(loop);
    }

    // =========================================================================
    // LEVEL 2: LASER-KNOTEN ENTWIRRUNG (Planar Graph / Untangle)
    // =========================================================================
    initL2() {
        this.cancelAllAnimations();
        const canvas = this.setupCanvas('canvas-l2');
        if (!canvas) return;

        // 100% Solvable Planar Wheel Graph W_7 (Center hub: 6, Outer ring: 0-1-2-3-4-5)
        // Starts in a scrambled position with 16 crossings
        this.l2.nodes = [
            { x: 345, y: 185 }, // Node 0
            { x: 155, y: 75 },  // Node 1
            { x: 250, y: 225 }, // Node 2
            { x: 250, y: 40 },  // Node 3
            { x: 345, y: 75 },  // Node 4
            { x: 155, y: 185 }, // Node 5
            { x: 95, y: 132 }   // Node 6 (Hub)
        ];

        this.l2.edges = [
            [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], // Outer 6-cycle ring
            [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5]  // 6 spokes to center hub
        ];

        this.l2.dragging = null;
        this.l2.solved = false;

        this.bindL2Touch(canvas);
        this.startL2Loop();
    }

    bindL2Touch(canvas) {
        canvas.style.touchAction = 'none';
        if (canvas.dataset.touchBound === '1') return;
        canvas.dataset.touchBound = '1';

        const onDown = (e) => {
            if (this.l2.solved) return;
            e.preventDefault();
            const pos = this.getCanvasPos(canvas, e);
            let bestIdx = null, bestDist = 48; // Generous 48px thumb hitbox
            this.l2.nodes.forEach((n, idx) => {
                const dist = Math.hypot(n.x - pos.x, n.y - pos.y);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestIdx = idx;
                }
            });
            if (bestIdx !== null) {
                this.l2.dragging = bestIdx;
                if (canvas.setPointerCapture && e.pointerId !== undefined) {
                    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
                }
                this.sound.playClick(900, 0.02);
            }
        };

        const onMove = (e) => {
            if (this.l2.dragging === null || this.l2.solved) return;
            e.preventDefault();
            const pos = this.getCanvasPos(canvas, e);
            this.l2.nodes[this.l2.dragging].x = Math.max(25, Math.min(475, pos.x));
            this.l2.nodes[this.l2.dragging].y = Math.max(25, Math.min(240, pos.y));
        };

        const onUp = (e) => {
            if (this.l2.dragging !== null) {
                this.l2.dragging = null;
                if (canvas.releasePointerCapture && e.pointerId !== undefined) {
                    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
                }
                this.sound.playClick(500, 0.02);
            }
        };

        canvas.addEventListener('pointerdown', onDown);
        canvas.addEventListener('pointermove', onMove);
        canvas.addEventListener('pointerup', onUp);
        canvas.addEventListener('pointercancel', onUp);
    }

    startL2Loop() {
        const canvas = document.getElementById('canvas-l2');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let pulsePhase = 0;
        let time = 0;

        const intersects = (p1, p2, p3, p4) => {
            const ccw = (a, b, c) => (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
            return (ccw(p1, p3, p4) !== ccw(p2, p3, p4)) && (ccw(p1, p2, p3) !== ccw(p1, p2, p4));
        };

        const getIntersectionPoint = (p1, p2, p3, p4) => {
            const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
            if (Math.abs(d) < 1e-5) return null;
            const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / d;
            const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / d;
            if (t > 0.01 && t < 0.99 && u > 0.01 && u < 0.99) {
                return {
                    x: p1.x + t * (p2.x - p1.x),
                    y: p1.y + t * (p2.y - p1.y)
                };
            }
            return null;
        };

        const loop = () => {
            time += 0.03;
            pulsePhase = (pulsePhase + 0.018) % 1;
            const W = 500, H = 265;
            ctx.clearRect(0, 0, W, H);

            // 1. Blueprint Cyber-Grid with Vignette
            this.drawCyberGrid(ctx, W, H, 24);

            // 2. Tokamak Fusion Reactor Magnetic Guide Rings
            ctx.save();
            const tcx = W / 2, tcy = H / 2;
            [65, 125, 185].forEach((tr, tIdx) => {
                ctx.beginPath();
                ctx.arc(tcx, tcy, tr, 0, Math.PI * 2);
                ctx.strokeStyle = tIdx === 1 ? 'rgba(0, 229, 255, 0.16)' : 'rgba(0, 229, 255, 0.07)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([6, 6]);
                ctx.stroke();
            });

            // Magnetic Sector Ticks with Subtle Ambient Rotation
            ctx.rotate(time * 0.04);
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
                ctx.beginPath();
                ctx.moveTo(tcx + Math.cos(a) * 55, tcy + Math.sin(a) * 55);
                ctx.lineTo(tcx + Math.cos(a) * 195, tcy + Math.sin(a) * 195);
                ctx.strokeStyle = 'rgba(0, 229, 255, 0.06)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            ctx.restore();

            // 3. Crossing Calculations
            const crossingEdges = new Set();
            const intersectionPoints = [];
            let totalCrossings = 0;

            for (let i = 0; i < this.l2.edges.length; i++) {
                for (let j = i + 1; j < this.l2.edges.length; j++) {
                    const e1 = this.l2.edges[i], e2 = this.l2.edges[j];
                    if (e1[0] === e2[0] || e1[0] === e2[1] || e1[1] === e2[0] || e1[1] === e2[1]) continue;

                    const p1 = this.l2.nodes[e1[0]], p2 = this.l2.nodes[e1[1]];
                    const p3 = this.l2.nodes[e2[0]], p4 = this.l2.nodes[e2[1]];

                    if (intersects(p1, p2, p3, p4)) {
                        crossingEdges.add(i);
                        crossingEdges.add(j);
                        totalCrossings++;
                        const pt = getIntersectionPoint(p1, p2, p3, p4);
                        if (pt) intersectionPoints.push(pt);
                    }
                }
            }

            // 4. Draw Laser Conduit Beams (Edges)
            this.l2.edges.forEach((e, idx) => {
                const p1 = this.l2.nodes[e[0]], p2 = this.l2.nodes[e[1]];
                const isCrossing = crossingEdges.has(idx);

                if (isCrossing) {
                    // Tangled: High-voltage Crimson Danger Conduit
                    this.drawLaserBeam(ctx, p1.x, p1.y, p2.x, p2.y, 'rgba(255, 23, 68, 0.35)', '#ff1744', 12, 4.5, 1.8);
                } else {
                    // Untangled: Stabilized Quantum Emerald Conduit
                    this.drawLaserBeam(ctx, p1.x, p1.y, p2.x, p2.y, 'rgba(0, 230, 118, 0.3)', '#00e676', 10, 3.8, 1.8);
                }

                // Traveling Photon Energy Packets
                for (let k = 0; k < 2; k++) {
                    const t = (pulsePhase + k * 0.5 + idx * 0.08) % 1;
                    const bx = p1.x + (p2.x - p1.x) * t;
                    const by = p1.y + (p2.y - p1.y) * t;
                    ctx.beginPath();
                    ctx.arc(bx, by, 3, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowColor = isCrossing ? '#ff1744' : '#00e676';
                    ctx.shadowBlur = 12;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            });

            // 5. Dynamic Crimson Danger Spark Singularity at Intersection Points
            intersectionPoints.forEach(pt => {
                ctx.save();
                // Concentric expanding shockwave
                const waveR = 4 + (pulsePhase * 16);
                const waveAlpha = Math.max(0, 1 - pulsePhase);
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, waveR, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 23, 68, ${waveAlpha * 0.75})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Pulsing central danger spark
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#ff1744';
                ctx.shadowBlur = 16;
                ctx.fill();

                // Cross warning crackle
                ctx.strokeStyle = '#ff1744';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(pt.x - 6, pt.y - 6); ctx.lineTo(pt.x + 6, pt.y + 6);
                ctx.moveTo(pt.x - 6, pt.y + 6); ctx.lineTo(pt.x + 6, pt.y - 6);
                ctx.stroke();
                ctx.restore();
            });

            // 6. Quantum Magnetic Containment Nodes
            this.l2.nodes.forEach((n, idx) => {
                const isDragged = (this.l2.dragging === idx);
                const isSelected = (this.l2.selectedNode === idx);
                ctx.save();

                // Outer Rotating Gear Bezel
                ctx.save();
                ctx.translate(n.x, n.y);
                ctx.rotate(time * (idx % 2 === 0 ? 1 : -1));
                const bezelR = isDragged ? 20 : (isSelected ? 17 : 14);
                ctx.beginPath();
                ctx.arc(0, 0, bezelR, 0, Math.PI * 2);
                const nodeGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, bezelR);
                nodeGrad.addColorStop(0, '#475569');
                nodeGrad.addColorStop(0.7, '#1e293b');
                nodeGrad.addColorStop(1, '#090d16');
                ctx.fillStyle = nodeGrad;
                ctx.fill();

                // 6 Magnetic Detent Teeth
                for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(a) * (bezelR - 3), Math.sin(a) * (bezelR - 3));
                    ctx.lineTo(Math.cos(a) * (bezelR + 3), Math.sin(a) * (bezelR + 3));
                    ctx.strokeStyle = isDragged ? '#ffffff' : (isSelected ? '#fbbf24' : '#00e5ff');
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                ctx.restore();

                // Selection / Drag Halo & Tactical HUD Brackets
                if (isDragged || isSelected) {
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, isDragged ? 30 : 25, 0, Math.PI * 2);
                    ctx.strokeStyle = isDragged ? 'rgba(0, 229, 255, 0.7)' : 'rgba(251, 191, 36, 0.7)';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([4, 4]);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Corner HUD Brackets
                    const hb = 22;
                    ctx.strokeStyle = isSelected ? '#fbbf24' : '#00e5ff';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath(); ctx.moveTo(n.x - hb, n.y - hb + 6); ctx.lineTo(n.x - hb, n.y - hb); ctx.lineTo(n.x - hb + 6, n.y - hb); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(n.x + hb, n.y - hb + 6); ctx.lineTo(n.x + hb, n.y - hb); ctx.lineTo(n.x + hb - 6, n.y - hb); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(n.x - hb, n.y + hb - 6); ctx.lineTo(n.x - hb, n.y + hb); ctx.lineTo(n.x - hb + 6, n.y + hb); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(n.x + hb, n.y + hb - 6); ctx.lineTo(n.x + hb, n.y + hb); ctx.lineTo(n.x + hb - 6, n.y + hb); ctx.stroke();

                    // Coordinates readout (auto-flips near right edge so it never clips)
                    ctx.fillStyle = '#00e5ff';
                    ctx.font = 'bold 9px monospace';
                    const nearRight = n.x > 400;
                    ctx.textAlign = nearRight ? 'right' : 'left';
                    ctx.fillText(`[${Math.round(n.x)}, ${Math.round(n.y)}]`, nearRight ? n.x - 24 : n.x + 24, n.y > 40 ? n.y - 12 : n.y + 18);
                }

                // Breathing Inner Plasma Core
                const coreR = (isDragged ? 10 : (isSelected ? 8 : 7)) + Math.sin(time * 3 + idx) * 1;
                ctx.beginPath();
                ctx.arc(n.x, n.y, Math.max(4, coreR), 0, Math.PI * 2);
                ctx.fillStyle = isDragged ? '#ffffff' : (isSelected ? '#fbbf24' : '#00e5ff');
                ctx.shadowColor = isSelected ? '#fbbf24' : '#00e5ff';
                ctx.shadowBlur = isDragged ? 22 : (isSelected ? 18 : 14);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Node Identifier Label (1-6 for ring, Z for hub)
                ctx.fillStyle = isDragged ? '#0f172a' : '#ffffff';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(idx === 6 ? 'Z' : String(idx + 1), n.x, n.y);

                ctx.restore();
            });

            // 7. LCD & Solve Status
            const lcd = document.getElementById('lcd-2');
            if (totalCrossings === 0 && !this.l2.solved) {
                this.l2.solved = true;
                this.sound.playSuccess();
                if (lcd) lcd.innerText = "ENERGIEGITTER VOLLSTÄNDIG ENTWIRRT!";
                setTimeout(() => this.app.completeLevel(2, 'L2_UNTANGLE'), 900);
            } else if (!this.l2.solved) {
                if (lcd) lcd.innerText = `KREUZUNGEN: ${totalCrossings} // KNOTEN FREI ZIEHEN`;
            }

            this.animFrames.l2 = requestAnimationFrame(loop);
        };

        this.animFrames.l2 = requestAnimationFrame(loop);
    }

    // =========================================================================
    // LEVEL 3: STETHOSKOP-KÖRPERSCHALL-TRESOR
    // =========================================================================
    initL3() {
        this.cancelAllAnimations();
        this.l3 = { dialAngle: 0, currentStep: 0, targets: [38, 74, 19], locked: [false, false, false], isDragging: false, lastAngle: 0, solved: false };
        const lcd = document.getElementById('lcd-3');
        if (lcd) {
            lcd.classList.remove('error');
            lcd.innerText = "STETHOSKOP AKTIV // 1. FALLRIEGEL SUCHEN";
        }
        const canvas = this.setupCanvas('canvas-l3');
        if (!canvas) return;

        this.bindL3Dial(canvas);
        this.startL3AudioOscilloscopeLoop();
    }

    l3StepDial(delta) {
        if (this.l3.solved) return;
        this.sound.playClick(700, 0.02);
        this.l3.dialAngle = (this.l3.dialAngle + delta * 3.6 + 360) % 360;
    }

    bindL3Dial(canvas) {
        canvas.style.touchAction = 'none';
        if (canvas.dataset.touchBound === '1') return;
        canvas.dataset.touchBound = '1';
        const cx = 160, cy = 132;

        const onDown = (e) => {
            if (this.l3.solved) return;
            e.preventDefault();
            const pos = this.getCanvasPos(canvas, e);
            if (Math.hypot(pos.x - cx, pos.y - cy) < 125) {
                this.l3.isDragging = true;
                this.l3.lastAngle = Math.atan2(pos.y - cy, pos.x - cx);
                if (canvas.setPointerCapture && e.pointerId !== undefined) {
                    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
                }
            }
        };

        const onMove = (e) => {
            if (!this.l3.isDragging || this.l3.solved) return;
            e.preventDefault();
            const pos = this.getCanvasPos(canvas, e);
            const curAngle = Math.atan2(pos.y - cy, pos.x - cx);
            let diff = curAngle - this.l3.lastAngle;
            if (diff > Math.PI) diff -= Math.PI * 2;
            if (diff < -Math.PI) diff += Math.PI * 2;

            this.l3.dialAngle = (this.l3.dialAngle + (diff * 180 / Math.PI) + 360) % 360;
            this.l3.lastAngle = curAngle;
            this.sound.playClick(600 + (this.l3.dialAngle % 20) * 15, 0.012);
        };

        const onUp = (e) => {
            if (this.l3.isDragging) {
                this.l3.isDragging = false;
                if (canvas.releasePointerCapture && e.pointerId !== undefined) {
                    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
                }
            }
        };

        canvas.addEventListener('pointerdown', onDown);
        canvas.addEventListener('pointermove', onMove);
        canvas.addEventListener('pointerup', onUp);
        canvas.addEventListener('pointercancel', onUp);
    }

    l3LockTumbler() {
        if (this.l3.solved || this.l3.currentStep >= 3) return;
        const curNum = Math.round((this.l3.dialAngle / 360) * 100) % 100;
        const target = this.l3.targets[this.l3.currentStep];
        const diff = Math.min(Math.abs(curNum - target), 100 - Math.abs(curNum - target));

        const lcd = document.getElementById('lcd-3');
        if (diff <= 1) {
            this.sound.playClick(1200, 0.06);
            this.l3.locked[this.l3.currentStep] = true;
            this.l3.currentStep++;

            if (this.l3.currentStep >= 3) {
                this.l3.solved = true;
                this.sound.playSuccess();
                if (lcd) lcd.innerText = "TRESORBOLZEN ENTRIEGELT (38-74-19)!";
                setTimeout(() => this.app.completeLevel(3, 'L3_STETHOSCOPE'), 900);
            } else {
                if (lcd) lcd.innerText = `FALLRIEGEL ${this.l3.currentStep}/3 EINGERASTET!`;
            }
        } else {
            this.sound.playError();
            if (lcd) {
                lcd.innerText = "KEINE RESONANZ AN DIESER POSITION!";
                lcd.classList.add('error');
                setTimeout(() => lcd.classList.remove('error'), 600);
            }
        }
    }

    startL3AudioOscilloscopeLoop() {
        const canvas = document.getElementById('canvas-l3');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let phase = 0;

        const loop = () => {
            const W = 500, H = 265;
            ctx.clearRect(0, 0, W, H);
            phase += 0.12;

            // 1. Vault Safe Dial (Left)
            const cx = 160, cy = 132, r = 95;

            // Dial Outer Shadow and Bevel
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, r + 14, 0, Math.PI * 2);
            ctx.fillStyle = '#0a0e17';
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 3;
            ctx.fill();
            ctx.stroke();

            // Machined Knurled Teeth Rim
            for (let i = 0; i < 48; i++) {
                const a = (i / 48) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(a) * (r + 7), cy + Math.sin(a) * (r + 7));
                ctx.lineTo(cx + Math.cos(a) * (r + 14), cy + Math.sin(a) * (r + 14));
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Brushed Stainless Steel Face
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            const steelGrad = ctx.createRadialGradient(cx - 20, cy - 20, 10, cx, cy, r);
            steelGrad.addColorStop(0, '#475569');
            steelGrad.addColorStop(0.5, '#334155');
            steelGrad.addColorStop(1, '#1e293b');
            ctx.fillStyle = steelGrad;
            ctx.fill();
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Dial Engraved Ticks & Numbers
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate((this.l3.dialAngle * Math.PI) / 180);

            for (let i = 0; i < 100; i++) {
                const a = (i / 100) * Math.PI * 2 - Math.PI / 2;
                const isMajor = (i % 10 === 0);
                const isMid = (i % 5 === 0);
                const tLen = isMajor ? 14 : (isMid ? 10 : 6);

                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * (r - tLen), Math.sin(a) * (r - tLen));
                ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                ctx.strokeStyle = isMajor ? '#ffffff' : (isMid ? '#cbd5e1' : '#64748b');
                ctx.lineWidth = isMajor ? 2.5 : 1.5;
                ctx.stroke();

                if (isMajor) {
                    ctx.save();
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 11px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const tx = Math.cos(a) * (r - 24);
                    const ty = Math.sin(a) * (r - 24);
                    ctx.translate(tx, ty);
                    ctx.rotate(a + Math.PI / 2);
                    ctx.fillText(String(i), 0, 0);
                    ctx.restore();
                }
            }
            ctx.restore();

            // Center Knob Cap
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.42, 0, Math.PI * 2);
            const knobGrad = ctx.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, r * 0.42);
            knobGrad.addColorStop(0, '#1e293b');
            knobGrad.addColorStop(1, '#090d16');
            ctx.fillStyle = knobGrad;
            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth = 2.5;
            ctx.fill();
            ctx.stroke();

            const curNum = Math.round((this.l3.dialAngle / 360) * 100) % 100;
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 19px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(String(curNum).padStart(2, '0'), cx, cy + 7);

            // Red Index Pointer at 12 o'clock
            ctx.beginPath();
            ctx.moveTo(cx, cy - r - 4);
            ctx.lineTo(cx - 8, cy - r - 16);
            ctx.lineTo(cx + 8, cy - r - 16);
            ctx.closePath();
            ctx.fillStyle = '#ff1744';
            ctx.fill();
            ctx.restore();

            // 2. High-Tech CRT Oscilloscope (Right)
            const ox = 310, oy = 25, ow = 175, oh = H - 50;
            ctx.save();
            // Bezel
            ctx.fillStyle = '#060d09';
            ctx.fillRect(ox, oy, ow, oh);
            ctx.strokeStyle = '#15803d';
            ctx.lineWidth = 2;
            ctx.strokeRect(ox, oy, ow, oh);

            // Oscilloscope Grid Reticle
            ctx.strokeStyle = 'rgba(34, 197, 94, 0.18)';
            ctx.lineWidth = 1;
            for (let x = ox + 15; x < ox + ow; x += 18) {
                ctx.beginPath(); ctx.moveTo(x, oy); ctx.lineTo(x, oy + oh); ctx.stroke();
            }
            for (let y = oy + 15; y < oy + oh; y += 18) {
                ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(ox + ow, y); ctx.stroke();
            }

            // Audio Vibration Calculation
            const target = this.l3.targets[this.l3.currentStep] || 0;
            const diff = Math.min(Math.abs(curNum - target), 100 - Math.abs(curNum - target));
            const closeness = Math.max(0, 1 - (diff / 10));
            const amplitude = 4 + (closeness * 44);

            // Draw High-Persistence Phosphor Beam Waveform with Harmonic Overtones
            ctx.beginPath();
            ctx.strokeStyle = closeness > 0.85 ? '#00e676' : '#16a34a';
            ctx.lineWidth = closeness > 0.85 ? 3.5 : 2;
            ctx.shadowColor = '#00e676';
            ctx.shadowBlur = closeness * 22;

            for (let x = 0; x < ow; x += 2) {
                const noise = (Math.random() - 0.5) * (2 + (1 - closeness) * 6);
                const fundamental = Math.sin(x * 0.12 + phase) * amplitude;
                const harmonic = (closeness > 0.5) ? Math.sin(x * 0.36 + phase * 2.2) * (amplitude * 0.35) : 0;
                const py = oy + oh/2 + fundamental + harmonic + noise;
                if (x === 0) ctx.moveTo(ox + x, py);
                else ctx.lineTo(ox + x, py);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Tumbler Locking Deadbolts with High-Polish LED Indicators
            const tumblerNames = ['RIEGEL I', 'RIEGEL II', 'RIEGEL III'];
            for (let t = 0; t < 3; t++) {
                const tx = ox + 43 + t * 44.5;
                const ty = oy + oh - 18;

                // Deadbolt housing slot
                ctx.fillStyle = '#090e17';
                ctx.fillRect(tx - 18, ty - 6, 36, 14);
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 1;
                ctx.strokeRect(tx - 18, ty - 6, 36, 14);

                // Sliding Steel Bolt
                const isLocked = this.l3.locked[t];
                ctx.fillStyle = isLocked ? '#00e676' : '#475569';
                ctx.fillRect(isLocked ? tx - 14 : tx - 4, ty - 4, isLocked ? 28 : 8, 10);

                if (isLocked) {
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowColor = '#00e676';
                    ctx.shadowBlur = 10;
                    ctx.fillRect(tx - 10, ty - 2, 20, 6);
                    ctx.shadowBlur = 0;
                }

                ctx.fillStyle = isLocked ? '#00e676' : '#64748b';
                ctx.font = 'bold 8px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(tumblerNames[t], tx, ty - 10);
            }

            ctx.restore();
            this.animFrames.l3 = requestAnimationFrame(loop);
        };

        this.animFrames.l3 = requestAnimationFrame(loop);
    }

    // =========================================================================
    // LEVEL 4: ROTIERENDE PLATINEN-KACHELN (Authentic Mil-Spec FR-4 PCB)
    // =========================================================================
    initL4() {
        this.cancelAllAnimations();
        // 4x4 Grid. Types: 1=Straight, 2=Corner, 3=Tee
        this.l4.board = [
            1, 2, 1, 2,
            2, 3, 2, 1,
            1, 2, 3, 2,
            2, 1, 2, 1
        ];
        this.l4.rot = [
            1, 0, 3, 2,
            0, 3, 1, 0,
            2, 1, 3, 0,
            1, 2, 0, 1
        ];
        this.l4.activePath = [];
        this.l4.passivePath = [];
        this.l4.solved = false;
        this.checkL4();
        this.renderL4();
    }

    l4RotateTile(idx) {
        if (this.l4.solved) return;
        this.sound.playClick(850, 0.025);
        this.l4.rot[idx] = (this.l4.rot[idx] + 1) % 4;
        this.checkL4();
        this.renderL4();
    }

    renderL4() {
        const grid = document.getElementById('l4-rot-grid');
        if (!grid) return;

        // Micro-components silkscreen & fixed I/O terminal pins
        const decor = (i) => {
            let ioPins = '';
            if (i === 0) {
                ioPins = `
                    <polygon points="21,0 29,0 25,7" fill="#00e5ff"/>
                    <polygon points="0,21 0,29 7,25" fill="#00e5ff"/>
                `;
            } else if (i === 15) {
                ioPins = `
                    <polygon points="21,50 29,50 25,43" fill="#ffb300"/>
                    <polygon points="50,21 50,29 43,25" fill="#ffb300"/>
                `;
            }
            return `
                <svg viewBox="0 0 50 50" style="position:absolute; inset:0; pointer-events:none; z-index:2;">
                    <text x="5" y="11" font-size="5" fill="rgba(255,255,255,0.22)" font-family="monospace">U${i+1}</text>
                    <rect x="36" y="4" width="8" height="4" fill="#1e293b" stroke="#64748b" stroke-width="0.5"/>
                    <circle cx="40" cy="44" r="1.5" fill="#f59e0b" opacity="0.4"/>
                    ${ioPins}
                </svg>
            `;
        };

        // 1. Unconnected Metallic ENIG Gold Traces
        const svgs = {
            1: `<line x1="0" y1="25" x2="50" y2="25" stroke="#78350f" stroke-width="8" stroke-linecap="square"/>
                <line x1="0" y1="25" x2="50" y2="25" stroke="#f59e0b" stroke-width="4" stroke-linecap="square"/>
                <circle cx="10" cy="25" r="4" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
                <circle cx="10" cy="25" r="1.5" fill="#cbd5e1"/>
                <circle cx="40" cy="25" r="4" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
                <circle cx="40" cy="25" r="1.5" fill="#cbd5e1"/>`,
            2: `<path d="M 25 50 L 25 32 L 32 25 L 50 25" stroke="#78350f" stroke-width="8" fill="none" stroke-linecap="square" stroke-linejoin="miter"/>
                <path d="M 25 50 L 25 32 L 32 25 L 50 25" stroke="#f59e0b" stroke-width="4" fill="none" stroke-linecap="square" stroke-linejoin="miter"/>
                <circle cx="25" cy="40" r="4" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
                <circle cx="25" cy="40" r="1.5" fill="#cbd5e1"/>
                <circle cx="40" cy="25" r="4" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
                <circle cx="40" cy="25" r="1.5" fill="#cbd5e1"/>`,
            3: `<path d="M 25 0 L 25 50 M 25 25 L 50 25" stroke="#78350f" stroke-width="8" fill="none" stroke-linecap="square"/>
                <path d="M 25 0 L 25 50 M 25 25 L 50 25" stroke="#f59e0b" stroke-width="4" fill="none" stroke-linecap="square"/>
                <circle cx="25" cy="10" r="4" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
                <circle cx="25" cy="10" r="1.5" fill="#cbd5e1"/>
                <circle cx="25" cy="40" r="4" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
                <circle cx="25" cy="40" r="1.5" fill="#cbd5e1"/>
                <circle cx="40" cy="25" r="4" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
                <circle cx="40" cy="25" r="1.5" fill="#cbd5e1"/>`
        };

        // 2. Passive Connected Traces (Subnetworks: Warm Luminous Amber Aura)
        const passiveSvgs = {
            1: `<line x1="0" y1="25" x2="50" y2="25" stroke="#f59e0b" stroke-width="9" stroke-linecap="square" filter="drop-shadow(0 0 4px #f59e0b)"/>
                <line x1="0" y1="25" x2="50" y2="25" stroke="#fef08a" stroke-width="3" stroke-linecap="square"/>
                <circle cx="10" cy="25" r="4.5" fill="#fef08a" stroke="#f59e0b" stroke-width="2"/>
                <circle cx="40" cy="25" r="4.5" fill="#fef08a" stroke="#f59e0b" stroke-width="2"/>`,
            2: `<path d="M 25 50 L 25 32 L 32 25 L 50 25" stroke="#f59e0b" stroke-width="9" fill="none" stroke-linecap="square" stroke-linejoin="miter" filter="drop-shadow(0 0 4px #f59e0b)"/>
                <path d="M 25 50 L 25 32 L 32 25 L 50 25" stroke="#fef08a" stroke-width="3" fill="none" stroke-linecap="square" stroke-linejoin="miter"/>
                <circle cx="25" cy="40" r="4.5" fill="#fef08a" stroke="#f59e0b" stroke-width="2"/>
                <circle cx="40" cy="25" r="4.5" fill="#fef08a" stroke="#f59e0b" stroke-width="2"/>`,
            3: `<path d="M 25 0 L 25 50 M 25 25 L 50 25" stroke="#f59e0b" stroke-width="9" fill="none" stroke-linecap="square" filter="drop-shadow(0 0 4px #f59e0b)"/>
                <path d="M 25 0 L 25 50 M 25 25 L 50 25" stroke="#fef08a" stroke-width="3" fill="none" stroke-linecap="square"/>
                <circle cx="25" cy="10" r="4.5" fill="#fef08a" stroke="#f59e0b" stroke-width="2"/>
                <circle cx="25" cy="40" r="4.5" fill="#fef08a" stroke="#f59e0b" stroke-width="2"/>
                <circle cx="40" cy="25" r="4.5" fill="#fef08a" stroke="#f59e0b" stroke-width="2"/>`
        };

        // 3. Main Power Energized Traces (Hyper-Cyan High-Voltage Neon Stream)
        const energizedSvgs = {
            1: `<line x1="0" y1="25" x2="50" y2="25" stroke="#00e5ff" stroke-width="10" stroke-linecap="square" filter="drop-shadow(0 0 8px #00e5ff)"/>
                <line x1="0" y1="25" x2="50" y2="25" stroke="#ffffff" stroke-width="3.5" stroke-linecap="square"/>
                <circle cx="10" cy="25" r="5" fill="#ffffff" stroke="#00e5ff" stroke-width="2"/>
                <circle cx="40" cy="25" r="5" fill="#ffffff" stroke="#00e5ff" stroke-width="2"/>`,
            2: `<path d="M 25 50 L 25 32 L 32 25 L 50 25" stroke="#00e5ff" stroke-width="10" fill="none" stroke-linecap="square" stroke-linejoin="miter" filter="drop-shadow(0 0 8px #00e5ff)"/>
                <path d="M 25 50 L 25 32 L 32 25 L 50 25" stroke="#ffffff" stroke-width="3.5" fill="none" stroke-linecap="square" stroke-linejoin="miter"/>
                <circle cx="25" cy="40" r="5" fill="#ffffff" stroke="#00e5ff" stroke-width="2"/>
                <circle cx="40" cy="25" r="5" fill="#ffffff" stroke="#00e5ff" stroke-width="2"/>`,
            3: `<path d="M 25 0 L 25 50 M 25 25 L 50 25" stroke="#00e5ff" stroke-width="10" fill="none" stroke-linecap="square" filter="drop-shadow(0 0 8px #00e5ff)"/>
                <path d="M 25 0 L 25 50 M 25 25 L 50 25" stroke="#ffffff" stroke-width="3.5" fill="none" stroke-linecap="square"/>
                <circle cx="25" cy="10" r="5" fill="#ffffff" stroke="#00e5ff" stroke-width="2"/>
                <circle cx="25" cy="40" r="5" fill="#ffffff" stroke="#00e5ff" stroke-width="2"/>
                <circle cx="40" cy="25" r="5" fill="#ffffff" stroke="#00e5ff" stroke-width="2"/>`
        };

        let html = '';
        for (let i = 0; i < 16; i++) {
            const type = this.l4.board[i];
            const rotDeg = this.l4.rot[i] * 90;
            const isEnergized = (this.l4.activePath || []).includes(i);
            const isPassive = (this.l4.passivePath || []).includes(i);

            let content = svgs[type];
            let stateClass = '';
            if (isEnergized) {
                content = energizedSvgs[type];
                stateClass = 'energized';
            } else if (isPassive) {
                content = passiveSvgs[type];
                stateClass = 'connected';
            }

            let roleClass = '';
            let ioBadge = '';
            if (i === 0) {
                roleClass = 'start-tile';
                ioBadge = `<span class="tile-io-badge in-badge">⚡ START</span>`;
            } else if (i === 15) {
                roleClass = 'end-tile';
                ioBadge = `<span class="tile-io-badge out-badge">${this.l4.solved ? 'OFFEN ✓' : 'ZIEL 🔒'}</span>`;
            }

            html += `<div class="rot-tile ${stateClass} ${roleClass}" onclick="window.puzzleManager.l4RotateTile(${i})">
                        ${ioBadge}
                        ${decor(i)}
                        <svg viewBox="0 0 50 50" style="transform: rotate(${rotDeg}deg);">${content}</svg>
                     </div>`;
        }
        grid.innerHTML = html;
    }

    checkL4() {
        const getPorts = (type, rot) => {
            let base = [false, false, false, false]; // T, R, B, L
            if (type === 1) base = [false, true, false, true]; // L-R
            if (type === 2) base = [false, true, true, false]; // B-R
            if (type === 3) base = [true, true, true, false];  // T-R-B
            const r = rot % 4;
            const res = [false, false, false, false];
            for (let i = 0; i < 4; i++) res[(i + r) % 4] = base[i];
            return res;
        };

        // Graph of bidirectional connections
        const adj = Array.from({ length: 16 }, () => []);
        for (let i = 0; i < 16; i++) {
            const r = Math.floor(i / 4), c = i % 4;
            const p = getPorts(this.l4.board[i], this.l4.rot[i]);
            // Up (T=0)
            if (p[0] && r > 0) {
                const nb = i - 4;
                if (getPorts(this.l4.board[nb], this.l4.rot[nb])[2]) adj[i].push(nb);
            }
            // Right (R=1)
            if (p[1] && c < 3) {
                const nb = i + 1;
                if (getPorts(this.l4.board[nb], this.l4.rot[nb])[3]) adj[i].push(nb);
            }
            // Down (B=2)
            if (p[2] && r < 3) {
                const nb = i + 4;
                if (getPorts(this.l4.board[nb], this.l4.rot[nb])[0]) adj[i].push(nb);
            }
            // Left (L=3)
            if (p[3] && c > 0) {
                const nb = i - 1;
                if (getPorts(this.l4.board[nb], this.l4.rot[nb])[1]) adj[i].push(nb);
            }
        }

        // 1. Powered BFS from inlet (tile 0 connects via Left=3 or Top=0)
        const p0 = getPorts(this.l4.board[0], this.l4.rot[0]);
        const powered = new Set();
        if (p0[3] || p0[0]) {
            const q = [0];
            powered.add(0);
            while (q.length > 0) {
                const curr = q.shift();
                for (const nb of adj[curr]) {
                    if (!powered.has(nb)) {
                        powered.add(nb);
                        q.push(nb);
                    }
                }
            }
        }

        // 2. Passive Connected Clusters (any connected group of >= 2 tiles not yet powered)
        const visited = new Set(powered);
        const passive = new Set();
        for (let i = 0; i < 16; i++) {
            if (!visited.has(i) && adj[i].length > 0) {
                const cluster = [];
                const q = [i];
                visited.add(i);
                while (q.length > 0) {
                    const curr = q.shift();
                    cluster.push(curr);
                    for (const nb of adj[curr]) {
                        if (!visited.has(nb)) {
                            visited.add(nb);
                            q.push(nb);
                        }
                    }
                }
                if (cluster.length >= 2) {
                    cluster.forEach(c => passive.add(c));
                }
            }
        }

        this.l4.activePath = Array.from(powered);
        this.l4.passivePath = Array.from(passive);

        const p15 = getPorts(this.l4.board[15], this.l4.rot[15]);
        const solved = powered.has(15) && (p15[1] || p15[2]);

        const lcd = document.getElementById('lcd-4');
        const termOut = document.getElementById('l4-term-out');
        if (termOut) termOut.classList.toggle('active', solved);

        if (solved && !this.l4.solved) {
            this.l4.solved = true;
            this.sound.playSuccess();
            if (lcd) lcd.innerText = "STROMKREIS VOLLSTÄNDIG (100%)!";
            setTimeout(() => this.app.completeLevel(4, 'L4_CIRCUIT'), 800);
        } else if (!this.l4.solved) {
            if (lcd) {
                const pCount = powered.size;
                const cCount = passive.size;
                if (pCount > 0) {
                    lcd.innerText = `SIGNALFLUSS: [ ${pCount}/16 AKTIV ] ➔ ZUM ZIEL (RECHTS UNTEN)`;
                } else if (cCount > 0) {
                    lcd.innerText = `TEILKREIS: [ ${cCount} VERBUNDEN ] ➔ MIT START (LINKS OBEN) KOPPELN`;
                } else {
                    lcd.innerText = "START (LINKS OBEN) ➔ ZIEL (RECHTS UNTEN) VERBINDEN";
                }
            }
        }
    }

    // =========================================================================
    // LEVEL 5: FREQUENZ-SPEKTROGRAMM
    // =========================================================================
    initL5() {
        this.cancelAllAnimations();
        this.l5 = { hpf: 200, lpf: 8000, notch: 100, solved: false };
        const hpfEl = document.getElementById('l5-hpf');
        const lpfEl = document.getElementById('l5-lpf');
        const notchEl = document.getElementById('l5-notch');
        const lblHpf = document.getElementById('l5-lbl-hpf');
        const lblLpf = document.getElementById('l5-lbl-lpf');
        const lblNotch = document.getElementById('l5-lbl-notch');
        const inpEl = document.getElementById('l5-input');
        const lcdEl = document.getElementById('lcd-5');
        if (hpfEl) hpfEl.value = '200';
        if (lpfEl) lpfEl.value = '8000';
        if (notchEl) notchEl.value = '100';
        if (lblHpf) lblHpf.innerText = 'HPF: 200Hz';
        if (lblLpf) lblLpf.innerText = 'LPF: 8000Hz';
        if (lblNotch) lblNotch.innerText = 'NOTCH: 100Hz';
        if (inpEl) inpEl.value = '';
        if (lcdEl) lcdEl.classList.remove('error');

        const canvas = this.setupCanvas('canvas-l5');
        if (!canvas) return;

        this.startL5SpectrogramLoop();
    }

    l5UpdateKnob(id, val) {
        if (this.l5.solved) return;
        this.l5[id] = parseFloat(val);
        const lbl = document.getElementById(`l5-lbl-${id}`);
        if (lbl) lbl.innerText = `${id.toUpperCase()}: ${Math.round(this.l5[id])}Hz`;
        this.sound.playClick(this.l5[id] * 0.5, 0.02);
    }

    startL5SpectrogramLoop() {
        const canvas = document.getElementById('canvas-l5');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let t = 0;

        const loop = () => {
            const W = 500, H = 265;
            ctx.clearRect(0, 0, W, H);
            t += 0.06;

            this.drawCyberGrid(ctx, W, H, 20);

            const errH = Math.abs(this.l5.hpf - 850) / 1000;
            const errL = Math.abs(this.l5.lpf - 4200) / 4000;
            const errN = Math.abs(this.l5.notch - 500) / 600;
            const clarity = Math.max(0, 1 - (errH + errL + errN));

            // 40 High-Res Spectrum Equalizer Columns
            const barW = (W - 40) / 40;
            for (let i = 0; i < 40; i++) {
                const freq = i * 200;
                let active = (freq >= this.l5.hpf && freq <= this.l5.lpf && Math.abs(freq - this.l5.notch) > 150);
                let barH = active ? (Math.sin(i * 0.45 + t) * 0.5 + 0.5) * (H * 0.52) + 12 : 8;
                if (!active) barH *= 0.25;

                const bx = 20 + i * barW;
                const by = H - barH - 24;

                // Color Gradient (Green -> Amber -> Red peaks)
                const colGrad = ctx.createLinearGradient(bx, H - 24, bx, by);
                if (clarity > 0.8) {
                    colGrad.addColorStop(0, '#00e676');
                    colGrad.addColorStop(0.7, '#00e5ff');
                    colGrad.addColorStop(1, '#ffffff');
                } else if (active) {
                    colGrad.addColorStop(0, '#10b981');
                    colGrad.addColorStop(0.6, '#f59e0b');
                    colGrad.addColorStop(1, '#ef4444');
                } else {
                    colGrad.addColorStop(0, '#1e293b');
                    colGrad.addColorStop(1, '#334155');
                }

                ctx.fillStyle = colGrad;
                ctx.fillRect(bx + 1, by, barW - 2, barH);

                // Peak Dot
                ctx.fillStyle = active ? '#ffffff' : '#475569';
                ctx.fillRect(bx + 1, by - 3, barW - 2, 2);
            }

            // High-Clarity Decoded Signal: Glowing Military Nixie Tube Display
            if (clarity > 0.70) {
                ctx.save();
                ctx.globalAlpha = Math.min(1, (clarity - 0.70) * 3.5);
                const nx = W / 2 - 120, ny = 22, nw = 240, nh = 56;

                // Glass Chassis
                ctx.fillStyle = 'rgba(10, 16, 26, 0.92)';
                ctx.beginPath();
                ctx.roundRect(nx, ny, nw, nh, 8);
                ctx.fill();
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 1.5;
                ctx.shadowColor = '#f59e0b';
                ctx.shadowBlur = 14;
                ctx.stroke();

                ctx.fillStyle = '#94a3b8';
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('SIGNAL DECODER // TRANSC-05', W / 2, ny + 14);

                // Nixie Digits with Incandescent Bloom
                ctx.fillStyle = '#ffb300';
                ctx.font = 'bold 26px monospace';
                ctx.shadowColor = '#ffb300';
                ctx.shadowBlur = 20;
                ctx.fillText('7  4  2  9', W / 2, ny + 44);

                ctx.restore();
            }

            const lcd = document.getElementById('lcd-5');
            if (lcd) {
                if (clarity > 0.88) {
                    lcd.innerText = "SIGNAL REIN: 100% // CODE BESTÄTIGEN!";
                } else {
                    const percent = Math.round(clarity * 100);
                    lcd.innerText = `SIGNAL-KLARHEIT: ${percent}% // FILTER REGELN`;
                }
            }

            this.animFrames.l5 = requestAnimationFrame(loop);
        };

        this.animFrames.l5 = requestAnimationFrame(loop);
    }

    l5SubmitCode() {
        if (this.l5.solved) return;
        const inp = document.getElementById('l5-input');
        const val = (inp ? inp.value : "").trim();
        const lcd = document.getElementById('lcd-5');

        if (val === '7429') {
            this.l5.solved = true;
            this.sound.playSuccess();
            if (lcd) {
                lcd.classList.remove('error');
                lcd.innerText = "FREQUENZ-CODE VERIFIZIERT!";
            }
            setTimeout(() => this.app.completeLevel(5, 'L5_SPECTRUM'), 800);
        } else {
            this.sound.playError();
            if (lcd) {
                lcd.innerText = "FEHLERHAFTER FREQUENZ-CODE";
                lcd.classList.add('error');
                setTimeout(() => lcd.classList.remove('error'), 800);
            }
            if (inp) inp.value = "";
        }
    }

    // =========================================================================
    // LEVEL 6: PNEUMATISCHE DRUCKVENTIL-HYDRAULIK
    // =========================================================================
    initL6() {
        this.cancelAllAnimations();
        this.l6 = { m: [3.5, 2.5, 5.0, 3.0], v: [false, false, false, false], solved: false };
        for (let i = 0; i < 4; i++) {
            const btn = document.getElementById(`valve-btn-${i}`);
            if (btn) btn.classList.remove('active');
        }
        this.setupCanvas('canvas-l6');
        this.checkL6();
        this.startL6ManometerLoop();
    }

    l6ToggleValve(idx) {
        if (this.l6.solved) return;
        this.sound.playValveHiss();
        this.l6.v[idx] = !this.l6.v[idx];

        // Interconnected 4-valve hydraulic network with cross-chamber flow
        // Target: [3.5, 3.5, 3.5, 3.5]
        // Unique solution: (V0=ON, V1=ON, V2=OFF, V3=ON)
        const deltas = [
            [+1.5, -0.5, -1.0,  0.0], // Ventil I (Bypass α: M0+, M1-, M2-)
            [-0.5, +1.5,  0.0, -1.0], // Ventil II (Kreuzventil β: M1+, M0-, M3-)
            [ 0.0, -1.0, +1.5, -0.5], // Ventil III (Ausgleich γ: M2+, M1-, M3-)
            [-1.0,  0.0, -0.5, +1.5]  // Ventil IV (Rücklauf δ: M3+, M0-, M2-)
        ];

        const base = [3.5, 2.5, 5.0, 3.0];
        this.l6.m = [0, 1, 2, 3].map(j => {
            let val = base[j];
            for (let i = 0; i < 4; i++) {
                if (this.l6.v[i]) val += deltas[i][j];
            }
            return Math.max(0, Math.min(7, val));
        });

        const btn = document.getElementById(`valve-btn-${idx}`);
        if (btn) btn.classList.toggle('active', this.l6.v[idx]);

        this.checkL6();
    }

    startL6ManometerLoop() {
        const canvas = document.getElementById('canvas-l6');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const loop = () => {
            const W = 500, H = 265;
            ctx.clearRect(0, 0, W, H);

            this.drawCyberGrid(ctx, W, H, 20);

            // 3D Connecting Hydraulic Pressure Pipes
            ctx.save();
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 14;
            ctx.beginPath();
            ctx.moveTo(70, H * 0.45);
            ctx.lineTo(430, H * 0.45);
            ctx.stroke();

            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(70, H * 0.45 - 2);
            ctx.lineTo(430, H * 0.45 - 2);
            ctx.stroke();
            ctx.restore();

            const mPositions = [
                { x: W * 0.18, y: H * 0.45, lbl: 'M1' },
                { x: W * 0.39, y: H * 0.45, lbl: 'M2' },
                { x: W * 0.61, y: H * 0.45, lbl: 'M3' },
                { x: W * 0.82, y: H * 0.45, lbl: 'M4' }
            ];

            mPositions.forEach((pos, i) => {
                const press = Math.max(0, Math.min(7, this.l6.m[i]));
                const isTarget = Math.abs(press - 3.5) < 0.25;
                const r = 38;

                ctx.save();
                // 1. Brushed Brass Bezel Ring with Hex Bolts
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, r + 5, 0, Math.PI * 2);
                const bezelGrad = ctx.createRadialGradient(pos.x - 10, pos.y - 10, 5, pos.x, pos.y, r + 5);
                bezelGrad.addColorStop(0, '#f59e0b');
                bezelGrad.addColorStop(0.7, '#d97706');
                bezelGrad.addColorStop(1, '#78350f');
                ctx.fillStyle = bezelGrad;
                ctx.fill();
                ctx.strokeStyle = isTarget ? '#00e676' : '#92400e';
                ctx.lineWidth = 2;
                ctx.stroke();

                // 8 Bezel Rivets / Hex Bolts
                for (let rv = 0; rv < 8; rv++) {
                    const ra = (rv / 8) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.arc(pos.x + Math.cos(ra) * (r + 3), pos.y + Math.sin(ra) * (r + 3), 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = '#cbd5e1';
                    ctx.fill();
                }

                // 2. White Gauge Face
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
                ctx.fillStyle = '#0f172a';
                ctx.fill();

                // Calibrated Color Zones
                // Green Target Zone (3.5 bar)
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, r - 5, -Math.PI * 0.1, Math.PI * 0.1);
                ctx.strokeStyle = 'rgba(0, 230, 118, 0.7)';
                ctx.lineWidth = 5;
                ctx.stroke();

                // Dial Scale Ticks
                for (let b = 0; b <= 7; b += 0.5) {
                    const a = -Math.PI * 0.75 + (b / 7) * Math.PI * 1.5;
                    const len = (b % 1 === 0) ? 8 : 4;
                    ctx.beginPath();
                    ctx.moveTo(pos.x + Math.cos(a) * (r - len), pos.y + Math.sin(a) * (r - len));
                    ctx.lineTo(pos.x + Math.cos(a) * r, pos.y + Math.sin(a) * r);
                    ctx.strokeStyle = (b % 1 === 0) ? '#ffffff' : '#64748b';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }

                // 3. Slender Red Needle with Brass Pivot
                const needleAngle = -Math.PI * 0.75 + (press / 7) * Math.PI * 1.5;
                ctx.beginPath();
                ctx.moveTo(pos.x - Math.cos(needleAngle) * 8, pos.y - Math.sin(needleAngle) * 8);
                ctx.lineTo(pos.x + Math.cos(needleAngle) * (r - 7), pos.y + Math.sin(needleAngle) * (r - 7));
                ctx.strokeStyle = '#ff1744';
                ctx.lineWidth = 2.5;
                ctx.stroke();

                // Convex Glass Lens Glare Arc
                ctx.save();
                ctx.beginPath();
                ctx.ellipse(pos.x - 6, pos.y - 12, r * 0.65, r * 0.35, -0.3, 0, Math.PI * 2);
                const glassGrad = ctx.createLinearGradient(pos.x - 20, pos.y - 25, pos.x + 10, pos.y);
                glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
                glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = glassGrad;
                ctx.fill();
                ctx.restore();

                // Center Pin
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 4.5, 0, Math.PI * 2);
                ctx.fillStyle = '#fbbf24';
                ctx.fill();

                // Chamber Label above Gauge + Digital Readout below Gauge
                ctx.fillStyle = isTarget ? '#00e676' : '#94a3b8';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`KAMMER ${pos.lbl}`, pos.x, pos.y - 50);

                ctx.fillStyle = isTarget ? '#00e676' : '#ffffff';
                ctx.font = 'bold 12px monospace';
                ctx.fillText(`${press.toFixed(1)} bar`, pos.x, pos.y + 54);

                ctx.restore();
            });

            this.animFrames.l6 = requestAnimationFrame(loop);
        };

        this.animFrames.l6 = requestAnimationFrame(loop);
    }

    checkL6() {
        const balanced = this.l6.m.every(val => Math.abs(val - 3.5) < 0.25);
        const lcd = document.getElementById('lcd-6');

        if (balanced && !this.l6.solved) {
            this.l6.solved = true;
            this.sound.playSuccess();
            if (lcd) lcd.innerText = "DRUCKAUSGLEICH ERREICHT: 3.5 BAR!";
            setTimeout(() => this.app.completeLevel(6, 'L6_HYDRAULIC'), 800);
        } else if (!this.l6.solved) {
            if (lcd) {
                const vals = this.l6.m.map(v => v.toFixed(1)).join(' | ');
                lcd.innerText = `MANOMETER: [ ${vals} ] // ZIEL: 3.5 BAR`;
            }
        }
    }

    // =========================================================================
    // LEVEL 7: LASER-LICHTSCHRANKEN-PARCOURS
    // =========================================================================
    initL7() {
        this.cancelAllAnimations();
        // 4 rotatable optical prism mirrors (starts in alarm state: [135, 90, 45, 0])
        // Mathematically proven unique solution: [45, 45, 135, 135]
        this.l7 = {
            solved: false,
            mirrors: [
                { x: 145, y: 62,  angle: 135, name: 'α' },
                { x: 145, y: 195, angle: 90,  name: 'β' },
                { x: 315, y: 195, angle: 45,  name: 'γ' },
                { x: 315, y: 128, angle: 0,   name: 'δ' }
            ],
            sensors: [
                { id: 'A1', x: 462, y: 62,  label: 'ALARM-SENSOR 01' },
                { id: 'A2', x: 145, y: 240, label: 'BODEN-SCHRANKE 02' },
                { id: 'A3', x: 462, y: 195, label: 'ALARM-SENSOR 03' },
                { id: 'A4', x: 315, y: 26,  label: 'DECKEN-SCHRANKE 04' }
            ],
            collector: { x: 462, y: 128, label: 'BYPASS-KOLLEKTOR' },
            activeAlarm: null,
            collectorEnergized: false,
            laserPath: []
        };

        const canvas = this.setupCanvas('canvas-l7');
        if (!canvas) return;

        this.bindL7Touch(canvas);
        this.startL7LaserLoop();
    }

    bindL7Touch(canvas) {
        canvas.style.touchAction = 'none';
        if (canvas.dataset.touchBound === '1') return;
        canvas.dataset.touchBound = '1';

        const onDown = (e) => {
            if (this.l7.solved) return;
            e.preventDefault();
            const p = this.getCanvasPos(canvas, e);

            // Find closest mirror within 42px radius (comfortable thumb target)
            let clickedIdx = -1;
            let minDist = 44;
            this.l7.mirrors.forEach((m, idx) => {
                const dist = Math.hypot(m.x - p.x, m.y - p.y);
                if (dist < minDist) {
                    minDist = dist;
                    clickedIdx = idx;
                }
            });

            if (clickedIdx !== -1) {
                // Rotate mirror by 45 degrees
                this.l7.mirrors[clickedIdx].angle = (this.l7.mirrors[clickedIdx].angle + 45) % 180;
                this.sound.playClick(950, 0.03);
            }
        };

        canvas.addEventListener('pointerdown', onDown);
    }

    startL7LaserLoop() {
        const canvas = document.getElementById('canvas-l7');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const loop = (time) => {
            const W = 500, H = 265;
            ctx.clearRect(0, 0, W, H);

            // 1. Cybernetic Blueprint Background with Security Corridor Hazard Markings
            this.drawCyberGrid(ctx, W, H, 20);

            // Bunker corridor walls & hazard borders
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 23, 68, 0.25)';
            ctx.lineWidth = 2;
            ctx.strokeRect(10, 10, W - 20, H - 20);

            // Top/bottom yellow-black safety stripes
            for (let x = 15; x < W - 20; x += 24) {
                ctx.fillStyle = (Math.floor(x / 24) % 2 === 0) ? '#ffb300' : '#1e293b';
                ctx.fillRect(x, 10, 12, 4);
                ctx.fillRect(x, H - 14, 12, 4);
            }
            ctx.restore();

            // 2. Raytrace Laser Path
            const mPos = this.l7.mirrors;
            let cx = 35, cy = 62;
            let dx = 1, dy = 0;
            const path = [{ x: cx, y: cy }];
            let triggeredAlarm = null;
            let collectorHit = false;

            for (let step = 0; step < 8; step++) {
                let nextHit = null;
                let minDist = 99999;
                let hitType = null;
                let hitIdx = null;

                // Mirrors
                mPos.forEach((m, idx) => {
                    if (dx !== 0 && dy === 0 && Math.abs(cy - m.y) < 2) {
                        const dist = (m.x - cx) / dx;
                        if (dist > 1 && dist < minDist) {
                            minDist = dist;
                            nextHit = { x: m.x, y: m.y };
                            hitType = 'mirror';
                            hitIdx = idx;
                        }
                    } else if (dy !== 0 && dx === 0 && Math.abs(cx - m.x) < 2) {
                        const dist = (m.y - cy) / dy;
                        if (dist > 1 && dist < minDist) {
                            minDist = dist;
                            nextHit = { x: m.x, y: m.y };
                            hitType = 'mirror';
                            hitIdx = idx;
                        }
                    }
                });

                // Sensors & Collector
                const targets = [
                    ...this.l7.sensors.map(s => ({ x: s.x, y: s.y, type: 'alarm', id: s.id, label: s.label })),
                    { x: this.l7.collector.x, y: this.l7.collector.y, type: 'collector', label: this.l7.collector.label }
                ];

                targets.forEach(t => {
                    if (dx !== 0 && dy === 0 && Math.abs(cy - t.y) < 5) {
                        const dist = (t.x - cx) / dx;
                        if (dist > 1 && dist < minDist) {
                            minDist = dist;
                            nextHit = { x: t.x, y: t.y };
                            hitType = t.type;
                            hitIdx = t.id;
                        }
                    } else if (dy !== 0 && dx === 0 && Math.abs(cx - t.x) < 5) {
                        const dist = (t.y - cy) / dy;
                        if (dist > 1 && dist < minDist) {
                            minDist = dist;
                            nextHit = { x: t.x, y: t.y };
                            hitType = t.type;
                            hitIdx = t.id;
                        }
                    }
                });

                if (!nextHit) {
                    const wallX = dx > 0 ? W - 15 : (dx < 0 ? 15 : cx);
                    const wallY = dy > 0 ? H - 15 : (dy < 0 ? 15 : cy);
                    path.push({ x: wallX, y: wallY });
                    break;
                }

                path.push(nextHit);
                cx = nextHit.x;
                cy = nextHit.y;

                if (hitType === 'alarm') {
                    triggeredAlarm = hitIdx;
                    break;
                } else if (hitType === 'collector') {
                    collectorHit = true;
                    break;
                } else if (hitType === 'mirror') {
                    const ang = mPos[hitIdx].angle;
                    if (dx === 1 && dy === 0) {
                        if (ang === 45) { dx = 0; dy = 1; }
                        else if (ang === 135) { dx = 0; dy = -1; }
                        else if (ang === 90) { dx = -1; dy = 0; }
                    } else if (dx === -1 && dy === 0) {
                        if (ang === 45) { dx = 0; dy = -1; }
                        else if (ang === 135) { dx = 0; dy = 1; }
                        else if (ang === 90) { dx = 1; dy = 0; }
                    } else if (dx === 0 && dy === 1) {
                        if (ang === 45) { dx = 1; dy = 0; }
                        else if (ang === 135) { dx = -1; dy = 0; }
                        else if (ang === 0) { dx = 0; dy = -1; }
                    } else if (dx === 0 && dy === -1) {
                        if (ang === 45) { dx = -1; dy = 0; }
                        else if (ang === 135) { dx = 1; dy = 0; }
                        else if (ang === 0) { dx = 0; dy = 1; }
                    }
                }
            }

            this.l7.activeAlarm = triggeredAlarm;
            this.l7.collectorEnergized = collectorHit;
            this.l7.laserPath = path;

            // 3. Draw Laser Emitter (West wall)
            ctx.save();
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(12, 50, 24, 24);
            ctx.fillRect(12, 50, 24, 24);
            ctx.beginPath();
            ctx.arc(35, 62, 6, 0, Math.PI * 2);
            ctx.fillStyle = collectorHit ? '#00e676' : '#ff1744';
            ctx.shadowColor = collectorHit ? '#00e676' : '#ff1744';
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.restore();

            // 4. Draw Laser Beams with Multi-pass Glow
            for (let i = 0; i < path.length - 1; i++) {
                const p1 = path[i];
                const p2 = path[i + 1];
                if (collectorHit) {
                    this.drawLaserBeam(ctx, p1.x, p1.y, p2.x, p2.y, 'rgba(0, 230, 118, 0.35)', '#00e676', 10, 4, 1.8);
                } else {
                    this.drawLaserBeam(ctx, p1.x, p1.y, p2.x, p2.y, 'rgba(255, 23, 68, 0.4)', '#ff1744', 10, 4, 1.8);
                }
            }

            // 5. Draw Alarm Sensors
            this.l7.sensors.forEach(s => {
                const isHit = (triggeredAlarm === s.id);
                ctx.save();
                ctx.translate(s.x, s.y);

                // Sensor bezel
                ctx.beginPath();
                ctx.arc(0, 0, 14, 0, Math.PI * 2);
                ctx.fillStyle = isHit ? 'rgba(255, 23, 68, 0.3)' : '#0f172a';
                ctx.strokeStyle = isHit ? '#ff1744' : '#475569';
                ctx.lineWidth = 2;
                ctx.fill();
                ctx.stroke();

                // Siren Dome
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, Math.PI * 2);
                ctx.fillStyle = isHit ? '#ff1744' : '#7f1d1d';
                if (isHit) {
                    ctx.shadowColor = '#ff1744';
                    ctx.shadowBlur = 18;
                }
                ctx.fill();

                // ID label (placed to the right for floor/ceiling sensors so it never clips)
                ctx.fillStyle = isHit ? '#ff5252' : '#94a3b8';
                ctx.font = 'bold 8.5px monospace';
                if (s.id === 'A2' || s.id === 'A4') {
                    ctx.textAlign = 'left';
                    ctx.fillText(s.id, 18, 3);
                } else {
                    ctx.textAlign = 'center';
                    ctx.fillText(s.id, 0, 23);
                }

                ctx.restore();
            });

            // 6. Draw Bypass Collector
            ctx.save();
            const col = this.l7.collector;
            ctx.translate(col.x, col.y);
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = collectorHit ? '#00e676' : 'rgba(0, 230, 118, 0.3)';
            ctx.lineWidth = 2;
            ctx.strokeRect(-16, -16, 32, 32);
            ctx.fillRect(-16, -16, 32, 32);

            // Collector Cup
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fillStyle = collectorHit ? '#00e676' : '#064e3b';
            if (collectorHit) {
                ctx.shadowColor = '#00e676';
                ctx.shadowBlur = 22;
            }
            ctx.fill();

            // Label
            ctx.fillStyle = collectorHit ? '#00e676' : '#64748b';
            ctx.font = 'bold 8.5px monospace';
            ctx.textAlign = 'center';
            ctx.fillText("BYPASS", 0, 24);
            ctx.restore();

            // 7. Draw Interactive Prism Mirrors
            this.l7.mirrors.forEach((m, idx) => {
                ctx.save();
                ctx.translate(m.x, m.y);

                // Circular Turret Base with Degree Ticks
                ctx.beginPath();
                ctx.arc(0, 0, 22, 0, Math.PI * 2);
                ctx.fillStyle = '#1e293b';
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.5;
                ctx.fill();
                ctx.stroke();

                for (let a = 0; a < 360; a += 45) {
                    const rad = (a * Math.PI) / 180;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(rad) * 18, Math.sin(rad) * 18);
                    ctx.lineTo(Math.cos(rad) * 21, Math.sin(rad) * 21);
                    ctx.strokeStyle = (a % 90 === 0) ? '#38bdf8' : '#64748b';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                // Rotatable Mirror Surface (Silver / Neon Cyan Blade)
                const mRad = (m.angle * Math.PI) / 180;
                ctx.beginPath();
                ctx.moveTo(-Math.cos(mRad) * 17, -Math.sin(mRad) * 17);
                ctx.lineTo(Math.cos(mRad) * 17, Math.sin(mRad) * 17);
                ctx.strokeStyle = '#ffffff';
                ctx.shadowColor = '#00e5ff';
                ctx.shadowBlur = 8;
                ctx.lineWidth = 4;
                ctx.stroke();

                // Greek label & Angle Readout (offset off the beam axes so laser never crosses text)
                ctx.fillStyle = '#38bdf8';
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'right';
                ctx.fillText(`${m.name} (${m.angle}°)`, -25, idx === 2 ? 22 : -18);

                ctx.restore();
            });

            // 8. LCD & Puzzle Solve State
            const lcd = document.getElementById('lcd-7');
            if (collectorHit && !triggeredAlarm && !this.l7.solved) {
                this.l7.solved = true;
                this.sound.playSuccess();
                if (lcd) lcd.innerText = "LICHTSCHRANKE DEAKTIVIERT // SCHLEUSE FREI!";
                setTimeout(() => this.app.completeLevel(7, 'L7_SHADOW'), 900);
            } else if (!this.l7.solved) {
                if (lcd) {
                    if (triggeredAlarm) {
                        lcd.innerText = `ALARM: LICHTSCHRANKE AKTIV // ${this.l7.sensors.find(s=>s.id===triggeredAlarm)?.label || 'SENSOR'} AUSGELÖST`;
                        lcd.classList.add('error');
                    } else {
                        lcd.innerText = "ALARM INAKTIV // STRAHL IN BYPASS-KOLLEKTOR LENKEN";
                        lcd.classList.remove('error');
                    }
                }
            }

            this.animFrames.l7 = requestAnimationFrame(loop);
        };

        this.animFrames.l7 = requestAnimationFrame(loop);
    }

    // =========================================================================
    // LEVEL 8: KONZENTRISCHE KRYPTO-WALZE
    // =========================================================================
    initL8() {
        this.cancelAllAnimations();
        this.l8 = { rOuter: 0, rMid: 0, rInner: 0, dragRing: null, lastAngle: 0, solved: false };
        const canvas = this.setupCanvas('canvas-l8');
        if (!canvas) return;

        this.checkL8();
        this.bindL8Touch(canvas);
        this.startL8RotorLoop();
    }

    bindL8Touch(canvas) {
        canvas.style.touchAction = 'none';
        if (canvas.dataset.touchBound === '1') return;
        canvas.dataset.touchBound = '1';
        const cx = 250, cy = 136;

        const onDown = (e) => {
            if (this.l8.solved) return;
            e.preventDefault();
            const p = this.getCanvasPos(canvas, e);
            const dist = Math.hypot(p.x - cx, p.y - cy);
            if (dist >= 84 && dist <= 120) this.l8.dragRing = 'outer';
            else if (dist >= 54 && dist < 84) this.l8.dragRing = 'mid';
            else if (dist >= 24 && dist < 54) this.l8.dragRing = 'inner';
            else this.l8.dragRing = null;

            if (this.l8.dragRing) {
                this.l8.lastAngle = Math.atan2(p.y - cy, p.x - cx);
                if (canvas.setPointerCapture && e.pointerId !== undefined) {
                    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
                }
            }
        };

        const onMove = (e) => {
            if (!this.l8.dragRing || this.l8.solved) return;
            e.preventDefault();
            const p = this.getCanvasPos(canvas, e);
            const curAngle = Math.atan2(p.y - cy, p.x - cx);
            let diff = curAngle - this.l8.lastAngle;
            if (diff > Math.PI) diff -= Math.PI * 2;
            if (diff < -Math.PI) diff += Math.PI * 2;

            if (Math.abs(diff) > 0.22) {
                const step = diff > 0 ? 1 : -1;
                this.l8TurnRing(this.l8.dragRing, step);
                this.l8.lastAngle = curAngle;
            }
        };

        const onUp = (e) => {
            if (this.l8.dragRing) {
                this.l8.dragRing = null;
                if (canvas.releasePointerCapture && e.pointerId !== undefined) {
                    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
                }
            }
        };

        canvas.addEventListener('pointerdown', onDown);
        canvas.addEventListener('pointermove', onMove);
        canvas.addEventListener('pointerup', onUp);
        canvas.addEventListener('pointercancel', onUp);
    }

    l8TurnRing(ring, delta) {
        if (this.l8.solved) return;
        this.sound.playClick(900, 0.03);
        if (ring === 'outer') this.l8.rOuter = (this.l8.rOuter + delta + 12) % 12;
        if (ring === 'mid') this.l8.rMid = (this.l8.rMid + delta + 12) % 12;
        if (ring === 'inner') this.l8.rInner = (this.l8.rInner + delta + 12) % 12;
        this.checkL8();
    }

    startL8RotorLoop() {
        const canvas = document.getElementById('canvas-l8');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const symbolsOuter = ['A','B','C','D','E','F','G','H','I','J','K','L'];
        const symbolsMid = ['1','2','3','4','5','6','7','8','9','10','11','12'];
        const symbolsInner = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];

        const loop = () => {
            const W = 500, H = 265;
            ctx.clearRect(0, 0, W, H);
            const cx = W / 2, cy = 136;

            this.drawCyberGrid(ctx, W, H, 20);

            // Laser Alignment Guide Beam down the 12 o'clock meridian
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(cx, 15);
            ctx.lineTo(cx, H - 15);
            ctx.strokeStyle = 'rgba(255, 23, 68, 0.45)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.shadowColor = '#ff1744';
            ctx.shadowBlur = 8;
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();

            // Concentric Stainless Steel Ball Bearings Race
            const drawBallRace = (radius, count) => {
                ctx.save();
                for (let i = 0; i < count; i++) {
                    const a = (i / count) * Math.PI * 2;
                    const bx = cx + Math.cos(a) * radius;
                    const by = cy + Math.sin(a) * radius;
                    ctx.beginPath();
                    ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
                    const bGrad = ctx.createRadialGradient(bx - 0.8, by - 0.8, 0.5, bx, by, 2.5);
                    bGrad.addColorStop(0, '#ffffff');
                    bGrad.addColorStop(0.5, '#94a3b8');
                    bGrad.addColorStop(1, '#1e293b');
                    ctx.fillStyle = bGrad;
                    ctx.fill();
                }
                ctx.restore();
            };

            // Draw Precision Concentric Machine Cylinders
            const drawCylinder = (rOuter, rInner, offset, syms, col, isTargetMet) => {
                ctx.save();

                // Cylindrical Metallic Base
                ctx.beginPath();
                ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
                ctx.arc(cx, cy, rInner, 0, Math.PI * 2, true);
                const ringGrad = ctx.createRadialGradient(cx, cy, rInner, cx, cy, rOuter);
                ringGrad.addColorStop(0, '#0a0f1d');
                ringGrad.addColorStop(0.4, '#151f32');
                ringGrad.addColorStop(0.7, '#1e2d48');
                ringGrad.addColorStop(1, '#0e1624');
                ctx.fillStyle = ringGrad;
                ctx.fill();

                // Precision Machined Bevel Borders
                ctx.beginPath();
                ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
                ctx.strokeStyle = col;
                ctx.lineWidth = 2.5;
                ctx.shadowColor = col;
                ctx.shadowBlur = 8;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Milled Detent Teeth around Outer Circumference
                for (let i = 0; i < 36; i++) {
                    const a = (i / 36) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.moveTo(cx + Math.cos(a) * (rOuter - 5), cy + Math.sin(a) * (rOuter - 5));
                    ctx.lineTo(cx + Math.cos(a) * rOuter, cy + Math.sin(a) * rOuter);
                    ctx.strokeStyle = col;
                    ctx.lineWidth = (i % 3 === 0) ? 2 : 1;
                    ctx.stroke();
                }

                // Laser-Engraved Dial Symbols
                for (let i = 0; i < 12; i++) {
                    const a = ((i + offset) / 12) * Math.PI * 2 - Math.PI / 2;
                    const midR = (rOuter + rInner) / 2;
                    const x = cx + Math.cos(a) * midR;
                    const y = cy + Math.sin(a) * midR;

                    // Check if this symbol is currently aligned under the 12 o'clock needle
                    const isNeedlePos = ((i + offset) % 12 === 0);
                    ctx.save();
                    if (isNeedlePos && isTargetMet) {
                        ctx.fillStyle = '#00e676';
                        ctx.shadowColor = '#00e676';
                        ctx.shadowBlur = 12;
                        ctx.font = 'bold 13px monospace';
                    } else if (isNeedlePos) {
                        ctx.fillStyle = '#ffb300';
                        ctx.shadowColor = '#ffb300';
                        ctx.shadowBlur = 8;
                        ctx.font = 'bold 12px monospace';
                    } else {
                        ctx.fillStyle = 'rgba(226, 232, 240, 0.75)';
                        ctx.font = 'bold 11px monospace';
                    }
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(syms[i], x, y);
                    ctx.restore();
                }

                ctx.restore();
            };

            const idxOuter = (12 - (this.l8.rOuter % 12)) % 12;
            const idxMid = (12 - (this.l8.rMid % 12)) % 12;
            const idxInner = (12 - (this.l8.rInner % 12)) % 12;

            // Outer Ring: 114px -> 86px
            drawCylinder(114, 86, this.l8.rOuter, symbolsOuter, '#f59e0b', (idxOuter === 2));
            drawBallRace(84, 24);

            // Middle Ring: 82px -> 56px
            drawCylinder(82, 56, this.l8.rMid, symbolsMid, '#00e5ff', (idxMid === 1));
            drawBallRace(54, 16);

            // Inner Ring: 52px -> 26px
            drawCylinder(52, 26, this.l8.rInner, symbolsInner, '#b388ff', (idxInner === 6));

            // Central Heavy Steel Axle Hub with Brass Cap & Socket Screws
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, 24, 0, Math.PI * 2);
            const hubGrad = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, 24);
            hubGrad.addColorStop(0, '#64748b');
            hubGrad.addColorStop(0.7, '#1e293b');
            hubGrad.addColorStop(1, '#090d16');
            ctx.fillStyle = hubGrad;
            ctx.fill();
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Brass center cap
            ctx.beginPath();
            ctx.arc(cx, cy, 10, 0, Math.PI * 2);
            const brassGrad = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, 10);
            brassGrad.addColorStop(0, '#fef08a');
            brassGrad.addColorStop(0.6, '#f59e0b');
            brassGrad.addColorStop(1, '#92400e');
            ctx.fillStyle = brassGrad;
            ctx.fill();
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Axle socket hex screws
            for (let i = 0; i < 4; i++) {
                const a = (i / 4) * Math.PI * 2;
                ctx.beginPath();
                ctx.arc(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16, 2, 0, Math.PI * 2);
                ctx.fillStyle = '#0f172a';
                ctx.fill();
            }
            ctx.restore();

            // Top Jewel-Mounted Alignment Cursor with Ruby Prism & Laser Tick (fully inside viewport)
            ctx.save();
            const topPinY = cy - 115;

            // Optical Ruby Gemstone Bezel
            ctx.beginPath();
            ctx.moveTo(cx, topPinY);
            ctx.lineTo(cx - 9, topPinY - 16);
            ctx.lineTo(cx + 9, topPinY - 16);
            ctx.closePath();
            const rubyGrad = ctx.createLinearGradient(cx - 9, topPinY - 16, cx + 9, topPinY);
            rubyGrad.addColorStop(0, '#ff1744');
            rubyGrad.addColorStop(0.5, '#ff5252');
            rubyGrad.addColorStop(1, '#b71c1c');
            ctx.fillStyle = rubyGrad;
            ctx.shadowColor = '#ff1744';
            ctx.shadowBlur = 14;
            ctx.fill();
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Jewel Facet Highlight
            ctx.beginPath();
            ctx.moveTo(cx, topPinY + 1);
            ctx.lineTo(cx - 4, topPinY - 12);
            ctx.lineTo(cx, topPinY - 15);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.fill();

            // Razor vernier tick mark
            ctx.beginPath();
            ctx.moveTo(cx, topPinY);
            ctx.lineTo(cx, topPinY + 8);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();

            this.animFrames.l8 = requestAnimationFrame(loop);
        };

        this.animFrames.l8 = requestAnimationFrame(loop);
    }

    checkL8() {
        const symbolsOuter = ['A','B','C','D','E','F','G','H','I','J','K','L'];
        const symbolsMid = ['1','2','3','4','5','6','7','8','9','10','11','12'];
        const symbolsInner = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];

        const idxOuter = (12 - (this.l8.rOuter % 12)) % 12;
        const idxMid = (12 - (this.l8.rMid % 12)) % 12;
        const idxInner = (12 - (this.l8.rInner % 12)) % 12;

        const isSolved = (idxOuter === 2 && idxMid === 1 && idxInner === 6);
        const lcd = document.getElementById('lcd-8');

        if (isSolved && !this.l8.solved) {
            this.l8.solved = true;
            this.sound.playSuccess();
            if (lcd) lcd.innerText = "WALZENRASTUNG SYNCHRON (C-2-VII)!";
            setTimeout(() => this.app.completeLevel(8, 'L8_ROTORS'), 800);
        } else if (!this.l8.solved) {
            if (lcd) {
                const syms = `OUT:${symbolsOuter[idxOuter]} | MID:${symbolsMid[idxMid]} | IN:${symbolsInner[idxInner]}`;
                lcd.innerText = `WALZEN-AUSRICHTUNG: [ ${syms} ]`;
            }
        }
    }

    // =========================================================================
    // LEVEL 9: EPIZYKLISCHES PLANETENGETRIEBE
    // =========================================================================
    initL9() {
        this.cancelAllAnimations();
        this.l9 = { angle: 0, teeth: 0, isRunning: false, solved: false };
        const lcd = document.getElementById('lcd-9');
        if (lcd) {
            lcd.classList.remove('error');
            lcd.innerText = "ANTRIEBS-ZÄHNE: [ 0 ]";
        }
        const canvas = this.setupCanvas('canvas-l9');
        if (!canvas) return;

        this.startL9GearLoop();
    }

    l9AdjustTeeth(delta) {
        if (this.l9.solved) return;
        this.sound.playGearTick();
        this.l9.teeth = Math.max(0, Math.min(40, this.l9.teeth + delta));
        const lcd = document.getElementById('lcd-9');
        if (lcd) {
            lcd.classList.remove('error');
            lcd.innerText = `ANTRIEBS-ZÄHNE: [ ${this.l9.teeth} ]`;
        }
    }

    l9Engage() {
        if (this.l9.solved) return;
        const lcd = document.getElementById('lcd-9');
        if (this.l9.teeth === 20) {
            this.l9.solved = true;
            this.sound.playSuccess();
            if (lcd) {
                lcd.classList.remove('error');
                lcd.innerText = "PLANETENGETRIEBE SYNCHRONISIERT (Z=20)!";
            }
            setTimeout(() => this.app.completeLevel(9, 'L9_PLANETARY'), 900);
        } else {
            this.sound.playError();
            if (lcd) {
                lcd.innerText = "ZAHNRAD-PHASENFEHLER!";
                lcd.classList.add('error');
                setTimeout(() => lcd.classList.remove('error'), 800);
            }
        }
    }

    startL9GearLoop() {
        const canvas = document.getElementById('canvas-l9');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const loop = () => {
            const W = 500, H = 265;
            ctx.clearRect(0, 0, W, H);
            this.l9.angle += 0.018;
            const cx = W / 2, cy = H / 2;

            this.drawCyberGrid(ctx, W, H, 20);

            // 1. Heavy Outer Ring Gear Housing (Gunmetal Casing)
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, 120, 0, Math.PI * 2);
            ctx.arc(cx, cy, 98, 0, Math.PI * 2, true);
            const casingGrad = ctx.createRadialGradient(cx, cy, 98, cx, cy, 120);
            casingGrad.addColorStop(0, '#111827');
            casingGrad.addColorStop(0.5, '#1e293b');
            casingGrad.addColorStop(1, '#090d16');
            ctx.fillStyle = casingGrad;
            ctx.fill();

            // Outer rim metallic bevels
            ctx.beginPath();
            ctx.arc(cx, cy, 120, 0, Math.PI * 2);
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(cx, cy, 98, 0, Math.PI * 2);
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 12 Perimeter High-Tensile Flange Hex Bolts
            for (let b = 0; b < 12; b++) {
                const ba = (b / 12) * Math.PI * 2;
                const bx = cx + Math.cos(ba) * 110;
                const by = cy + Math.sin(ba) * 110;
                ctx.beginPath();
                ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
                const boltGrad = ctx.createRadialGradient(bx - 1, by - 1, 0.5, bx, by, 3.5);
                boltGrad.addColorStop(0, '#cbd5e1');
                boltGrad.addColorStop(0.6, '#475569');
                boltGrad.addColorStop(1, '#0f172a');
                ctx.fillStyle = boltGrad;
                ctx.fill();
                ctx.strokeStyle = '#1e293b';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // 60 Machined Internal Ring Gear Involute Teeth
            for (let i = 0; i < 60; i++) {
                const a = (i / 60) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(a) * 94, cy + Math.sin(a) * 94);
                ctx.lineTo(cx + Math.cos(a) * 99, cy + Math.sin(a) * 99);
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            ctx.restore();

            // Planet Coordinates around Orbit Circle (r = 66)
            const planetPos = [];
            for (let p = 0; p < 3; p++) {
                const carrierAngle = this.l9.angle + (p * Math.PI * 2) / 3;
                planetPos.push({
                    x: cx + Math.cos(carrierAngle) * 66,
                    y: cy + Math.sin(carrierAngle) * 66
                });
            }

            // 2. Heavy Triangular Planet Carrier Spider (Trägerstern)
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(planetPos[0].x, planetPos[0].y);
            ctx.lineTo(planetPos[1].x, planetPos[1].y);
            ctx.lineTo(planetPos[2].x, planetPos[2].y);
            ctx.closePath();
            ctx.strokeStyle = 'rgba(71, 85, 105, 0.8)';
            ctx.lineWidth = 10;
            ctx.lineJoin = 'round';
            ctx.stroke();

            // Inner Carrier Spider Structural Bevel
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();

            // Orbit Pitch Circle Guide
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, 66, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 6]);
            ctx.stroke();
            ctx.restore();

            // 3. Central Polished Brass Sun Gear (Driven by Input)
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(this.l9.angle * 2.8);

            // Sun Gear Disk
            ctx.beginPath();
            ctx.arc(0, 0, 32, 0, Math.PI * 2);
            const sunGrad = ctx.createRadialGradient(-6, -6, 3, 0, 0, 32);
            sunGrad.addColorStop(0, '#fef08a');
            sunGrad.addColorStop(0.3, '#f59e0b');
            sunGrad.addColorStop(0.8, '#b45309');
            sunGrad.addColorStop(1, '#78350f');
            ctx.fillStyle = sunGrad;
            ctx.fill();
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // 20 Sun Gear Teeth with Chamfers
            for (let i = 0; i < 20; i++) {
                const a = (i / 20) * Math.PI * 2;
                ctx.save();
                ctx.rotate(a);
                ctx.fillStyle = '#f59e0b';
                ctx.fillRect(29, -3.5, 6, 7);
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 1;
                ctx.strokeRect(29, -3.5, 6, 7);
                ctx.restore();
            }

            // Central Keyway Drive Shaft
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI * 2);
            ctx.fillStyle = '#0f172a';
            ctx.fill();
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Keyway slot notch
            ctx.fillStyle = '#020617';
            ctx.fillRect(8, -2.5, 6, 5);

            ctx.restore();

            // 4. 3 Precision Ground Planetary Gears
            for (let p = 0; p < 3; p++) {
                const px = planetPos[p].x;
                const py = planetPos[p].y;

                ctx.save();
                ctx.translate(px, py);
                ctx.rotate(-this.l9.angle * 3.8);

                // Planet Gear Rim & Involute Teeth
                ctx.beginPath();
                ctx.arc(0, 0, 24, 0, Math.PI * 2);
                const planetGrad = ctx.createRadialGradient(-5, -5, 3, 0, 0, 24);
                planetGrad.addColorStop(0, '#475569');
                planetGrad.addColorStop(0.5, '#334155');
                planetGrad.addColorStop(0.9, '#1e293b');
                planetGrad.addColorStop(1, '#0f172a');
                ctx.fillStyle = planetGrad;
                ctx.fill();
                ctx.strokeStyle = '#00e5ff';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#00e5ff';
                ctx.shadowBlur = 6;
                ctx.stroke();
                ctx.shadowBlur = 0;

                // 16 Planet Teeth
                for (let t = 0; t < 16; t++) {
                    const ta = (t / 16) * Math.PI * 2;
                    ctx.save();
                    ctx.rotate(ta);
                    ctx.fillStyle = '#334155';
                    ctx.fillRect(22, -3, 5, 6);
                    ctx.strokeStyle = '#00e5ff';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(22, -3, 5, 6);
                    ctx.restore();
                }

                // 3 Counter-bored Weight Reduction Lightening Holes
                for (let h = 0; h < 3; h++) {
                    const ha = (h / 3) * Math.PI * 2;
                    const hx = Math.cos(ha) * 12;
                    const hy = Math.sin(ha) * 12;
                    ctx.beginPath();
                    ctx.arc(hx, hy, 4, 0, Math.PI * 2);
                    ctx.fillStyle = '#090d16';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                // Bronze Axle Bushing & Locking Bolt
                ctx.beginPath();
                ctx.arc(0, 0, 5, 0, Math.PI * 2);
                ctx.fillStyle = '#f59e0b';
                ctx.fill();
                ctx.strokeStyle = '#d97706';
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.restore();
            }

            // 5. High-Tech Mechanical HUD Telemetry (compact corner placement clear of gear housing)
            ctx.save();
            const isEngaged = (this.l9.teeth === 20);

            // Top-Left Gear Train Spec
            ctx.fillStyle = 'rgba(0, 229, 255, 0.7)';
            ctx.font = 'bold 8.5px monospace';
            ctx.fillText('GETRIEBE: 3-PLANETEN', 14, 20);
            ctx.fillStyle = 'rgba(148, 163, 184, 0.65)';
            ctx.fillText('RATIO i = 3.333', 14, 32);

            // Top-Right Sync Status
            ctx.textAlign = 'right';
            if (isEngaged) {
                ctx.fillStyle = '#00e676';
                ctx.font = 'bold 9.5px monospace';
                ctx.shadowColor = '#00e676';
                ctx.shadowBlur = 10;
                ctx.fillText('SYNCHRON [ Z=20 ]', W - 14, 22);
            } else {
                ctx.fillStyle = '#f59e0b';
                ctx.font = 'bold 9.5px monospace';
                ctx.fillText(`PHASENFEHLER (Z=${this.l9.teeth})`, W - 14, 22);
            }
            ctx.restore();

            this.animFrames.l9 = requestAnimationFrame(loop);
        };

        this.animFrames.l9 = requestAnimationFrame(loop);
    }

    // =========================================================================
    // LEVEL 10: FLUCHT-VEKTORPLOTTER (Naval CRT Radar Display)
    // =========================================================================
    initL10() {
        this.cancelAllAnimations();
        this.l10 = { posX: 140, posY: 110, isDragging: false, solved: false };
        const canvas = this.setupCanvas('canvas-l10');
        if (!canvas) return;

        this.bindL10Radar(canvas);
        this.startL10RadarLoop();
    }

    bindL10Radar(canvas) {
        canvas.style.touchAction = 'none';
        if (canvas.dataset.touchBound === '1') return;
        canvas.dataset.touchBound = '1';

        const onDown = (e) => {
            if (this.l10.solved) return;
            e.preventDefault();
            this.l10.isDragging = true;
            const p = this.getCanvasPos(canvas, e);
            this.l10.posX = Math.max(25, Math.min(475, p.x));
            this.l10.posY = Math.max(25, Math.min(240, p.y));
            if (canvas.setPointerCapture && e.pointerId !== undefined) {
                try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
            }
            this.sound.playClick(1000, 0.02);
        };

        const onMove = (e) => {
            if (!this.l10.isDragging || this.l10.solved) return;
            e.preventDefault();
            const p = this.getCanvasPos(canvas, e);
            this.l10.posX = Math.max(25, Math.min(475, p.x));
            this.l10.posY = Math.max(25, Math.min(240, p.y));
        };

        const onUp = (e) => {
            if (this.l10.isDragging) {
                this.l10.isDragging = false;
                if (canvas.releasePointerCapture && e.pointerId !== undefined) {
                    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
                }
            }
        };

        canvas.addEventListener('pointerdown', onDown);
        canvas.addEventListener('pointermove', onMove);
        canvas.addEventListener('pointerup', onUp);
        canvas.addEventListener('pointercancel', onUp);
    }

    l10Nudge(dx, dy) {
        if (this.l10.solved) return;
        this.sound.playClick(900, 0.02);
        this.l10.posX = Math.max(25, Math.min(475, this.l10.posX + dx));
        this.l10.posY = Math.max(25, Math.min(240, this.l10.posY + dy));
    }

    startL10RadarLoop() {
        const canvas = document.getElementById('canvas-l10');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let sweepAngle = 0;

        const loop = () => {
            const W = 500, H = 265;
            ctx.clearRect(0, 0, W, H);
            sweepAngle = (sweepAngle + 0.035) % (Math.PI * 2);

            this.drawCyberGrid(ctx, W, H, 20);

            const targetX = W * 0.46, targetY = H * 0.54;
            const beacons = [
                { x: W * 0.20, y: H * 0.25, r: Math.hypot(targetX - W * 0.20, targetY - H * 0.25), name: 'BEACON-α' },
                { x: W * 0.80, y: H * 0.30, r: Math.hypot(targetX - W * 0.80, targetY - H * 0.30), name: 'BEACON-β' },
                { x: W * 0.45, y: H * 0.88, r: Math.hypot(targetX - W * 0.45, targetY - H * 0.88), name: 'BEACON-γ' }
            ];

            // Draw Beacons & Glowing Range Rings
            beacons.forEach(b => {
                ctx.save();
                ctx.beginPath();
                ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
                ctx.fillStyle = '#ffb300';
                ctx.shadowColor = '#ffb300';
                ctx.shadowBlur = 12;
                ctx.fill();

                // Range Circle
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 179, 0, 0.35)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([5, 5]);
                ctx.stroke();

                ctx.fillStyle = '#94a3b8';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(b.name, b.x, b.y - 12);
                ctx.restore();
            });

            // PPI Concentric Range Rings & Cardinal Headings (kept cleanly inside viewport)
            ctx.save();
            [45, 90, 135, 175].forEach(rr => {
                ctx.beginPath();
                ctx.arc(targetX, targetY, rr, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(0, 230, 118, 0.12)';
                ctx.lineWidth = 1;
                ctx.stroke();
            });
            ctx.fillStyle = 'rgba(0, 230, 118, 0.55)';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('N', targetX, 16);
            ctx.fillText('S', targetX, H - 8);
            ctx.fillText('E', W - 14, targetY + 3);
            ctx.fillText('W', 14, targetY + 3);
            ctx.restore();

            // CRT PPI Radar Phosphor Decay Sweep Trail
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(targetX, targetY);
            ctx.arc(targetX, targetY, 175, sweepAngle - 0.45, sweepAngle);
            ctx.closePath();
            const sweepGrad = ctx.createRadialGradient(targetX, targetY, 10, targetX, targetY, 175);
            sweepGrad.addColorStop(0, 'rgba(0, 230, 118, 0.28)');
            sweepGrad.addColorStop(1, 'rgba(0, 230, 118, 0.01)');
            ctx.fillStyle = sweepGrad;
            ctx.fill();
            ctx.restore();

            // Rotating Radar Sweep Line with Phosphor Glow
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(targetX, targetY);
            ctx.lineTo(targetX + Math.cos(sweepAngle) * 175, targetY + Math.sin(sweepAngle) * 175);
            ctx.strokeStyle = 'rgba(0, 230, 118, 0.85)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();

            // Draggable Reticle HUD
            const px = this.l10.posX, py = this.l10.posY;
            const dist = Math.hypot(px - targetX, py - targetY);
            const isLocked = (dist < 12);

            ctx.save();
            ctx.strokeStyle = isLocked ? '#00e676' : '#ff1744';
            ctx.lineWidth = isLocked ? 3 : 2;
            ctx.shadowColor = isLocked ? '#00e676' : '#ff1744';
            ctx.shadowBlur = isLocked ? 18 : 8;

            ctx.beginPath();
            ctx.arc(px, py, 16, 0, Math.PI * 2);
            ctx.moveTo(px - 26, py); ctx.lineTo(px + 26, py);
            ctx.moveTo(px, py - 26); ctx.lineTo(px, py + 26);
            ctx.stroke();

            // Coordinate HUD Readout (auto-flips near right edge so it never clips)
            ctx.fillStyle = isLocked ? '#00e676' : '#ffffff';
            ctx.font = 'bold 11px monospace';
            const flipLeft = px > 335;
            ctx.textAlign = flipLeft ? 'right' : 'left';
            const lblX = flipLeft ? px - 22 : px + 22;
            ctx.fillText(`TARGET: [ ${Math.round(px)}, ${Math.round(py)} ]`, lblX, py - 10);
            if (isLocked) {
                ctx.fillText(`LOCK: 100%`, lblX, py + 8);
            }
            ctx.restore();

            const launchBtn = document.getElementById('btn-launch-getaway');
            const lcd = document.getElementById('lcd-10');

            if (isLocked) {
                if (launchBtn) launchBtn.style.display = 'block';
                if (lcd && !this.l10.solved) lcd.innerText = "TRIANGULATION PERFEKT // ZÜNDUNG AUSLÖSEN!";
            } else if (!this.l10.solved) {
                if (launchBtn) launchBtn.style.display = 'none';
                if (lcd) lcd.innerText = `DISTANZ ZUM ZIEL: ${Math.round(dist)}m // FADENKREUZ AUSRICHTEN`;
            }

            this.animFrames.l10 = requestAnimationFrame(loop);
        };

        this.animFrames.l10 = requestAnimationFrame(loop);
    }

    l10TriggerGetaway() {
        if (this.l10.solved) return;
        this.l10.solved = true;
        this.sound.playVictoryFanfare();
        const lcd = document.getElementById('lcd-10');
        if (lcd) lcd.innerText = "ZÜNDUNG ERFOLGREICH! FLUCHT VOLLBRACHT!";
        setTimeout(() => this.app.completeLevel(10, 'L10_VECTOR'), 800);
    }
}

window.PuzzleManager = PuzzleManager;
