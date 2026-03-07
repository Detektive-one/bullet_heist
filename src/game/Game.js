import { DESIGN_W, DESIGN_H, BALL_R, TARGET_R } from '../constants.js';
import { bounceWalls, circleRectOverlap, resolveObstacleCollision, simulateTrajectory } from './Physics.js';
import { Input }    from './Input.js';
import { Renderer } from './Renderer.js';
import { HUD }      from '../ui/HUD.js';
import { Overlay }  from '../ui/Overlay.js';
import { ThemeManager } from '../theme/ThemeManager.js';

/**
 * Game States
 * @typedef {'idle' | 'aiming' | 'flying' | 'won' | 'lost'} GameState
 */

/**
 * Game
 * ─────────────────────────────────────────────────────────────────────────────
 * Main game coordinator.  Owns the loop, state, and wires everything together.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export class Game {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {HUD} hud
   * @param {Overlay} overlay
   */
  constructor(canvas, hud, overlay) {
    this.canvas   = canvas;
    this.ctx      = canvas.getContext('2d');
    this.hud      = hud;
    this.overlay  = overlay;

    this.renderer = new Renderer(this.ctx, () => ThemeManager.current);

    this._state     = 'idle';
    this._level     = null;
    this._ball      = { x: 0, y: 0 };
    this._vel       = { x: 0, y: 0 };
    this._bounces   = 0;
    this._trajectory = [];
    this._aimPower  = 0;

    this.input = new Input(canvas, () => ({ ...this._ball }));
    this._bindInput();

    this._raf = null;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Load a level object and reset. */
  loadLevel(level) {
    this._level = level;
    this.hud.setLevel(level.id);
    this.reset();
  }

  reset() {
    if (!this._level) return;
    this._ball    = { ...this._level.ballStart };
    this._vel     = { x: 0, y: 0 };
    this._bounces = 0;
    this._trajectory = [];
    this._aimPower   = 0;
    this._setState('idle');
    this.hud.showIdle();
    this.overlay.hide();
  }

  start() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._loop();
  }

  stop() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
  }

  destroy() {
    this.stop();
    this.input.destroy();
  }

  // ── State ──────────────────────────────────────────────────────────────────

  get state() { return this._state; }

  _setState(s) { this._state = s; }

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
          this._ball.x, this._ball.y,
          vx * 7, vy * 7,           // MAX_SPEED = 7
          this._level.maxBounces,
          this._level.target,
          this._level.obstacles,
          DESIGN_W, DESIGN_H,
        );
      }
    };

    this.input.onFire = (vx, vy) => {
      if (this._state !== 'aiming') return;
      this._vel.x = vx;
      this._vel.y = vy;
      this._trajectory = [];
      this._setState('flying');
      this.hud.showFired();
    };

    this.input.onAimCancel = () => {
      if (this._state !== 'aiming') return;
      this._trajectory = [];
      this._aimPower   = 0;
      this._setState('idle');
      this.hud.showIdle();
    };
  }

  // ── Physics update ─────────────────────────────────────────────────────────

  _update() {
    if (this._state !== 'flying') return;

    this._ball.x += this._vel.x;
    this._ball.y += this._vel.y;

    const s = { x: this._ball.x, y: this._ball.y, vx: this._vel.x, vy: this._vel.y };
    let bounced = bounceWalls(s, DESIGN_W, DESIGN_H);

    for (const ob of this._level.obstacles) {
      if (circleRectOverlap(s.x, s.y, BALL_R, ob)) {
        const prev = { x: s.x - s.vx, y: s.y - s.vy };
        const res  = resolveObstacleCollision(prev.x, prev.y, s.vx, s.vy, ob);
        s.x = res.px; s.y = res.py;
        s.vx = res.dvx; s.vy = res.dvy;
        bounced = true;
        break;
      }
    }

    this._ball.x = s.x; this._ball.y = s.y;
    this._vel.x  = s.vx; this._vel.y = s.vy;

    if (bounced) {
      this._bounces++;
      this.renderer.triggerFlash();
      this.hud.setBounces(this._bounces);

      if (this._bounces > this._level.maxBounces + 2) {
        this._endGame(false);
        return;
      }
    }

    // Target hit
    const dx = this._ball.x - this._level.target.x;
    const dy = this._ball.y - this._level.target.y;
    if (Math.sqrt(dx * dx + dy * dy) < TARGET_R + BALL_R - 2) {
      this._endGame(true);
    }
  }

  _endGame(won) {
    this._setState(won ? 'won' : 'lost');
    if (won) {
      this.overlay.show(
        'win',
        '🎯 TARGET HIT!',
        `Magnificent ricochet! ${this._bounces} bounce${this._bounces !== 1 ? 's' : ''}.`,
      );
    } else {
      this.overlay.show('lose', '💀 MISS!', 'Too many bounces. Reset and try again.');
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  _render() {
    const r = this.renderer;
    r.tick();

    r.drawArena();
    r.drawObstacles(this._level.obstacles);
    r.drawTarget(this._level.target);

    if (this._state === 'flying') {
      r.drawFlyingTrail(this._ball, this._vel);
    }

    if (this._state === 'aiming') {
      r.drawTrajectory(this._trajectory);
      r.drawSlingshot(this.input.anchorPoint || this._ball, this.input.pullPoint, this._aimPower);
    }

    r.drawBall(this._ball, this._state === 'idle');
    r.drawFlash();
  }

  // ── Loop ───────────────────────────────────────────────────────────────────

  _loop() {
    this._update();
    this._render();
    this._raf = requestAnimationFrame(() => this._loop());
  }
}
