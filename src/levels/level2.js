export const level2 = {
  id: 2,
  name: 'Corridor Maze',
  description: 'Three segments form a serpentine U-shape. Navigate the long path to the hidden target.',
  ballStart: { x: 100, y: 100 },
  target: { x: 700, y: 460 },
  obstacles: [
    { x: 200, y: 25, w: 20, h: 150 },   // left wall of U
    { x: 280, y: 275, w: 200, h: 20 },   // bottom of U
    { x: 600, y: 380, w: 20, h: 150 },   // right wall of U
  ],
  maxBounces: 8,
  parBounces: 3,
};
