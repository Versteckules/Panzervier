/**
 * Hybrid Storage System (Cookies + LocalStorage) for Panzerknacker IV
 * Guarantees progress persistence across reloads, browser restarts,
 * and different browser privacy settings.
 */
class GameStorage {
    constructor() {
        this.STORAGE_KEY = 'PK4_TASCHANGO1_STATE';
        this.LEGACY_KEY = 'PK4_TSCHANGO_STATE';
        this.COOKIE_DAYS = 60;
    }

    // Set cookie helper
    setCookie(name, value, days) {
        try {
            let expires = "";
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Lax";
        } catch (e) {
            console.warn("Cookie set error:", e);
        }
    }

    // Get cookie helper
    getCookie(name) {
        try {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) {
                    return decodeURIComponent(c.substring(nameEQ.length, c.length));
                }
            }
        } catch (e) {
            console.warn("Cookie read error:", e);
        }
        return null;
    }

    // Erase cookie helper
    eraseCookie(name) {
        this.setCookie(name, "", -1);
    }

    // Save full game state
    save(state) {
        const payload = JSON.stringify({
            level: state.level || 1,
            solved: state.solved || [],
            tokens: state.tokens || [],
            timestamp: Date.now()
        });

        // 1. Try LocalStorage
        try {
            localStorage.setItem(this.STORAGE_KEY, payload);
        } catch (e) {
            console.warn("LocalStorage save error:", e);
        }

        // 2. Try Cookie backup
        try {
            this.setCookie(this.STORAGE_KEY, payload, this.COOKIE_DAYS);
        } catch (e) {
            console.warn("Cookie backup save error:", e);
        }
    }

    // Load full game state
    load() {
        let rawData = null;

        // 1. Check LocalStorage
        try {
            rawData = localStorage.getItem(this.STORAGE_KEY) || localStorage.getItem(this.LEGACY_KEY);
        } catch (e) {}

        // 2. Fallback to Cookie
        if (!rawData) {
            rawData = this.getCookie(this.STORAGE_KEY) || this.getCookie(this.LEGACY_KEY);
        }

        if (rawData) {
            try {
                const parsed = JSON.parse(rawData);
                return {
                    level: typeof parsed.level === 'number' ? parsed.level : 1,
                    solved: Array.isArray(parsed.solved) ? parsed.solved : [],
                    tokens: Array.isArray(parsed.tokens) ? parsed.tokens : []
                };
            } catch (e) {
                console.warn("Failed to parse saved state", e);
            }
        }

        return {
            level: 1,
            solved: [],
            tokens: []
        };
    }

    // Complete Game Reset
    reset() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem(this.LEGACY_KEY);
        } catch (e) {}
        this.eraseCookie(this.STORAGE_KEY);
        this.eraseCookie(this.LEGACY_KEY);
    }
}

window.gameStorage = new GameStorage();

