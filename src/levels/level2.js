export const level2 = {
  id: 2,
  name: 'Corridor Maze',
  description: 'Three segments form a serpentine U-shape. Navigate the long path to the hidden target.',
  ballStart: { x: 100, y: 100 },
  target:    { x: 700, y: 460 },
  obstacles: [
    { x: 200, y: 0,   w: 20, h: 350 },   // left wall of U
    { x: 200, y: 350, w: 400, h: 20 },   // bottom of U
    { x: 600, y: 210, w: 20, h: 350 },   // right wall of U
  ],
  maxBounces: 8,
  parBounces: 3,
};
