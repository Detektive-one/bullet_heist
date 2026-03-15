import { ThemeManager } from './theme/ThemeManager.js';
import { Game }         from './game/Game.js';
import { HUD }          from './ui/HUD.js';
import { Overlay }      from './ui/Overlay.js';
import { TUTORIAL_LEVELS, GAME_LEVELS, getLevelById, getNextLevel } from './levels/index.js';

// ── Theme ─────────────────────────────────────────────────────────────────────
const savedTheme = localStorage.getItem('bh_theme') ?? 'neon';
ThemeManager.apply(savedTheme);

// ── DOM refs ──────────────────────────────────────────────────────────────────
const canvas = document.getElementById('c');

const hud = new HUD({
  bounces: document.getElementById('hud-bounces'),
  shots:   document.getElementById('hud-shots'),
  level:   document.getElementById('hud-level'),
  status:  document.getElementById('status-bar'),
});

// Custom HUD: add par display
hud.setPar = n => { const el = document.getElementById('hud-par'); if (el) el.textContent = n ?? '—'; };

const overlay = new Overlay({
  el:    document.getElementById('overlay'),
  title: document.getElementById('overlay-title'),
  msg:   document.getElementById('overlay-msg'),
  // Overlay now has two buttons — we wire them manually below
  btn:   document.getElementById('overlay-next'),
});

// ── Screen management ─────────────────────────────────────────────────────────
const screens = {
  landing: document.getElementById('screen-landing'),
  levels:  document.getElementById('screen-levels'),
  game:    document.getElementById('screen-game'),
};

function showScreen(name) {
  Object.entries(screens).forEach(([k, el]) => {
    el.classList.toggle('active', k === name);
  });
}

// ── Game state ────────────────────────────────────────────────────────────────
const game = new Game(canvas, hud, overlay);
game.start();

let _currentLevelId   = null;
let _currentPool      = TUTORIAL_LEVELS;   // 'tutorial' | 'game'
let _currentMode      = 'tutorial';

function loadLevel(id, pool = _currentPool, mode = _currentMode) {
  _currentLevelId = id;
  _currentPool    = pool;
  _currentMode    = mode;

  const level = getLevelById(id);
  game.loadLevel(level);

  // Top bar
  document.getElementById('topbar-level-name').textContent = `${id}. ${level.name}`;
  const badge = document.getElementById('game-mode-badge');
  badge.textContent = mode === 'tutorial' ? 'TUTORIAL' : 'GAME';
  badge.className   = 'mode-badge' + (mode === 'game' ? ' game-mode' : '');

  // Pause level info
  document.getElementById('pause-level-info').textContent = `${id}. ${level.name}`;

  // Par
  hud.setPar(level.parBounces ?? '—');

  // Sync level-select active card
  document.querySelectorAll('.ls-card').forEach(c =>
    c.classList.toggle('active', c.dataset.id === String(id))
  );
}

// ── Landing buttons ───────────────────────────────────────────────────────────

// Loading bar animation
const loadingProgress = document.getElementById('loading-progress');
const landingButtons  = document.getElementById('landing-buttons');
const loadingScreen   = document.getElementById('loading-screen');

let _loadDone = false;
function simulateLoading() {
  let p = 0;
  const iv = setInterval(() => {
    p += 12;
    loadingProgress.style.width = Math.min(p, 100) + '%';
    if (p >= 100) {
      clearInterval(iv);
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
        landingButtons.classList.remove('hidden');
        _loadDone = true;
      }, 400);
    }
  }, 150);
}
simulateLoading();

// Start Game → first game level
document.getElementById('btn-start-game').addEventListener('click', () => {
  loadLevel(GAME_LEVELS[0].id, GAME_LEVELS, 'game');
  showScreen('game');
});

// Tutorial → first tutorial level
document.getElementById('btn-tutorial').addEventListener('click', () => {
  loadLevel(TUTORIAL_LEVELS[0].id, TUTORIAL_LEVELS, 'tutorial');
  showScreen('game');
});

// Levels screen
document.getElementById('btn-levels-land').addEventListener('click', () => {
  showScreen('levels');
});

// Settings
document.getElementById('btn-settings-land').addEventListener('click', () => {
  openSettings();
});

// ── Level Select Screen ───────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;

