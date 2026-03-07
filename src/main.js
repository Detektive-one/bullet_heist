import { ThemeManager } from './theme/ThemeManager.js';
import { Game }         from './game/Game.js';
import { HUD }          from './ui/HUD.js';
import { Overlay }      from './ui/Overlay.js';
import { LEVELS, getLevelById, getNextLevel } from './levels/index.js';

// Make LEVELS available to Game._nextLevel()
window._LEVELS = LEVELS;

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

const overlay = new Overlay({
  el:    document.getElementById('overlay'),
  title: document.getElementById('overlay-title'),
  msg:   document.getElementById('overlay-msg'),
  btn:   document.getElementById('overlay-btn'),
});

// ── Game ──────────────────────────────────────────────────────────────────────
const game = new Game(canvas, hud, overlay);

let _currentLevelId = 1;

function loadLevel(id) {
  _currentLevelId = id;
  const level = getLevelById(id);
  game.loadLevel(level);
  // Update level select grid active state
  document.querySelectorAll('.ls-card').forEach(c => {
    c.classList.toggle('active', Number(c.dataset.id) === id);
  });
  updateLevelName(level);
}

function updateLevelName(level) {
  const el = document.getElementById('level-name');
  if (el) el.textContent = `${level.id}. ${level.name}`;
}

// Load level FIRST so this._level is set before the render loop fires
loadLevel(parseInt(localStorage.getItem('bh_level') ?? '1', 10));
game.start();

// ── Overlay button (Next Level / Try Again) ────────────────────────────────────
overlay.onButtonClick((label) => {
  if (label === 'NEXT LEVEL') {
    const next = getNextLevel(_currentLevelId);
    if (next) {
      localStorage.setItem('bh_level', next.id);
      loadLevel(next.id);
    } else {
      loadLevel(_currentLevelId);
    }
  } else {
    game.reset();
  }
});

// ── Buttons ───────────────────────────────────────────────────────────────────
document.getElementById('btn-reset').addEventListener('click', () => game.reset());

document.getElementById('btn-theme').addEventListener('click', () => {
  ThemeManager.cycle();
  localStorage.setItem('bh_theme', ThemeManager.current.id);
  document.getElementById('btn-theme').textContent = ThemeManager.current.label.toUpperCase();
});
window.addEventListener('themechange', e => {
  document.getElementById('btn-theme').textContent = e.detail.label.toUpperCase();
});
document.getElementById('btn-theme').textContent = ThemeManager.current.label.toUpperCase();

// ── Level Select ──────────────────────────────────────────────────────────────
const lsModal   = document.getElementById('level-select');
const lsOverlay = document.getElementById('ls-overlay');
const grid      = document.getElementById('ls-grid');

// Populate grid
LEVELS.forEach(level => {
  const card = document.createElement('button');
  card.className    = 'ls-card';
  card.dataset.id   = level.id;
  card.innerHTML    = `<span class="ls-num">${level.id}</span><span class="ls-name">${level.name}</span>`;
  card.addEventListener('click', () => {
    localStorage.setItem('bh_level', level.id);
    loadLevel(level.id);
    closeLevelSelect();
  });
  grid.appendChild(card);
});

function openLevelSelect() {
  lsModal.classList.add('open');
  // Sync active
  document.querySelectorAll('.ls-card').forEach(c => {
    c.classList.toggle('active', Number(c.dataset.id) === _currentLevelId);
  });
}

function closeLevelSelect() { lsModal.classList.remove('open'); }

document.getElementById('btn-levels').addEventListener('click', openLevelSelect);
lsOverlay.addEventListener('click', closeLevelSelect);
document.getElementById('ls-close').addEventListener('click', closeLevelSelect);

// ── Fullscreen + Orientation lock ─────────────────────────────────────────────
const btnFs = document.getElementById('btn-fullscreen');
btnFs.addEventListener('click', async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      await screen.orientation?.lock?.('landscape').catch(() => {});
      btnFs.textContent = '✕';
      btnFs.title = 'Exit Fullscreen';
    } else {
      await document.exitFullscreen();
      btnFs.textContent = '⛶';
      btnFs.title = 'Fullscreen / Landscape';
    }
  } catch (e) {
    console.info('Fullscreen unavailable:', e.message);
  }
});

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    btnFs.textContent = '⛶';
    btnFs.title = 'Fullscreen / Landscape';
  }
});
