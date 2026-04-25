# Bullet Heist 🎯

A top-down ricochet puzzle game. Fire a single bullet that bounces off walls and obstacles to hit the target.

## Play

Serve locally (ES modules need HTTP — can't open `index.html` directly):

```bash
npm run dev
# then open http://localhost:3000
```

## Project Structure

```
bullet_heist/
├── index.html                  # Shell — pure HTML, no inline JS
├── src/
│   ├── main.js                 # Entry point
│   ├── constants.js            # Shared game constants
│   ├── game/
│   │   ├── Game.js             # State machine + game loop
│   │   ├── Physics.js          # Collision & trajectory simulation
│   │   ├── Renderer.js         # All canvas drawing (theme-driven)
│   │   └── Input.js            # Unified mouse + touch
│   ├── levels/
│   │   ├── index.js            # Level registry
│   │   └── level1.js           # Level 1
│   ├── ui/
│   │   ├── HUD.js              # DOM HUD updates
│   │   └── Overlay.js          # Win/Lose screen
│   └── theme/
│       ├── ThemeManager.js     # Applies themes → CSS vars + canvas colors
│       └── themes/
│           ├── neon.js         # Default neon/synthwave theme
│           └── arcade.js       # Retro arcade theme
├── styles/
│   └── main.css                # All CSS — colour via CSS custom properties
├── capacitor.config.json       # Mobile app config (Capacitor)
└── package.json
```

## Adding a Level

1. Add tutorial levels as individual files, or campaign levels in `src/levels/campaign.js`.
2. Levels support `ballStart`, `target`, `obstacles[]`, `movingObstacles[]`, `mirrors[]`, `switches[]`, `gates[]`, `requiredSwitches[]`, `shots`, `maxBounces`, and `parBounces`.
3. Run `npm run validate:levels` before shipping.

## Adding a Theme

1. Copy `src/theme/themes/neon.js` → `src/theme/themes/mytheme.js`.
2. Change any CSS vars or canvas colour tokens.
3. Import and add it to the `REGISTRY` in `src/theme/ThemeManager.js`.
4. Click the **THEME** button in-game to cycle to it.

## Mobile (Capacitor)

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init
npx cap add android
npx cap sync
npx cap open android
```

## Hosting

Run `npm run build` and deploy `www/` for web hosting or Android packaging.
