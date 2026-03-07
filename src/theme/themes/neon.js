/**
 * NEON theme — billiards-meets-synthwave.
 * Default look of the game.
 *
 * ── How to create your own theme ─────────────────────────────────────────────
 * Copy this file, change any values, then register it in ThemeManager.js.
 * CSS values → update the `css` object (applied as CSS custom properties).
 * Canvas values → update the `canvas` object (used directly by Renderer.js).
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const neonTheme = {
  id: 'neon',
  label: 'Neon',

  /** Applied to :root as CSS custom properties */
  css: {
    '--color-bg':          '#0a0a12',
    '--color-accent':      '#ff6b35',
    '--color-accent-alt':  '#b46cff',
    '--color-target':      '#4fffb0',
    '--color-danger':      '#ff4455',
    '--color-text':        '#e0e0ff',
    '--color-text-muted':  '#aaa',
    '--color-border':      '#ff6b35',
    '--gradient-header':   'linear-gradient(90deg, #ff6b35, #f7c59f, #fffff0)',
    '--gradient-wrap':     'linear-gradient(135deg, #ff6b35 0%, #2d1b69 50%, #ff6b35 100%)',
    '--shadow-wrap':       '0 0 40px rgba(255,107,53,0.35), 0 0 80px rgba(45,27,105,0.4)',
    '--font-primary':      "'Orbitron', monospace",
    '--font-body':         "'Inter', sans-serif",
    '--font-import':       'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;600&display=swap',
  },

  /** Used by Renderer.js to draw on the canvas */
  canvas: {
    background:         '#0d0d1a',
    gridLine:           'rgba(255,255,255,0.03)',

    wallFill:           ['#3a1a5e', '#1a0a2e'],   // gradient stops
    wallInnerGlow:      'rgba(180,100,255,0.5)',
    cornerAccent:       '#b46cff',

    obstacleGradient:   ['#4a2030', '#2a1020'],
    obstacleBorder:     '#ff4455',
    obstacleShadow:     'rgba(255,100,50,0.3)',
    obstacleHatch:      'rgba(255,68,85,0.25)',

    targetRings:        ['#0a2a1a', '#1a5a3a', '#4fffb0'],
    targetBorder:       '#4fffb0',
    targetGlow:         'rgba(79,255,176,0.2)',
    targetLabel:        'rgba(79,255,176,0.8)',
    targetCrosshair:    'rgba(79,255,176,0.6)',

    ballGlowInner:      'rgba(255,180,80,0.6)',
    ballGlowOuter:      'rgba(255,107,53,0)',
    ballHighlight:      '#fff8e0',
    ballMid:            '#ffb347',
    ballBase:           '#ff6b35',
    ballLabel:          'rgba(255,200,100,0.9)',

    trajectoryLine:     'rgba(255,200,80,',       // alpha appended at runtime
    bounceMarker:       'rgba(255,200,80,0.7)',

    trailHead:          'rgba(255,130,50,0.8)',
    trailTail:          'rgba(255,130,50,0)',

    slingshotBandA:     'rgba(255,180,60,0.9)',
    slingshotBandB:     'rgba(255,100,30,0.4)',
    slingshotPull:      'rgba(255,180,60,0.8)',

    powerBarBg:         'rgba(0,0,0,0.5)',
    powerBarGradient:   ['#4fffb0', '#ffdd57', '#ff4455'],  // low→high

    flashColor:         'rgba(255,200,80,',       // alpha appended at runtime
  },
};
