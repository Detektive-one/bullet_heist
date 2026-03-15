export class HUD {
  constructor(els) {
    this._els = els;
  }

  setBounces(n) { if (this._els.bounces) this._els.bounces.textContent = n; }
  setShots(n)   { if (this._els.shots)   this._els.shots.textContent   = n; }
  setLevel(n)   { if (this._els.level)   this._els.level.textContent   = n; }
  setPar(n)     { const el = document.getElementById('hud-par'); if (el) el.textContent = n ?? '—'; }

  setStatus(html) {
    if (this._els.status) this._els.status.innerHTML = html;
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
