const W = 1080;
const H = 560;

const vGate = (x, y = 90, h = 380, id = 'A') => ({ x, y, w: 26, h, requires: [id] });
const hGate = (y, x = 300, w = 480, id = 'A') => ({ x, y, w, h: 24, requires: [id] });
const block = (x, y, w, h) => ({ x, y, w, h });
const sw = (id, x, y, label = id) => ({ id, x, y, label, required: true });

function level(id, name, cfg) {
  return {
    id,
    name,
    ballStart: cfg.ballStart ?? { x: 90, y: H / 2 },
    target: cfg.target ?? { x: W - 95, y: H / 2 },
    obstacles: cfg.obstacles ?? [],
    movingObstacles: cfg.movingObstacles ?? [],
    mirrors: cfg.mirrors ?? [],
    switches: cfg.switches ?? [],
    gates: cfg.gates ?? [],
    requiredSwitches: cfg.requiredSwitches,
    shots: cfg.shots ?? 1,
    maxBounces: cfg.maxBounces ?? 6,
    parBounces: cfg.parBounces ?? 2,
    targetRadius: cfg.targetRadius,
    chapter: cfg.chapter,
  };
}

const chapter1 = [
  level('A1', 'Lobby Lock', {
    chapter: 1,
    switches: [sw('A', 400, 280)],
    gates: [vGate(650, 95, 370, 'A')],
    maxBounces: 5,
    parBounces: 1,
  }),
  level('A2', 'Keycard Bank', {
    chapter: 1,
    ballStart: { x: 100, y: 430 },
    target: { x: 965, y: 120 },
    switches: [sw('A', 410, 120)],
    gates: [vGate(740, 70, 330, 'A')],
    obstacles: [block(250, 190, 270, 24), block(520, 330, 220, 24)],
    maxBounces: 6,
    parBounces: 2,
  }),
  level('A3', 'Basement Relay', {
    chapter: 1,
    ballStart: { x: 110, y: 110 },
    target: { x: 970, y: 450 },
    switches: [sw('A', 520, 455)],
    gates: [hGate(285, 620, 300, 'A')],
    obstacles: [block(260, 40, 26, 310), block(455, 210, 26, 310)],
    maxBounces: 7,
    parBounces: 3,
  }),
  level('A4', 'Glass Button', {
    chapter: 1,
    ballStart: { x: 120, y: 280 },
    target: { x: 950, y: 280 },
    switches: [sw('A', 510, 78)],
    gates: [vGate(810, 160, 250, 'A')],
    mirrors: [{ x: 500, y: 430, w: 60, h: 24, deflect: { vx: 0, vy: -1 }, label: 'UP' }],
    obstacles: [block(360, 150, 28, 280), block(640, 18, 24, 350)],
    maxBounces: 7,
    parBounces: 2,
  }),
  level('A5', 'Side Door', {
    chapter: 1,
    ballStart: { x: 90, y: 460 },
    target: { x: 970, y: 95 },
    switches: [sw('A', 940, 450)],
    gates: [hGate(210, 660, 320, 'A')],
    obstacles: [block(190, 80, 420, 24), block(350, 250, 24, 270), block(620, 315, 260, 24)],
    maxBounces: 8,
    parBounces: 3,
  }),
  level('A6', 'Deadbolt', {
    chapter: 1,
    ballStart: { x: 120, y: 90 },
    target: { x: 970, y: 470 },
    switches: [sw('A', 725, 90)],
    gates: [vGate(835, 260, 230, 'A')],
    obstacles: [block(245, 18, 24, 330), block(440, 210, 270, 24), block(600, 330, 24, 210)],
    maxBounces: 8,
    parBounces: 3,
  }),
  level('A7', 'After Hours', {
    chapter: 1,
    ballStart: { x: 95, y: 280 },
    target: { x: 980, y: 280 },
    switches: [sw('A', 350, 455)],
    gates: [vGate(700, 70, 420, 'A')],
    movingObstacles: [{ x: 470, y: 120, w: 32, h: 300, axis: 'y', speed: 2, range: [80, 180] }],
    obstacles: [block(220, 170, 300, 24)],
    maxBounces: 7,
    parBounces: 2,
  }),
  level('A8', 'Silent Alarm', {
    chapter: 1,
    ballStart: { x: 120, y: 450 },
    target: { x: 960, y: 115 },
    switches: [sw('A', 605, 450)],
    gates: [hGate(240, 690, 280, 'A')],
    movingObstacles: [{ x: 420, y: 160, w: 180, h: 28, axis: 'x', speed: 2.4, range: [360, 560] }],
    obstacles: [block(250, 310, 26, 230), block(760, 18, 26, 275)],
    maxBounces: 8,
    parBounces: 3,
  }),
  level('A9', 'Switchback', {
    chapter: 1,
    ballStart: { x: 100, y: 100 },
    target: { x: 970, y: 460 },
    switches: [sw('A', 910, 95)],
    gates: [vGate(800, 230, 290, 'A')],
    obstacles: [block(190, 180, 650, 24), block(360, 350, 520, 24)],
    maxBounces: 9,
    parBounces: 4,
  }),
  level('A10', 'The First Vault', {
    chapter: 1,
    ballStart: { x: 90, y: 280 },
    target: { x: 990, y: 280 },
    switches: [sw('A', 420, 105), sw('B', 620, 455)],
    gates: [vGate(835, 80, 400, 'A'), hGate(280, 780, 190, 'B')],
    requiredSwitches: ['A', 'B'],
    obstacles: [block(260, 210, 300, 24), block(520, 326, 300, 24)],
    maxBounces: 10,
    parBounces: 4,
  }),
];

