import { WALL_THICK, BALL_R, TARGET_R, SIM_DRAW_STEPS } from '../constants.js';

/**
 * Renderer
 * ─────────────────────────────────────────────────────────────────────────────
 * All canvas drawing.  Zero game logic lives here.
 * Gets the current theme from ThemeManager each frame so theme changes
 * are immediately reflected without a restart.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {() => import('../theme/ThemeManager.js').ThemeManager} getTheme
 *   Function returning the current theme object.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export class Renderer {
  constructor(ctx, getTheme) {
    this.ctx      = ctx;
    this.getTheme = getTheme;    // () => ThemeManager.current
    this.flashAlpha = 0;
    this._time = 0;
  }

  get W() { return this.ctx.canvas.width; }
  get H() { return this.ctx.canvas.height; }

  /** Call once per frame */
  tick() {
    this._time = performance.now() / 1000;
    if (this.flashAlpha > 0) this.flashAlpha = Math.max(0, this.flashAlpha - 0.08);
  }

  triggerFlash() { this.flashAlpha = 1; }

  // ── Composite draw helpers ─────────────────────────────────────────────────

  drawArena() {
    const { ctx, W, H } = this;
    const t = this.getTheme().canvas;

    // Background
    ctx.fillStyle = t.background;
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = t.gridLine;
    ctx.lineWidth = 1;
    for (let x = WALL_THICK; x < W - WALL_THICK; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, WALL_THICK); ctx.lineTo(x, H - WALL_THICK); ctx.stroke();
    }
    for (let y = WALL_THICK; y < H - WALL_THICK; y += 40) {
      ctx.beginPath(); ctx.moveTo(WALL_THICK, y); ctx.lineTo(W - WALL_THICK, y); ctx.stroke();
    }

    // Wall fill
    const wg = ctx.createLinearGradient(0, 0, W, H);
    wg.addColorStop(0, t.wallFill[0]);
    wg.addColorStop(1, t.wallFill[1]);
    ctx.fillStyle = wg;
    ctx.fillRect(0, 0, W, WALL_THICK);
    ctx.fillRect(0, H - WALL_THICK, W, WALL_THICK);
    ctx.fillRect(0, 0, WALL_THICK, H);
    ctx.fillRect(W - WALL_THICK, 0, WALL_THICK, H);

    // Inner glow border
    ctx.strokeStyle = t.wallInnerGlow;
    ctx.lineWidth = 2;
    ctx.strokeRect(WALL_THICK, WALL_THICK, W - WALL_THICK * 2, H - WALL_THICK * 2);

    // Corner accents
    const corners = [[WALL_THICK,WALL_THICK],[W-WALL_THICK,WALL_THICK],[WALL_THICK,H-WALL_THICK],[W-WALL_THICK,H-WALL_THICK]];
    for (const [cx, cy] of corners) {
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = t.cornerAccent;
      ctx.fill();
    }
  }

  drawObstacles(obstacles) {
    const { ctx } = this;
    const t = this.getTheme().canvas;
    for (const ob of obstacles) {
      ctx.shadowColor = t.obstacleShadow;
      ctx.shadowBlur  = 12;

      const g = ctx.createLinearGradient(ob.x, ob.y, ob.x + ob.w, ob.y + ob.h);
      g.addColorStop(0, t.obstacleGradient[0]);
      g.addColorStop(1, t.obstacleGradient[1]);
      ctx.fillStyle = g;
      ctx.fillRect(ob.x, ob.y, ob.w, ob.h);

      ctx.shadowBlur = 0;
      ctx.strokeStyle = t.obstacleBorder;
      ctx.lineWidth = 2;
      ctx.strokeRect(ob.x, ob.y, ob.w, ob.h);

      // Hatch pattern
      ctx.save();
      ctx.beginPath();
      ctx.rect(ob.x, ob.y, ob.w, ob.h);
      ctx.clip();
      ctx.strokeStyle = t.obstacleHatch;
      ctx.lineWidth = 1;
      for (let d = -ob.h; d < ob.w + ob.h; d += 12) {
        ctx.beginPath();
        ctx.moveTo(ob.x + d, ob.y);
        ctx.lineTo(ob.x + d + ob.h, ob.y + ob.h);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  drawTarget(target) {
    const { ctx } = this;
    const { x: tx, y: ty } = target;
    const t = this.getTheme().canvas;
    const time = this._time;

    // Pulsing outer ring
    ctx.beginPath();
    ctx.arc(tx, ty, TARGET_R + 8 + Math.sin(time * 3) * 4, 0, Math.PI * 2);
    const glowAlpha = 0.2 + Math.sin(time * 3) * 0.1;
    ctx.strokeStyle = t.targetGlow.replace('0.2)', `${glowAlpha})`);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Filled rings
    for (let i = 3; i >= 1; i--) {
      ctx.beginPath();
      ctx.arc(tx, ty, TARGET_R * (i / 3), 0, Math.PI * 2);
      ctx.fillStyle   = t.targetRings[i - 1];
      ctx.fill();
      ctx.strokeStyle = t.targetBorder;
      ctx.lineWidth   = 1;
      ctx.stroke();
    }

    // Crosshair
    ctx.strokeStyle = t.targetCrosshair;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(tx - TARGET_R - 8, ty); ctx.lineTo(tx + TARGET_R + 8, ty); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx, ty - TARGET_R - 8); ctx.lineTo(tx, ty + TARGET_R + 8); ctx.stroke();

    // Label
    ctx.font = '500 11px var(--font-body, Inter)';
    ctx.fillStyle   = t.targetLabel;
    ctx.textAlign   = 'center';
    ctx.fillText('TARGET', tx, ty + TARGET_R + 22);
  }

  drawBall(ball, isIdle) {
    const { ctx } = this;
    const { x: bx, y: by } = ball;
    const t = this.getTheme().canvas;

    // Glow aura
    const grd = ctx.createRadialGradient(bx, by, 0, bx, by, BALL_R * 2.5);
    grd.addColorStop(0, t.ballGlowInner);
    grd.addColorStop(1, t.ballGlowOuter);
    ctx.beginPath();
    ctx.arc(bx, by, BALL_R * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    // Ball body
    const bg = ctx.createRadialGradient(bx - 3, by - 3, 1, bx, by, BALL_R);
    bg.addColorStop(0,   t.ballHighlight);
    bg.addColorStop(0.4, t.ballMid);
    bg.addColorStop(1,   t.ballBase);
    ctx.beginPath();
    ctx.arc(bx, by, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();

    if (isIdle) {
      ctx.font      = 'bold 9px var(--font-body, Inter)';
      ctx.fillStyle = t.ballLabel;
      ctx.textAlign = 'center';
      ctx.fillText('DRAG', bx, by + BALL_R + 15);
    }
  }

  drawFlyingTrail(ball, vel) {
    const { ctx } = this;
    const { x: bx, y: by } = ball;
    const t = this.getTheme().canvas;
    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y) || 1;
    const tx = bx - (vel.x / speed) * 30;
    const ty = by - (vel.y / speed) * 30;

    const tg = ctx.createLinearGradient(bx, by, tx, ty);
    tg.addColorStop(0, t.trailHead);
    tg.addColorStop(1, t.trailTail);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = tg;
    ctx.lineWidth   = BALL_R * 1.4;
    ctx.lineCap     = 'round';
    ctx.stroke();
    ctx.lineCap     = 'butt';
  }

  drawTrajectory(points) {
    if (points.length < 2) return;
    const { ctx } = this;
    const t = this.getTheme().canvas;
    const limit = Math.min(points.length, SIM_DRAW_STEPS);

    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;

    for (let i = 1; i < limit; i++) {
      const pt     = points[i];
      const prevPt = points[i - 1];
      if (pt.bounce) continue;

      const alpha = 1 - i / limit;
      ctx.beginPath();
      ctx.moveTo(prevPt.x, prevPt.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.strokeStyle = t.trajectoryLine + (alpha * 0.9) + ')';
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Bounce dot markers
    for (const pt of points) {
      if (!pt.bounce) continue;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = t.bounceMarker;
      ctx.fill();
    }

    // Predicted end dot
    const last = points[points.length - 1];
    if (!last.hit) {
      ctx.beginPath();
      ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,150,50,0.5)';
      ctx.fill();
    }

    ctx.restore();
  }

  drawSlingshot(anchorPoint, pullPoint, power) {
    if (!pullPoint) return;
    const { ctx } = this;
    const t = this.getTheme().canvas;
    const { x: bx, y: by } = anchorPoint;
    const { x: ex, y: ey } = pullPoint;
    const OFFSET = 12;

    for (const sign of [-1, 1]) {
      const angle = Math.atan2(ey - by, ex - bx) + Math.PI / 2;
      const px = bx + Math.cos(angle) * OFFSET * sign;
      const py = by + Math.sin(angle) * OFFSET * sign;

      const bg = ctx.createLinearGradient(px, py, ex, ey);
      bg.addColorStop(0, t.slingshotBandA);
      bg.addColorStop(1, t.slingshotBandB);

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(
        (px + ex) / 2 + (ey - py) * 0.1 * sign,
        (py + ey) / 2 + (ex - px) * 0.1 * sign,
        ex, ey,
      );
      ctx.strokeStyle = bg;
      ctx.lineWidth   = 3;
      ctx.stroke();
    }

    // Pull point dot
    ctx.beginPath();
    ctx.arc(ex, ey, 5, 0, Math.PI * 2);
    ctx.fillStyle = t.slingshotPull;
    ctx.fill();

    // Power bar
    const barW = 80, barH = 8;
    const barX = bx - barW / 2, barY = by + BALL_R + 20;
    ctx.fillStyle = t.powerBarBg;
    this._roundRect(barX - 2, barY - 2, barW + 4, barH + 4, 4);
    ctx.fill();

    const pg = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    pg.addColorStop(0,   t.powerBarGradient[0]);
    pg.addColorStop(0.5, t.powerBarGradient[1]);
    pg.addColorStop(1,   t.powerBarGradient[2]);
    ctx.fillStyle = pg;
    this._roundRect(barX, barY, barW * power, barH, 3);
    ctx.fill();
  }

  drawFlash() {
    if (this.flashAlpha <= 0) return;
    const t = this.getTheme().canvas;
    this.ctx.fillStyle = t.flashColor + (this.flashAlpha * 0.3) + ')';
    this.ctx.fillRect(0, 0, this.W, this.H);
  }

  // ── Private utils ──────────────────────────────────────────────────────────

  _roundRect(x, y, w, h, r) {
    const c = this.ctx;
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
  }
}
