import { WALL_THICK, BALL_R, TARGET_R, SIM_DRAW_STEPS, DESIGN_W, DESIGN_H } from '../constants.js';

export class Renderer {
  constructor(ctx, getTheme) {
    this.ctx      = ctx;
    this.getTheme = getTheme;
    this.flashAlpha = 0;
    this._time = 0;
  }

  get W() { return DESIGN_W; }  // always design-space width (800)
  get H() { return DESIGN_H; }  // always design-space height (560)

  /**
   * Call at the start of every frame.
   * 
   * 1. Sets canvas PHYSICAL resolution = CSS display size × devicePixelRatio
   *    (sharp rendering, no upscale blur).
   * 2. Applies a UNIFORM scale + center offset so that the 800×560 design space
   *    is drawn as large as possible inside the canvas without any distortion.
   *    The "letterbox" area outside shows the canvas background (#0a0a12).
   * 3. Stores the transform in window._gameTransform so Input.js can
   *    convert pointer coords back to design space correctly.
   */
  beginFrame() {
    const canvas   = this.ctx.canvas;
    const dpr      = window.devicePixelRatio || 1;
    const displayW = canvas.clientWidth;
    const displayH = canvas.clientHeight;
    if (displayW > 0 && displayH > 0) {
      const physW = Math.round(displayW * dpr);
      const physH = Math.round(displayH * dpr);
      if (canvas.width !== physW || canvas.height !== physH) {
        canvas.width  = physW;
        canvas.height = physH;
      }
      // ★ Clear ENTIRE physical canvas first (letterbox areas included)
      //   Without this, slingshot/trail pixels in the letterbox persist forever.
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, physW, physH);

      // Uniform scale: largest factor that fits BOTH dimensions
      const scale   = Math.min(physW / DESIGN_W, physH / DESIGN_H);
      const offsetX = (physW - DESIGN_W * scale) * 0.5;  // center horizontally
      const offsetY = (physH - DESIGN_H * scale) * 0.5;  // center vertically
      this.ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
      // Expose to Input.js for pointer → design-space conversion
      window._gameTransform = { scale, offsetX, offsetY };
    }
  }

  /** Clear entire canvas — call when stopping the game loop so no stale frame lingers. */
  clearAll() {
    const { canvas } = this.ctx.canvas ? this.ctx : { canvas: this.ctx.canvas };
    const c = this.ctx.canvas;
    if (c && c.width > 0 && c.height > 0) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, c.width, c.height);
    }
  }

  tick() {
    this._time = performance.now() / 1000;
    if (this.flashAlpha > 0) this.flashAlpha = Math.max(0, this.flashAlpha - 0.08);
  }

  triggerFlash() { this.flashAlpha = 1; }

  // ── Arena ──────────────────────────────────────────────────────────────────

  drawArena() {
    const { ctx, W, H } = this;
    const t = this.getTheme().canvas;

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

    // Walls
    const wg = ctx.createLinearGradient(0, 0, W, H);
    wg.addColorStop(0, t.wallFill[0]);
    wg.addColorStop(1, t.wallFill[1]);
    ctx.fillStyle = wg;
    ctx.fillRect(0, 0, W, WALL_THICK);
    ctx.fillRect(0, H - WALL_THICK, W, WALL_THICK);
    ctx.fillRect(0, 0, WALL_THICK, H);
    ctx.fillRect(W - WALL_THICK, 0, WALL_THICK, H);

    ctx.strokeStyle = t.wallInnerGlow;
    ctx.lineWidth = 2;
    ctx.strokeRect(WALL_THICK, WALL_THICK, W - WALL_THICK * 2, H - WALL_THICK * 2);

    for (const [cx, cy] of [[WALL_THICK,WALL_THICK],[W-WALL_THICK,WALL_THICK],[WALL_THICK,H-WALL_THICK],[W-WALL_THICK,H-WALL_THICK]]) {
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = t.cornerAccent; ctx.fill();
    }
  }

  // ── Obstacles ──────────────────────────────────────────────────────────────

  drawObstacles(obstacles) {
    for (const ob of obstacles) this._drawObstacleRect(ob, false);
  }

  drawMovingObstacles(rects) {
    for (const rect of rects) this._drawObstacleRect(rect, true);
  }

  drawGates(gates) {
    for (const gate of gates) {
      this._drawObstacleRect(gate, false);
      const { ctx } = this;
      const t = this.getTheme().canvas;
      const cx = gate.x + gate.w / 2, cy = gate.y + gate.h / 2;
      ctx.save();
      ctx.strokeStyle = t.gateStroke ?? '#4fffb0';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(gate.x + 4, gate.y + 4, gate.w - 8, gate.h - 8);
      ctx.setLineDash([]);
      ctx.fillStyle = t.gateText ?? 'rgba(255,255,255,0.75)';
      ctx.font = 'bold 11px var(--font-body, Inter)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('LOCKED', cx, cy);
      ctx.restore();
    }
  }

  _drawObstacleRect(ob, isMoving) {
    const { ctx } = this;
    const t = this.getTheme().canvas;

    ctx.shadowColor = t.obstacleShadow;
    ctx.shadowBlur  = isMoving ? 20 : 12;

    const g = ctx.createLinearGradient(ob.x, ob.y, ob.x + ob.w, ob.y + ob.h);
    g.addColorStop(0, t.obstacleGradient[0]);
    g.addColorStop(1, t.obstacleGradient[1]);
    ctx.fillStyle = g;
    ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = isMoving ? t.cornerAccent : t.obstacleBorder;
    ctx.lineWidth   = isMoving ? 2.5 : 2;
    ctx.strokeRect(ob.x, ob.y, ob.w, ob.h);

    // Hatch marks
    ctx.save();
    ctx.beginPath(); ctx.rect(ob.x, ob.y, ob.w, ob.h); ctx.clip();
    ctx.strokeStyle = isMoving ? 'rgba(180,100,255,0.3)' : t.obstacleHatch;
    ctx.lineWidth = 1;
    for (let d = -ob.h; d < ob.w + ob.h; d += 12) {
      ctx.beginPath();
      ctx.moveTo(ob.x + d, ob.y);
      ctx.lineTo(ob.x + d + ob.h, ob.y + ob.h);
      ctx.stroke();
    }
    ctx.restore();

    // Moving obstacle: arrow direction indicator
    if (isMoving) {
      const cx = ob.x + ob.w / 2, cy = ob.y + ob.h / 2;
      ctx.fillStyle = t.cornerAccent;
      ctx.font      = 'bold 16px var(--font-body, Inter)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('↔', cx, cy);
      ctx.textBaseline = 'alphabetic';
    }
  }

  // ── Mirrors ────────────────────────────────────────────────────────────────

  drawMirrors(mirrors) {
    if (!mirrors?.length) return;
    const { ctx } = this;
    const time = this._time;

    for (const m of mirrors) {
      // Glowing pad
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur  = 14 + Math.sin(time * 4) * 4;

      const g = ctx.createLinearGradient(m.x, m.y, m.x + m.w, m.y + m.h);
      g.addColorStop(0, 'rgba(0,220,255,0.7)');
      g.addColorStop(1, 'rgba(0,120,200,0.5)');
      ctx.fillStyle = g;
      ctx.fillRect(m.x, m.y, m.w, m.h);
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth   = 2;
      ctx.strokeRect(m.x, m.y, m.w, m.h);

      // Direction arrow
      ctx.fillStyle    = '#ffffff';
      ctx.font         = `bold ${Math.min(m.w, m.h) - 4}px var(--font-body, Inter)`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(m.label ?? '↕', m.x + m.w / 2, m.y + m.h / 2);
      ctx.textBaseline = 'alphabetic';

      // Label below
      ctx.font      = '500 10px var(--font-body, Inter)';
      ctx.fillStyle = 'rgba(0,255,255,0.8)';
      ctx.fillText('DEFLECTOR', m.x + m.w / 2, m.y + m.h + 14);
    }
  }

  drawSwitches(switches, activeMap) {
    if (!switches?.length) return;
    const { ctx } = this;
    const t = this.getTheme().canvas;
    const time = this._time;

    for (const sw of switches) {
      const active = activeMap?.get(sw.id);
      const r = sw.r ?? 16;
      const pulse = active ? 0 : Math.sin(time * 5) * 3;

      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, r + 8 + pulse, 0, Math.PI * 2);
      ctx.strokeStyle = active ? (t.switchActiveGlow ?? 'rgba(79,255,176,0.5)') : (t.switchGlow ?? 'rgba(255,220,80,0.4)');
      ctx.lineWidth = 2;
      ctx.stroke();

      const g = ctx.createRadialGradient(sw.x - 4, sw.y - 4, 2, sw.x, sw.y, r);
      if (active) {
        g.addColorStop(0, t.switchActiveInner ?? '#eafff4');
        g.addColorStop(1, t.switchActiveOuter ?? '#4fffb0');
      } else {
        g.addColorStop(0, t.switchInner ?? '#fff6b8');
        g.addColorStop(1, t.switchOuter ?? '#ffcc00');
      }
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = active ? (t.targetBorder ?? '#4fffb0') : (t.bounceMarker ?? 'rgba(255,200,80,0.7)');
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = active ? '#062013' : '#3a2500';
      ctx.font = 'bold 10px var(--font-body, Inter)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(active ? 'ON' : (sw.label ?? sw.id), sw.x, sw.y);
      ctx.restore();
    }
  }

  // ── Target ─────────────────────────────────────────────────────────────────

  drawTarget(target, radius = TARGET_R) {
    const { ctx } = this;
    const { x: tx, y: ty } = target;
    const t    = this.getTheme().canvas;
    const time = this._time;
    const pulse = Math.sin(time * 3) * 4;

    // Pulsing ring
    ctx.beginPath();
    ctx.arc(tx, ty, radius + 8 + pulse, 0, Math.PI * 2);
    ctx.strokeStyle = t.targetGlow.replace('0.2)', `${0.2 + Math.sin(time*3)*0.1})`);
    ctx.lineWidth   = 2;
    ctx.stroke();

    // Filled rings
    for (let i = 3; i >= 1; i--) {
      ctx.beginPath(); ctx.arc(tx, ty, radius * (i / 3), 0, Math.PI * 2);
      ctx.fillStyle   = t.targetRings[i - 1]; ctx.fill();
      ctx.strokeStyle = t.targetBorder;       ctx.lineWidth = 1; ctx.stroke();
    }

    // Crosshair
    ctx.strokeStyle = t.targetCrosshair; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(tx - radius - 8, ty); ctx.lineTo(tx + radius + 8, ty); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx, ty - radius - 8); ctx.lineTo(tx, ty + radius + 8); ctx.stroke();

    ctx.font = '500 11px var(--font-body, Inter)';
    ctx.fillStyle = t.targetLabel; ctx.textAlign = 'center';
    ctx.fillText('TARGET', tx, ty + radius + 22);
  }

  // ── Ball ───────────────────────────────────────────────────────────────────

  drawBall(ball, isIdle) {
    const { ctx } = this;
    const { x: bx, y: by } = ball;
    const t = this.getTheme().canvas;

    const grd = ctx.createRadialGradient(bx, by, 0, bx, by, BALL_R * 2.5);
    grd.addColorStop(0, t.ballGlowInner); grd.addColorStop(1, t.ballGlowOuter);
    ctx.beginPath(); ctx.arc(bx, by, BALL_R * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = grd; ctx.fill();

    const bg = ctx.createRadialGradient(bx - 3, by - 3, 1, bx, by, BALL_R);
    bg.addColorStop(0, t.ballHighlight); bg.addColorStop(0.4, t.ballMid); bg.addColorStop(1, t.ballBase);
    ctx.beginPath(); ctx.arc(bx, by, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = bg; ctx.fill();

    if (isIdle) {
      ctx.font = 'bold 9px var(--font-body)'; ctx.fillStyle = t.ballLabel;
      ctx.textAlign = 'center'; ctx.fillText('DRAG', bx, by + BALL_R + 15);
    }
  }

  drawFlyingTrail(ball, vel) {
    const { ctx } = this;
    const { x: bx, y: by } = ball;
    const t     = this.getTheme().canvas;
    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y) || 1;

    const tg = ctx.createLinearGradient(bx, by, bx - (vel.x/speed)*30, by - (vel.y/speed)*30);
    tg.addColorStop(0, t.trailHead); tg.addColorStop(1, t.trailTail);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx - (vel.x/speed)*30, by - (vel.y/speed)*30);
    ctx.strokeStyle = tg; ctx.lineWidth = BALL_R * 1.4;
    ctx.lineCap = 'round'; ctx.stroke(); ctx.lineCap = 'butt';
  }

  // ── Trajectory ─────────────────────────────────────────────────────────────

  drawTrajectory(points) {
    if (points.length < 2) return;
    const { ctx } = this;
    const t = this.getTheme().canvas;
    const limit = Math.min(points.length, SIM_DRAW_STEPS);

    ctx.save(); ctx.setLineDash([6, 6]); ctx.lineWidth = 2;
    for (let i = 1; i < limit; i++) {
      const pt = points[i], prev = points[i - 1];
      if (pt.bounce) continue;
      const alpha = 1 - i / limit;
      ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(pt.x, pt.y);
      ctx.strokeStyle = t.trajectoryLine + (alpha * 0.9) + ')';
      ctx.stroke();
    }
    ctx.setLineDash([]);

    for (const pt of points) {
      if (!pt.bounce) continue;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.mirror ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = pt.mirror ? 'rgba(0,255,255,0.8)' : t.bounceMarker;
      ctx.fill();
    }

    const last = points[points.length - 1];
    if (!last.hit) {
      ctx.beginPath(); ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,150,50,0.5)'; ctx.fill();
    }
    ctx.restore();
  }

  // ── Slingshot ──────────────────────────────────────────────────────────────

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
      bg.addColorStop(0, t.slingshotBandA); bg.addColorStop(1, t.slingshotBandB);
      ctx.beginPath(); ctx.moveTo(px, py);
      ctx.quadraticCurveTo((px+ex)/2+(ey-py)*0.1*sign, (py+ey)/2+(ex-px)*0.1*sign, ex, ey);
      ctx.strokeStyle = bg; ctx.lineWidth = 3; ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(ex, ey, 5, 0, Math.PI * 2);
    ctx.fillStyle = t.slingshotPull; ctx.fill();

    const barW = 80, barH = 8;
    const barX = bx - barW/2, barY = by + BALL_R + 20;
    ctx.fillStyle = t.powerBarBg; this._roundRect(barX-2, barY-2, barW+4, barH+4, 4); ctx.fill();
    const pg = ctx.createLinearGradient(barX, 0, barX+barW, 0);
    pg.addColorStop(0, t.powerBarGradient[0]); pg.addColorStop(0.5, t.powerBarGradient[1]); pg.addColorStop(1, t.powerBarGradient[2]);
    ctx.fillStyle = pg; this._roundRect(barX, barY, barW*power, barH, 3); ctx.fill();
  }

  // ── Flash ──────────────────────────────────────────────────────────────────

  drawFlash() {
    if (this.flashAlpha <= 0) return;
    const t = this.getTheme().canvas;
    this.ctx.fillStyle = t.flashColor + (this.flashAlpha * 0.3) + ')';
    this.ctx.fillRect(0, 0, this.W, this.H);
  }

  // ── Util ───────────────────────────────────────────────────────────────────

  _roundRect(x, y, w, h, r) {
    const c = this.ctx;
    c.beginPath();
    c.moveTo(x+r, y); c.lineTo(x+w-r, y); c.quadraticCurveTo(x+w, y, x+w, y+r);
    c.lineTo(x+w, y+h-r); c.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    c.lineTo(x+r, y+h); c.quadraticCurveTo(x, y+h, x, y+h-r);
    c.lineTo(x, y+r); c.quadraticCurveTo(x, y, x+r, y);
    c.closePath();
  }
}
