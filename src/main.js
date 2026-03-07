/**
 * main.js — application entry point
 * ─────────────────────────────────────────────────────────────────────────────
 * Boots the game:
 *   1. Applies the default theme
 *   2. Wires up DOM elements → HUD / Overlay
 *   3. Creates a Game instance and loads the first level
 *   4. Wires reset / theme-toggle buttons
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ThemeManager } from './theme/ThemeManager.js';
import { Game }         from './game/Game.js';
import { HUD }          from './ui/HUD.js';
import { Overlay }      from './ui/Overlay.js';
import { getLevelById } from './levels/index.js';

// ── 1. Theme ──────────────────────────────────────────────────────────────────
const savedTheme = localStorage.getItem('bh_theme') ?? 'neon';
ThemeManager.apply(savedTheme);

// ── 2. DOM refs ───────────────────────────────────────────────────────────────
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

// ── 3. Game ───────────────────────────────────────────────────────────────────
const game = new Game(canvas, hud, overlay);
game.loadLevel(getLevelById(1));
game.start();

// ── 4. Buttons ────────────────────────────────────────────────────────────────
document.getElementById('btn-reset').addEventListener('click', () => game.reset());

overlay.onButtonClick(() => game.reset());

document.getElementById('btn-theme').addEventListener('click', () => {
  ThemeManager.cycle();
  localStorage.setItem('bh_theme', ThemeManager.current.id);
  document.getElementById('btn-theme').textContent = ThemeManager.current.label.toUpperCase();
});

// Keep theme button label in sync
window.addEventListener('themechange', e => {
  document.getElementById('btn-theme').textContent = e.detail.label.toUpperCase();
});

// Set initial theme button label
document.getElementById('btn-theme').textContent = ThemeManager.current.label.toUpperCase();
