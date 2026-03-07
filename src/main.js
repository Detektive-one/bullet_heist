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


// Add landing page functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get elements
  const landingPage = document.getElementById('landing-page');
  const startGameBtn = document.getElementById('btn-start-game');
  const levelsBtn = document.getElementById('btn-levels');
  const settingsBtn = document.getElementById('btn-settings');
  const levelSelect = document.getElementById('level-select');
  const settingsModal = document.getElementById('settings-modal');
  const lsClose = document.getElementById('ls-close');
  const settingsClose = document.getElementById('settings-close');
  const lsGrid = document.getElementById('ls-grid');
  const soundToggle = document.getElementById('sound-toggle');
  const musicToggle = document.getElementById('music-toggle');
  const difficultySelect = document.getElementById('difficulty');
  const themeSelect = document.getElementById('theme-select');
  const overlay = document.getElementById('overlay');
  const overlayBtn = document.getElementById('overlay-btn');
  
  // Simulate loading progress
  const loadingProgress = document.querySelector('.loading-progress');
  const loadingText = document.querySelector('.loading-text');
  
  let loadingInterval;
  
  // Start loading simulation
  function startLoading() {
    let progress = 0;
    loadingInterval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(loadingInterval);
        setTimeout(() => {
          landingPage.classList.add('hidden');
          showGameElements();
        }, 500);
      }
      loadingProgress.style.width = progress + '%';
      loadingText.textContent = `Loading game assets... ${Math.floor(progress)}%`;
    }, 200);
  }
  
  // Show game elements
  function showGameElements() {
    document.getElementById('game-title').classList.remove('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('level-name-bar').classList.remove('hidden');
    document.getElementById('arena-wrap').classList.remove('hidden');
    document.getElementById('status-bar').classList.remove('hidden');
    document.getElementById('btn-row').classList.remove('hidden');
    
    // Initialize game
    initGame();
  }
  
  // Hide game elements
  function hideGameElements() {
    document.getElementById('game-title').classList.add('hidden');
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('level-name-bar').classList.add('hidden');
    document.getElementById('arena-wrap').classList.add('hidden');
    document.getElementById('status-bar').classList.add('hidden');
    document.getElementById('btn-row').classList.add('hidden');
  }
  
  // Initialize game
  function initGame() {
    // Game initialization logic here if needed
  }
  
  // Populate level grid function
  function populateLevelGrid() {
    // Clear existing grid
    lsGrid.innerHTML = '';
    
    // Populate grid with levels
    LEVELS.forEach(level => {
      const card = document.createElement('button');
      card.className = 'ls-card';
      card.dataset.id = level.id;
      card.innerHTML = `<span class="ls-num">${level.id}</span><span class="ls-name">${level.name}</span>`;
      card.addEventListener('click', () => {
        localStorage.setItem('bh_level', level.id);
        loadLevel(level.id);
        closeLevelSelect();
      });
      lsGrid.appendChild(card);
    });
  }
  
  // Event listeners
  startGameBtn.addEventListener('click', function() {
    hideGameElements();
    startLoading();
  });
  
  levelsBtn.addEventListener('click', function() {
    landingPage.classList.add('hidden');
    levelSelect.classList.remove('hidden');
    populateLevelGrid();
  });
  
  settingsBtn.addEventListener('click', function() {
    landingPage.classList.add('hidden');
    settingsModal.classList.remove('hidden');
  });
  
  lsClose.addEventListener('click', function() {
    levelSelect.classList.add('hidden');
  });
  
  settingsClose.addEventListener('click', function() {
    settingsModal.classList.add('hidden');
  });
  
  // Handle settings changes
  soundToggle.addEventListener('change', function() {
    // Handle sound toggle change
  });
  
  musicToggle.addEventListener('change', function() {
    // Handle music toggle change
  });
  
  difficultySelect.addEventListener('change', function() {
    // Handle difficulty change
  });
  
  themeSelect.addEventListener('change', function() {
    // Handle theme change
    ThemeManager.apply(this.value);
    localStorage.setItem('bh_theme', this.value);
    document.getElementById('btn-theme').textContent = ThemeManager.current.label.toUpperCase();
  });
  
  // Initialize settings from localStorage
  const savedSound = localStorage.getItem('bh_sound') ?? 'on';
  const savedMusic = localStorage.getItem('bh_music') ?? 'on';
  const savedDifficulty = localStorage.getItem('bh_difficulty') ?? 'medium';
  const savedThemeSetting = localStorage.getItem('bh_theme') ?? 'neon';
  
  soundToggle.checked = savedSound === 'on';
  musicToggle.checked = savedMusic === 'on';
  difficultySelect.value = savedDifficulty;
  themeSelect.value = savedThemeSetting;
  
  // Apply saved theme
  ThemeManager.apply(savedThemeSetting);
});