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

// Landing page refs
const landingPage = document.getElementById('landing-page');
const loadingScreen = document.querySelector('.loading-screen');
const loadingProgress = document.querySelector('.loading-progress');
const landingButtons = document.querySelector('.landing-buttons');
const btnStartGame = document.getElementById('btn-start-game');
const btnLevelsLanding = document.getElementById('btn-levels');
const btnSettings = document.getElementById('btn-settings');

// Game elements to show/hide
const gameElements = [
  document.getElementById('game-title'),
  document.getElementById('hud'),
  document.getElementById('level-name-bar'),
  document.getElementById('arena-wrap'),
  document.getElementById('status-bar'),
  document.getElementById('btn-row')
];

// Settings modal refs
const settingsModal = document.getElementById('settings-modal');
const settingsOverlay = document.getElementById('settings-overlay');
const settingsClose = document.getElementById('settings-close');
const soundToggle = document.getElementById('sound-toggle');
const musicToggle = document.getElementById('music-toggle');
const difficultySelect = document.getElementById('difficulty');
const themeSelect = document.getElementById('theme-select');

// ── Game ──────────────────────────────────────────────────────────────────────
const game = new Game(canvas, hud, overlay);

let _currentLevelId = 1;

// Functions to show/hide screens
function showLanding() {
  landingPage.classList.remove('hidden');
  gameElements.forEach(el => el.classList.add('hidden'));
  settingsModal.classList.add('hidden');
  settingsModal.classList.remove('active');
  document.getElementById('level-select').classList.add('hidden');
  document.getElementById('level-select').classList.remove('active');
  loadingScreen.classList.remove('hidden');
  landingButtons.classList.add('hidden');
}

function showGame() {
  landingPage.classList.add('hidden');
  gameElements.forEach(el => el.classList.remove('hidden'));
}

function simulateLoading() {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    loadingProgress.style.width = progress + '%';
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
        landingButtons.classList.remove('hidden');
      }, 500);
    }
  }, 200);
}

// ── Event Listeners ────────────────────────────────────────────────────────────
// Landing buttons
btnStartGame.addEventListener('click', () => {
  showGame();
  loadLevel(parseInt(localStorage.getItem('bh_level') ?? '1', 10));
  game.start();
});

btnLevelsLanding.addEventListener('click', () => {
  showGame();
  loadLevel(parseInt(localStorage.getItem('bh_level') ?? '1', 10));
  game.start();
  openLevelSelect();
});

btnSettings.addEventListener('click', () => {
  settingsModal.classList.remove('hidden');
  settingsModal.classList.add('active');
});

// Settings modal
settingsClose.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
  settingsModal.classList.remove('active');
});
settingsOverlay.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
  settingsModal.classList.remove('active');
});

soundToggle.addEventListener('click', () => {
  const isOn = soundToggle.textContent === 'ON';
  soundToggle.textContent = isOn ? 'OFF' : 'ON';
  localStorage.setItem('bh_sound', isOn ? 'off' : 'on');
});

musicToggle.addEventListener('click', () => {
  const isOn = musicToggle.textContent === 'ON';
  musicToggle.textContent = isOn ? 'OFF' : 'ON';
  localStorage.setItem('bh_music', isOn ? 'off' : 'on');
});

difficultySelect.addEventListener('change', () => {
  localStorage.setItem('bh_difficulty', difficultySelect.value);
});

themeSelect.addEventListener('change', () => {
  ThemeManager.apply(themeSelect.value);
  localStorage.setItem('bh_theme', themeSelect.value);
  document.getElementById('btn-theme').textContent = ThemeManager.current.label.toUpperCase();
});

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

// ── Initialize ────────────────────────────────────────────────────────────────
showLanding();
simulateLoading();

// Load settings from localStorage
soundToggle.textContent = (localStorage.getItem('bh_sound') ?? 'on') === 'on' ? 'ON' : 'OFF';
musicToggle.textContent = (localStorage.getItem('bh_music') ?? 'on') === 'on' ? 'ON' : 'OFF';
difficultySelect.value = localStorage.getItem('bh_difficulty') ?? 'medium';
themeSelect.value = localStorage.getItem('bh_theme') ?? 'neon';

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
  lsModal.classList.remove('hidden');
  lsModal.classList.add('open');
  // Sync active
  document.querySelectorAll('.ls-card').forEach(c => {
    c.classList.toggle('active', Number(c.dataset.id) === _currentLevelId);
  });
}

function closeLevelSelect() {
  lsModal.classList.add('hidden');
  lsModal.classList.remove('open');
}

document.getElementById('btn-levels-menu').addEventListener('click', openLevelSelect);
lsOverlay.addEventListener('click', closeLevelSelect);
document.getElementById('ls-close').addEventListener('click', closeLevelSelect);