// Build pages: page 0 = game levels, page 1+ = tutorial levels (10 each)
function buildLevelPages() {
  const track = document.getElementById('ls-pages-track');
  track.innerHTML = '';
  _pages = [];

  // Page structure: [{ label, levels[] }]
  const gameChunks     = chunk(GAME_LEVELS,     ITEMS_PER_PAGE);
  const tutorialChunks = chunk(TUTORIAL_LEVELS, ITEMS_PER_PAGE);

  // First: game levels pages
  gameChunks.forEach((levels, i) => {
    _pages.push({ label: i === 0 ? 'GAME LEVELS' : null, levels });
  });

  // Then: tutorial pages
  tutorialChunks.forEach((levels, i) => {
    _pages.push({ label: i === 0 ? 'TUTORIAL' : null, levels });
  });

  // Render each page
  _pages.forEach((page, pageIdx) => {
    const pageEl = document.createElement('div');
    pageEl.className = 'ls-page';

    if (page.label) {
      const lbl = document.createElement('div');
      lbl.className = 'ls-page-label';
      lbl.textContent = page.label;
      pageEl.appendChild(lbl);
    }

    page.levels.forEach(level => {
      const card = document.createElement('button');
      card.className  = 'ls-card';
      card.dataset.id = level.id;
      const isTutorial = TUTORIAL_LEVELS.includes(level);
      card.innerHTML = `
        <span class="ls-num">${level.id}</span>
        <span class="ls-name">${level.name}</span>
        <span class="ls-badge ${isTutorial ? 'tutorial' : ''}">${isTutorial ? 'Tutorial' : 'Game'}</span>
      `;
      card.addEventListener('click', () => {
        const pool = isTutorial ? TUTORIAL_LEVELS : GAME_LEVELS;
        const mode = isTutorial ? 'tutorial' : 'game';
        loadLevel(level.id, pool, mode);
        showScreen('game');
      });
      pageEl.appendChild(card);
    });

    track.appendChild(pageEl);
  });

  // Build dots
  const dotsEl = document.getElementById('ls-dots');
  dotsEl.innerHTML = '';
  _pages.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'ls-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToPage(i));
    dotsEl.appendChild(dot);
  });

  updatePageNav();
}

let _pages    = [];
let _pageIdx  = 0;

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out.length ? out : [[]];
}

function goToPage(idx) {
  _pageIdx = Math.max(0, Math.min(idx, _pages.length - 1));
  document.getElementById('ls-pages-track').style.transform = `translateX(-${_pageIdx * 100}%)`;
  updatePageNav();
}

function updatePageNav() {
  document.getElementById('ls-prev').disabled = _pageIdx === 0;
  document.getElementById('ls-next').disabled = _pageIdx >= _pages.length - 1;
  document.getElementById('ls-page-indicator').textContent = `${_pageIdx + 1} / ${_pages.length}`;
  document.querySelectorAll('.ls-dot').forEach((d, i) =>
    d.classList.toggle('active', i === _pageIdx)
  );
}

document.getElementById('ls-prev').addEventListener('click', () => goToPage(_pageIdx - 1));
document.getElementById('ls-next').addEventListener('click', () => goToPage(_pageIdx + 1));
document.getElementById('ls-back').addEventListener('click', () => showScreen('landing'));

// Touch/swipe on ls-viewport
let _lsTouchX = 0;
const lsViewport = document.querySelector('.ls-viewport');
lsViewport.addEventListener('touchstart', e => { _lsTouchX = e.touches[0].clientX; }, { passive: true });
lsViewport.addEventListener('touchend',   e => {
  const dx = e.changedTouches[0].clientX - _lsTouchX;
  if (Math.abs(dx) > 40) goToPage(_pageIdx + (dx < 0 ? 1 : -1));
}, { passive: true });

buildLevelPages();

// ── Overlay (win/lose) buttons ─────────────────────────────────────────────────
document.getElementById('overlay-next').addEventListener('click', () => {
  const next = getNextLevel(_currentLevelId, _currentPool);
  if (next) {
    loadLevel(next.id, _currentPool, _currentMode);
  } else {
    game.reset();
  }
});
document.getElementById('overlay-retry').addEventListener('click', () => game.reset());