const chapter2 = Array.from({ length: 10 }, (_, i) => {
  const n = i + 1;
  const id = `B${n}`;
  const topFirst = i % 2 === 0;
  return level(id, [
    'Two-Key Tango', 'Cashroom Crossfire', 'Badge Check', 'Split Corridor', 'Double Tap',
    'Manager Override', 'False Floor', 'Fuse Box', 'Twin Needles', 'Locksmith'
  ][i], {
    chapter: 2,
    ballStart: { x: 90 + (i % 3) * 15, y: topFirst ? 110 : 450 },
    target: { x: 980, y: topFirst ? 455 : 105 },
    switches: [sw('A', 355 + i * 10, topFirst ? 455 : 105), sw('B', 675 - i * 8, topFirst ? 105 : 455)],
    gates: [vGate(805, 70, 420, 'A'), hGate(topFirst ? 330 : 205, 705, 270, 'B')],
    requiredSwitches: ['A', 'B'],
    obstacles: [
      block(210, topFirst ? 180 : 360, 310, 24),
      block(470, topFirst ? 330 : 175, 300, 24),
      block(560, 90, 24, 170),
    ],
    maxBounces: 8 + Math.floor(i / 3),
    parBounces: 3 + Math.floor(i / 4),
  });
});

const chapter3 = Array.from({ length: 10 }, (_, i) => {
  const n = i + 1;
  return level(`C${n}`, [
    'Patrol Beat', 'Sliding Shutter', 'Guard Rotation', 'Crossing Shift', 'Open Window',
    'Laser Sweep', 'Security Loop', 'Narrow Timing', 'Moving Vault', 'Panic Room'
  ][i], {
    chapter: 3,
    ballStart: { x: 95, y: 120 + (i % 3) * 160 },
    target: { x: 975, y: 440 - (i % 3) * 145 },
    switches: [sw('A', 390 + i * 12, 280), ...(i > 5 ? [sw('B', 725, i % 2 ? 100 : 460)] : [])],
    gates: [vGate(825, 80, 400, 'A'), ...(i > 5 ? [hGate(280, 725, 240, 'B')] : [])],
    requiredSwitches: i > 5 ? ['A', 'B'] : ['A'],
    obstacles: [block(225, 220, 260, 24), block(520, 330, 260, 24)],
    movingObstacles: [
      { x: 515, y: 90, w: 34, h: 280, axis: i % 2 ? 'x' : 'y', speed: 1.8 + i * 0.15, range: i % 2 ? [470, 650] : [70, 190] },
      ...(i > 3 ? [{ x: 680, y: 260, w: 210, h: 28, axis: 'x', speed: 1.5 + i * 0.1, range: [610, 790] }] : []),
    ],
    maxBounces: 8 + Math.floor(i / 2),
    parBounces: 3 + Math.floor(i / 3),
  });
});

