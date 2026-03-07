import { DESIGN_W, DESIGN_H, BALL_R, TARGET_R } from '../constants.js';
import { bounceWalls, circleRectOverlap, resolveObstacleCollision, simulateTrajectory } from './Physics.js';
import { Input }        from './Input.js';
import { Renderer }     from './Renderer.js';
import { HUD }          from '../ui/HUD.js';
import { Overlay }      from '../ui/Overlay.js';
import { ThemeManager } from '../theme/ThemeManager.js';

export class Game {
  constructor(canvas, hud, overlay) {
    this.canvas   = canvas;
    this.ctx      = canvas.getContext('2d');
    this.hud      = hud;
    this.overlay  = overlay;
    this.renderer = new Renderer(this.ctx, () => ThemeManager.current);

    this._state   = 'idle';
    this._level   = null;
    this._ball    = { x: 0, y: 0 };
    this._vel     = { x: 0, y: 0 };
    this._bounces = 0;
    this._trajectory = [];
    this._aimPower   = 0;

    // Moving obstacle runtime state
    this._movingStates = [];  // [{ def, rect, pos, dir }]

    this.input = new Input(canvas, () => ({ ...this._ball }));
    this._bindInput();
    this._raf = null;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  loadLevel(level) {
    this._level = level;
    this.hud.setLevel(level.id);

    // Init moving obstacle states
    this._movingStates = (level.movingObstacles ?? []).map(def => ({
      def,
      rect: { x: def.x, y: def.y, w: def.w, h: def.h },
      pos:  def.axis === 'x' ? def.x : def.y,
      dir:  1,
    }));

    this.reset();
  }

  reset() {
    if (!this._level) return;
    this._ball    = { ...this._level.ballStart };
    this._vel     = { x: 0, y: 0 };
    this._bounces = 0;
    this._trajectory = [];
    this._aimPower   = 0;

    // Reset moving obstacles
    for (const s of this._movingStates) {
      s.pos = s.def.axis === 'x' ? s.def.x : s.def.y;
      s.dir = 1;
      s.rect.x = s.def.x; s.rect.y = s.def.y;
    }

    this._setState('idle');
    this.hud.showIdle();
    this.overlay.hide();
  }

  start() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._loop();
  }

  stop() { if (this._raf) cancelAnimationFrame(this._raf); this._raf = null; }
  destroy() { this.stop(); this.input.destroy(); }

  get state() { return this._state; }

  // ── Helpers ────────────────────────────────────────────────────────────────

  _setState(s) { this._state = s; }

  /** All obstacle rects in play right now (static + moving current positions) */
  _currentObstacles() {
    return [...(this._level.obstacles ?? []), ...this._movingStates.map(s => s.rect)];
  }

  _targetRadius() {
    return this._level.targetRadius ?? TARGET_R;
  }

  // ── Input wiring ───────────────────────────────────────────────────────────

  _bindInput() {
    this.input.onAimStart = () => {
      if (this._state !== 'idle') return;
      this._setState('aiming');
      this.hud.showAiming();
    };

    this.input.onAimMove = (vx, vy, power) => {
      if (this._state !== 'aiming') return;
      this._aimPower = power;
      if (power > 0.05) {
        this._trajectory = simulateTrajectory(
          this._ball.x, this._ball.y, vx * 7, vy * 7,
          this._level.maxBounces,
          this._level.target,
          this._currentObstacles(),
          this._level.mirrors ?? [],
          DESIGN_W, DESIGN_H,
          this._targetRadius(),
        );
      }
    };

    this.input.onFire = (vx, vy) => {
      if (this._state !== 'aiming') return;
      this._vel.x = vx; this._vel.y = vy;
      this._trajectory = [];
      this._setState('flying');
      this.hud.showFired();
    };

    this.input.onAimCancel = () => {
      if (this._state !== 'aiming') return;
      this._trajectory = []; this._aimPower = 0;
      this._setState('idle'); this.hud.showIdle();
    };
  }

  // ── Physics update ─────────────────────────────────────────────────────────