// Patch Overlay.show to also update next-button visibility
const _origOverlayShow = overlay.show.bind(overlay);
overlay.show = (type, title, msg, btnLabel) => {
  _origOverlayShow(type, title, msg, btnLabel);
  const hasNext = !!getNextLevel(_currentLevelId, _currentPool);
  document.getElementById('overlay-next').style.display = hasNext ? '' : 'none';
};

// ── Game top-bar buttons ───────────────────────────────────────────────────────
document.getElementById('btn-reset-top').addEventListener('click', () => game.reset());
document.getElementById('btn-pause').addEventListener('click', openPause);

// ── Pause overlay ─────────────────────────────────────────────────────────────
const pauseOverlay = document.getElementById('pause-overlay');

function openPause() {
  // game.pause() — stop the loop without resetting (Game needs a pause method)
  game.pause?.();
  pauseOverlay.classList.add('open');
  buildPauseThemeBtns();
}
function closePause() {
  game.resume?.();
  pauseOverlay.classList.remove('open');
}

document.getElementById('pause-resume').addEventListener('click', closePause);

document.getElementById('pause-levels').addEventListener('click', () => {
  closePause();
  game.stop();
  showScreen('levels');
});

document.getElementById('pause-settings').addEventListener('click', () => {
  closePause();
  openSettings();
});

document.getElementById('pause-home').addEventListener('click', () => {
  pauseOverlay.classList.remove('open');
  game.stop();
  showScreen('landing');
  simulateLoading(); // re-trigger loading if going back
});

// Theme buttons in pause panel
function buildPauseThemeBtns() {
  const grid = document.getElementById('pause-theme-btns');
  grid.innerHTML = '';
  ThemeManager.all.forEach(theme => {
    const btn = document.createElement('button');
    btn.className = 'pause-theme-btn' + (theme.id === ThemeManager.current.id ? ' active' : '');
    btn.textContent = theme.label;
    btn.addEventListener('click', () => {
      ThemeManager.apply(theme.id);
      localStorage.setItem('bh_theme', theme.id);
      document.querySelectorAll('.pause-theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
    grid.appendChild(btn);
  });
}

// ── Settings modal ────────────────────────────────────────────────────────────
const settingsModal = document.getElementById('settings-modal');

function openSettings() { settingsModal.classList.remove('hidden'); }
function closeSettings() { settingsModal.classList.add('hidden'); }

document.getElementById('settings-close').addEventListener('click', closeSettings);
settingsModal.addEventListener('click', e => { if (e.target === settingsModal) closeSettings(); });

const soundToggle = document.getElementById('sound-toggle');
const musicToggle = document.getElementById('music-toggle');
soundToggle.textContent = (localStorage.getItem('bh_sound') ?? 'on').toUpperCase();
musicToggle.textContent = (localStorage.getItem('bh_music') ?? 'on').toUpperCase();

soundToggle.addEventListener('click', () => {
  const on = soundToggle.textContent === 'ON';
  soundToggle.textContent = on ? 'OFF' : 'ON';
  localStorage.setItem('bh_sound', on ? 'off' : 'on');
});
musicToggle.addEventListener('click', () => {
  const on = musicToggle.textContent === 'ON';
  musicToggle.textContent = on ? 'OFF' : 'ON';
  localStorage.setItem('bh_music', on ? 'off' : 'on');
});

const themeSelect = document.getElementById('theme-select');
themeSelect.value = ThemeManager.current.id;
themeSelect.addEventListener('change', () => {
  ThemeManager.apply(themeSelect.value);
  localStorage.setItem('bh_theme', themeSelect.value);
});

// Fullscreen
document.getElementById('btn-fullscreen').addEventListener('click', async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      await screen.orientation?.lock?.('landscape').catch(() => {});
    } else {
      await document.exitFullscreen();
    }
  } catch (e) { console.info('Fullscreen:', e.message); }
});

// ── Game: wire pause/resume into Game.js if not already there ─────────────────
// Game.pause() stops the RAF loop, Game.resume() restarts it
// (These are already provided by game.stop() / game.start() but we alias them)
if (!game.pause)  game.pause  = () => game.stop();
if (!game.resume) game.resume = () => { if (!game._raf) game.start(); };

// ── Start on landing ──────────────────────────────────────────────────────────
showScreen('landing');