const chapter4 = Array.from({ length: 10 }, (_, i) => {
  const n = i + 1;
  const shots = i < 3 ? 2 : 3;
  return level(`D${n}`, [
    'Second Chamber', 'Spare Round', 'Risk Budget', 'Ricochet Clip', 'Ammo Audit',
    'Reload Window', 'Three Chances', 'Waste Not', 'Final Cartridge', 'Last Bullet'
  ][i], {
    chapter: 4,
    shots,
    ballStart: { x: 90, y: i % 2 ? 460 : 100 },
    target: { x: 980, y: i % 2 ? 105 : 455 },
    switches: [sw('A', 330, 280), sw('B', 610, i % 2 ? 105 : 455), ...(i > 6 ? [sw('C', 860, 280)] : [])],
    gates: [vGate(500, 70, 420, 'A'), vGate(785, 70, 420, 'B'), ...(i > 6 ? [hGate(280, 820, 170, 'C')] : [])],
    requiredSwitches: i > 6 ? ['A', 'B', 'C'] : ['A', 'B'],
    obstacles: [block(210, 190, 210, 24), block(575, 330, 210, 24), block(705, 120, 24, 180)],
    movingObstacles: i > 4 ? [{ x: 400, y: 250, w: 180, h: 28, axis: 'x', speed: 2.2, range: [350, 590] }] : [],
    maxBounces: 7 + Math.floor(i / 2),
    parBounces: 3 + Math.floor(i / 3),
  });
});

const chapter5 = Array.from({ length: 10 }, (_, i) => {
  const n = i + 1;
  return level(`E${n}`, [
    'Grand Lobby', 'Noisy Marble', 'Blue Wire', 'Vault Teeth', 'Pressure Plate',
    'Elevator Shaft', 'Alarm Maze', 'Glass Cannon', 'The Long Con', 'Bullet Heist'
  ][i], {
    chapter: 5,
    shots: i > 5 ? 2 : 1,
    ballStart: { x: 90, y: [95, 280, 465][i % 3] },
    target: { x: 990, y: [465, 95, 280][i % 3] },
    targetRadius: i > 7 ? 12 : undefined,
    switches: [
      sw('A', 310 + i * 8, 105 + (i % 2) * 350),
      sw('B', 560, 455 - (i % 2) * 350),
      sw('C', 830, 280),
    ],
    gates: [vGate(455, 70, 420, 'A'), hGate(280, 520, 280, 'B'), vGate(895, 95, 370, 'C')],
    requiredSwitches: ['A', 'B', 'C'],
    obstacles: [
      block(190, 205, 255, 24),
      block(315, 335, 280, 24),
      block(650, 185, 250, 24),
      ...(i > 4 ? [block(725, 350, 24, 150)] : []),
    ],
    movingObstacles: [
      { x: 520, y: 90, w: 32, h: 260, axis: 'y', speed: 2 + i * 0.12, range: [70, 200] },
      ...(i > 2 ? [{ x: 675, y: 390, w: 200, h: 28, axis: 'x', speed: 2.1, range: [610, 805] }] : []),
    ],
    mirrors: i > 6 ? [{ x: 515, y: 425, w: 60, h: 24, deflect: { vx: 1, vy: 0 }, label: 'GO' }] : [],
    maxBounces: 10 + Math.floor(i / 2),
    parBounces: 4 + Math.floor(i / 3),
  });
});

export const GAME_LEVELS = [
  ...chapter1,
  ...chapter2,
  ...chapter3,
  ...chapter4,
  ...chapter5,
];