  _update() {
    if (!this._level) return;
    // Always animate moving obstacles
    this._updateMovingObstacles();

    if (this._state !== 'flying') return;

    this._ball.x += this._vel.x;
    this._ball.y += this._vel.y;

    const s = { x: this._ball.x, y: this._ball.y, vx: this._vel.x, vy: this._vel.y };
    let bounced = bounceWalls(s, DESIGN_W, DESIGN_H);

    // Mirror collision
    let mirrorHit = false;
    for (const m of (this._level.mirrors ?? [])) {
      if (circleRectOverlap(s.x, s.y, BALL_R, m)) {
        s.x -= s.vx; s.y -= s.vy;  // step back
        const speed = Math.sqrt(s.vx*s.vx + s.vy*s.vy);
        s.vx = m.deflect.vx * speed;
        s.vy = m.deflect.vy * speed;
        mirrorHit = true;
        bounced   = true;
        break;
      }
    }

    // Obstacle collision (static + moving)
    if (!mirrorHit) {
      for (const ob of this._currentObstacles()) {
        if (circleRectOverlap(s.x, s.y, BALL_R, ob)) {
          // Pass current (penetrating) position — new resolver uses penetration depth
          const res = resolveObstacleCollision(s.x, s.y, s.vx, s.vy, ob);
          s.x = res.px; s.y = res.py; s.vx = res.dvx; s.vy = res.dvy;
          bounced = true;
          break;
        }
      }
    }

    this._ball.x = s.x; this._ball.y = s.y;
    this._vel.x  = s.vx; this._vel.y = s.vy;

    if (bounced) {
      this._bounces++;
      this.renderer.triggerFlash();
      this.hud.setBounces(this._bounces);
      if (this._bounces > this._level.maxBounces + 2) {
        this._endGame(false); return;
      }
    }

    // Target hit?
    const dx = this._ball.x - this._level.target.x;
    const dy = this._ball.y - this._level.target.y;
    if (Math.sqrt(dx*dx + dy*dy) < this._targetRadius() + BALL_R - 2) {
      this._endGame(true);
    }
  }

  _updateMovingObstacles() {
    for (const s of this._movingStates) {
      s.pos += s.def.speed * s.dir;
      if (s.pos >= s.def.range[1] || s.pos <= s.def.range[0]) {
        s.dir *= -1;
        s.pos  = Math.max(s.def.range[0], Math.min(s.def.range[1], s.pos));
      }
      if (s.def.axis === 'x') { s.rect.x = s.pos; }
      else                    { s.rect.y = s.pos; }
    }
  }

  _endGame(won) {
    this._setState(won ? 'won' : 'lost');
    const hasNext = !!this._nextLevel();
    if (won) {
      this.overlay.show('win', '🎯 TARGET HIT!',
        `${this._bounces} bounce${this._bounces !== 1 ? 's' : ''}. ${this._ratingText()}`,
        hasNext ? 'NEXT LEVEL' : 'PLAY AGAIN');
    } else {
      this.overlay.show('lose', '💀 MISS!', 'Too many bounces. Reset and try again.', 'TRY AGAIN');
    }
  }

  _nextLevel() {
    const idx = (window._LEVELS ?? []).findIndex(l => l.id === this._level.id);
    return idx >= 0 && idx < (window._LEVELS ?? []).length - 1 ? (window._LEVELS ?? [])[idx + 1] : null;
  }

  _ratingText() {
    const b = this._bounces, par = this._level.parBounces ?? 2;
    if (b <= par) return '⭐ Perfect!';
    if (b <= par + 1) return '✨ Great!';
    return '👍 Nice!';
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  _render() {
    const r = this.renderer;
    r.tick();

    r.drawArena();
    if (!this._level) return;  // level not yet loaded
    r.drawObstacles(this._level.obstacles ?? []);
    r.drawMirrors(this._level.mirrors ?? []);
    r.drawMovingObstacles(this._movingStates.map(s => s.rect));
    r.drawTarget(this._level.target, this._targetRadius());

    if (this._state === 'flying')  r.drawFlyingTrail(this._ball, this._vel);
    if (this._state === 'aiming') {
      r.drawTrajectory(this._trajectory);
      r.drawSlingshot(this.input.anchorPoint || this._ball, this.input.pullPoint, this._aimPower);
    }

    r.drawBall(this._ball, this._state === 'idle');
    r.drawFlash();
  }

  _loop() {
    this._update();
    this._render();
    this._raf = requestAnimationFrame(() => this._loop());
  }
}
