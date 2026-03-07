import { neonTheme }   from './themes/neon.js';
import { arcadeTheme } from './themes/arcade.js';

/**
 * ThemeManager
 * ─────────────────────────────────────────────────────────────────────────────
 * Owns the active theme and applies it to the DOM (CSS custom properties).
 * The current theme object is also exposed so Renderer.js can read canvas colors.
 *
 * Usage:
 *   ThemeManager.apply('neon');          // switch theme
 *   ThemeManager.current.canvas.ballBase // read canvas color in renderer
 * ─────────────────────────────────────────────────────────────────────────────
 */

const REGISTRY = {
  [neonTheme.id]:   neonTheme,
  [arcadeTheme.id]: arcadeTheme,
};

let _fontLinkEl = null;

export const ThemeManager = {
  current: neonTheme,

  /** All available theme ids */
  get all() {
    return Object.values(REGISTRY);
  },

  /**
   * Apply a theme by id. Injects CSS vars into :root and updates
   * the Google Fonts <link> if the theme needs different fonts.
   * @param {string} id
   */
  apply(id) {
    const theme = REGISTRY[id];
    if (!theme) {
      console.warn(`[ThemeManager] Unknown theme: "${id}". Available: ${Object.keys(REGISTRY).join(', ')}`);
      return;
    }

    this.current = theme;

    // Apply CSS custom properties to :root
    const root = document.documentElement;
    for (const [prop, val] of Object.entries(theme.css)) {
      if (prop === '--font-import') continue; // handled separately
      root.style.setProperty(prop, val);
    }

    // Swap Google Fonts link if needed
    if (theme.css['--font-import']) {
      if (!_fontLinkEl) {
        _fontLinkEl = document.createElement('link');
        _fontLinkEl.rel = 'stylesheet';
        document.head.appendChild(_fontLinkEl);
      }
      _fontLinkEl.href = theme.css['--font-import'];
    }

    // Emit event so any listener can react (e.g. HUD to update font)
    window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
  },

  /** Cycle to the next theme (useful for a toggle button) */
  cycle() {
    const ids = Object.keys(REGISTRY);
    const idx = ids.indexOf(this.current.id);
    this.apply(ids[(idx + 1) % ids.length]);
  },
};
