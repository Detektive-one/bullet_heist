import { BALL_R, SLING_MIN_DRAG, SLING_MAX_DRAG, DRAG_BALL_HITAREA, MAX_SPEED } from '../constants.js';

/**
 * Input
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified mouse + touch input handler for the slingshot mechanic.
 * Fires callbacks rather than coupling to game state directly.
 *
 * Events:
 *   onAimStart()             — drag started from ball
 *   onAimMove(vx, vy, power) — drag moved; velocity components + power 0-1
 *   onFire(vx, vy)           — released with enough drag
 *   onAimCancel()            — released too close (micro-drag)
 *
 * Usage:
 *   const input = new Input(canvas, getBallPos);
 *   input.onFire = (vx, vy) => game.fire(vx, vy);
 * ─────────────────────────────────────────────────────────────────────────────
 */
export class Input {
  constructor(canvas, getBallPos) {
    this._canvas     = canvas;
    this._getBallPos = getBallPos; // () => { x, y }
    this._dragging   = false;
    this._start      = null;
    this._current    = null;

    // Public callbacks — override these
    this.onAimStart  = () => {};
    this.onAimMove   = (_vx, _vy, _power) => {};
    this.onFire      = (_vx, _vy) => {};
    this.onAimCancel = () => {};

    this._bind();
  }

  // ── Public ──────────────────────────────────────────────────────────────────

  get isDragging() { return this._dragging; }

  /** Current drag pull point in design-space coords (or null) */
  get pullPoint() { return this._current; }

  /** Current drag start point (ball pos) */
  get anchorPoint() { return this._start; }

  destroy() {
    this._canvas.removeEventListener('mousedown', this._onDown);
    this._canvas.removeEventListener('mousemove', this._onMove);
    window.removeEventListener('mouseup', this._onUp);
    this._canvas.removeEventListener('touchstart', this._onTouchStart);
    this._canvas.removeEventListener('touchmove', this._onTouchMove);
    this._canvas.removeEventListener('touchend', this._onTouchEnd);
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  _bind() {
    this._onDown      = e => this._handleDown(this._pos(e));
    this._onMove      = e => this._handleMove(this._pos(e));
    this._onUp        = ()=> this._handleUp();
    this._onTouchStart= e => { e.preventDefault(); this._handleDown(this._pos(e)); };
    this._onTouchMove = e => { e.preventDefault(); this._handleMove(this._pos(e)); };
    this._onTouchEnd  = e => { e.preventDefault(); this._handleUp(); };

    this._canvas.addEventListener('mousedown',  this._onDown);
    this._canvas.addEventListener('mousemove',  this._onMove);
    window.addEventListener('mouseup',          this._onUp);
    this._canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
    this._canvas.addEventListener('touchmove',  this._onTouchMove,  { passive: false });
    this._canvas.addEventListener('touchend',   this._onTouchEnd,   { passive: false });
  }

  /** Convert client pointer coords → design-space (800×560) coords */
  _pos(e) {
    const rect = this._canvas.getBoundingClientRect();
    const dpr  = window.devicePixelRatio || 1;
    const src  = e.touches ? e.touches[0] : e;

    // Physical pixel position within the canvas
    const physX = (src.clientX - rect.left) * dpr;
    const physY = (src.clientY - rect.top)  * dpr;

    // Invert the Renderer transform (scale + center offset) → design coords
    const t = window._gameTransform ?? { scale: dpr, offsetX: 0, offsetY: 0 };
    return {
      x: (physX - t.offsetX) / t.scale,
      y: (physY - t.offsetY) / t.scale,
    };
  }

  _handleDown(pos) {
    const ball = this._getBallPos();
    const dx = pos.x - ball.x;
    const dy = pos.y - ball.y;
    if (Math.sqrt(dx * dx + dy * dy) < BALL_R * DRAG_BALL_HITAREA) {
      this._dragging = true;
      this._start    = { x: ball.x, y: ball.y };
      this._current  = { ...pos };
      this.onAimStart();
    }
  }

  _handleMove(pos) {
    if (!this._dragging) return;
    this._current = pos;
    const { vx, vy, power } = this._calcVelocity();
    this.onAimMove(vx, vy, power);
  }

  _handleUp() {
    if (!this._dragging) return;
    this._dragging = false;

    const { vx, vy, power, mag } = this._calcVelocity();
    if (mag < SLING_MIN_DRAG) {
      this.onAimCancel();
    } else {
      this.onFire(vx * MAX_SPEED, vy * MAX_SPEED);
    }

    this._start   = null;
    this._current = null;
  }

  _calcVelocity() {
    if (!this._start || !this._current) return { vx: 0, vy: 0, power: 0, mag: 0 };
    const dx  = this._start.x - this._current.x;
    const dy  = this._start.y - this._current.y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    const pwr = Math.min(mag / SLING_MAX_DRAG, 1);
    return { vx: (dx / (mag || 1)) * pwr, vy: (dy / (mag || 1)) * pwr, power: pwr, mag };
  }
}
