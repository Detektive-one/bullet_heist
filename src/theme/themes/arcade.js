/**
 * ARCADE theme — bold retro cabinet aesthetic.
 * Inspired by classic 80s arcade machines.
 */
export const arcadeTheme = {
  id: 'arcade',
  label: 'Arcade',

  css: {
    '--color-bg':          '#1a0a00',
    '--color-accent':      '#ffcc00',
    '--color-accent-alt':  '#ff4400',
    '--color-target':      '#00ffcc',
    '--color-danger':      '#ff2200',
    '--color-text':        '#fff8e1',
    '--color-text-muted':  '#c49a00',
    '--color-border':      '#ffcc00',
    '--gradient-header':   'linear-gradient(90deg, #ffcc00, #ff8800, #ffcc00)',
    '--gradient-wrap':     'linear-gradient(135deg, #ffcc00 0%, #5a2d00 50%, #ffcc00 100%)',
    '--shadow-wrap':       '0 0 40px rgba(255,204,0,0.4), 0 0 80px rgba(90,45,0,0.5)',
    '--font-primary':      "'Press Start 2P', monospace",
    '--font-body':         "'VT323', monospace",
    '--font-import':       'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap',
  },

  canvas: {
    background:         '#110600',
    gridLine:           'rgba(255,204,0,0.05)',

    wallFill:           ['#3a2000', '#1a0e00'],
    wallInnerGlow:      'rgba(255,180,0,0.5)',
    cornerAccent:       '#ffcc00',

    obstacleGradient:   ['#3a1500', '#1a0800'],
    obstacleBorder:     '#ff4400',
    obstacleShadow:     'rgba(255,68,0,0.3)',
    obstacleHatch:      'rgba(255,68,0,0.25)',

    targetRings:        ['#002a22', '#005544', '#00ffcc'],
    targetBorder:       '#00ffcc',
    targetGlow:         'rgba(0,255,204,0.2)',
    targetLabel:        'rgba(0,255,204,0.8)',
    targetCrosshair:    'rgba(0,255,204,0.6)',

    ballGlowInner:      'rgba(255,220,50,0.7)',
    ballGlowOuter:      'rgba(255,140,0,0)',
    ballHighlight:      '#fffde0',
    ballMid:            '#ffd700',
    ballBase:           '#ff8800',
    ballLabel:          'rgba(255,230,80,0.9)',

    trajectoryLine:     'rgba(255,220,50,',
    bounceMarker:       'rgba(255,220,50,0.8)',

    trailHead:          'rgba(255,200,0,0.9)',
    trailTail:          'rgba(255,100,0,0)',

    slingshotBandA:     'rgba(255,220,50,0.9)',
    slingshotBandB:     'rgba(255,100,0,0.5)',
    slingshotPull:      'rgba(255,220,50,0.8)',

    powerBarBg:         'rgba(0,0,0,0.6)',
    powerBarGradient:   ['#00ffcc', '#ffd700', '#ff2200'],

    flashColor:         'rgba(255,220,50,',
  },
};
