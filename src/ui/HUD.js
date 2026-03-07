/**
 * HUD
 * ─────────────────────────────────────────────────────────────────────────────
 * Controls the DOM-based heads-up display elements (score, bounces, level, etc.)
 * Cleanly decoupled from canvas rendering.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export class HUD {
  /**
   * @param {{
   *   bounces: HTMLElement,
   *   shots: HTMLElement,
   *   level: HTMLElement,
   *   status: HTMLElement,
   * }} els
   */
  constructor(els) {
    this._els = els;
  }

  setBounces(n) { this._els.bounces.textContent = n; }
  setShots(n)   { this._els.shots.textContent   = n; }
  setLevel(n)   { this._els.level.textContent   = n; }

  setStatus(html) {
    this._els.status.innerHTML = html;
  }

  showIdle() {
    this.setStatus('<span>🎯 Drag</span> from the bullet and release to fire');
    this.setShots(1);
    this.setBounces(0);
  }

  showAiming() {
    this.setStatus('<span>🔮 Aiming…</span> release to fire!');
  }

  showFired() {
    this.setStatus('<span>💥 Bullet fired!</span>');
    this.setShots(0);
  }
}
