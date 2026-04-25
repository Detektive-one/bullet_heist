import { LEVELS } from '../src/levels/index.js';
import { DESIGN_W, DESIGN_H, WALL_THICK } from '../src/constants.js';

const canvas = document.getElementById('editor-canvas');
const ctx = canvas.getContext('2d');
const levelSelect = document.getElementById('level-select');
const output = document.getElementById('export-output');
const readout = document.getElementById('cursor-readout');
const form = document.getElementById('selection-form');
const empty = document.getElementById('selection-empty');

const props = {
  id: document.getElementById('prop-id'),
  x: document.getElementById('prop-x'),
  y: document.getElementById('prop-y'),
  w: document.getElementById('prop-w'),
  h: document.getElementById('prop-h'),
  requires: document.getElementById('prop-requires'),
};

const meta = {
  name: document.getElementById('meta-name'),
  shots: document.getElementById('meta-shots'),
  max: document.getElementById('meta-max'),
  par: document.getElementById('meta-par'),
};

let level = cloneLevel(LEVELS[0]);
let tool = 'select';
let selected = null;
let dragging = false;
let dragOffset = { x: 0, y: 0 };

for (const l of LEVELS) {
  const option = document.createElement('option');
  option.value = String(l.id);
  option.textContent = `${l.id} - ${l.name}`;
  levelSelect.appendChild(option);
}

document.getElementById('tool-buttons').addEventListener('click', event => {
  const btn = event.target.closest('button[data-tool]');
  if (!btn) return;
  tool = btn.dataset.tool;
  document.querySelectorAll('[data-tool]').forEach(b => b.classList.toggle('active', b === btn));
});

levelSelect.addEventListener('change', () => {
  level = cloneLevel(LEVELS.find(l => String(l.id) === levelSelect.value) ?? LEVELS[0]);
  selected = null;
  syncMeta();
  syncSelection();
  render();
});

for (const input of Object.values(props)) input.addEventListener('input', applyProps);
for (const input of Object.values(meta)) input.addEventListener('input', applyMeta);

document.getElementById('delete-selected').addEventListener('click', () => {
  if (!selected) return;
  const list = getList(selected.kind);
  const idx = list.indexOf(selected.item);
  if (idx >= 0) list.splice(idx, 1);
  selected = null;
  syncSelection();
  render();
});

document.getElementById('copy-export').addEventListener('click', async () => {
  output.select();
  await navigator.clipboard?.writeText(output.value).catch(() => {});
});

canvas.addEventListener('pointerdown', event => {
  const p = pointer(event);
  if (tool === 'select') {
    selected = hitTest(p);
    if (selected) {
      dragging = true;
      dragOffset = { x: p.x - selected.item.x, y: p.y - selected.item.y };
    }
    syncSelection();
    render();
    return;
  }
  selected = place(tool, p);
  tool = 'select';
  document.querySelectorAll('[data-tool]').forEach(b => b.classList.toggle('active', b.dataset.tool === 'select'));
  syncSelection();
  render();
});

canvas.addEventListener('pointermove', event => {
  const p = pointer(event);
  readout.textContent = `x: ${Math.round(p.x)} y: ${Math.round(p.y)}`;
  if (!dragging || !selected) return;
  selected.item.x = snap(p.x - dragOffset.x);
  selected.item.y = snap(p.y - dragOffset.y);
  syncSelection();
  render();
});

window.addEventListener('pointerup', () => { dragging = false; });

function cloneLevel(src) {
  return JSON.parse(JSON.stringify(src));
}

function syncMeta() {
  meta.name.value = level.name ?? '';
  meta.shots.value = level.shots ?? 1;
  meta.max.value = level.maxBounces ?? 6;
  meta.par.value = level.parBounces ?? 2;
}

function applyMeta() {
  level.name = meta.name.value;
  level.shots = Number(meta.shots.value || 1);
  level.maxBounces = Number(meta.max.value || 0);
  level.parBounces = Number(meta.par.value || 0);
  render();
}

function syncSelection() {
  empty.classList.toggle('hidden', !!selected);
  form.classList.toggle('hidden', !selected);
  if (!selected) return;
  const item = selected.item;
  props.id.value = item.id ?? item.label ?? '';
  props.x.value = Math.round(item.x ?? 0);
  props.y.value = Math.round(item.y ?? 0);
  props.w.value = Math.round(item.w ?? item.r ?? 0);
  props.h.value = Math.round(item.h ?? item.r ?? 0);
  props.requires.value = (item.requires ?? []).join(',');
}

function applyProps() {
  if (!selected) return;
  const item = selected.item;
  const id = props.id.value.trim();
  if (selected.kind === 'switches') {
    item.id = id || item.id;
    item.label = id || item.label;
  } else if (selected.kind === 'mirrors') {
    item.label = id || item.label;
  }
  item.x = Number(props.x.value || 0);
  item.y = Number(props.y.value || 0);
  if ('w' in item) item.w = Number(props.w.value || 0);
  if ('h' in item) item.h = Number(props.h.value || 0);
  if ('r' in item) item.r = Number(props.w.value || item.r || 16);
  if (selected.kind === 'gates') item.requires = props.requires.value.split(',').map(s => s.trim()).filter(Boolean);
  render();
}

function place(kind, p) {
  const x = snap(p.x), y = snap(p.y);
  if (kind === 'ball') {
    level.ballStart = { x, y };
    return { kind: 'ballStart', item: level.ballStart };
  }
  if (kind === 'target') {
    level.target = { x, y };
    return { kind: 'target', item: level.target };
  }
  const map = {
    obstacle: ['obstacles', { x, y, w: 120, h: 28 }],
    gate: ['gates', { x, y, w: 28, h: 180, requires: ['A'] }],
    switch: ['switches', { id: nextSwitchId(), x, y, label: nextSwitchId(), required: true }],
    moving: ['movingObstacles', { x, y, w: 150, h: 28, axis: 'x', speed: 2, range: [x - 80, x + 80] }],
    mirror: ['mirrors', { x, y, w: 60, h: 24, deflect: { vx: 1, vy: 0 }, label: 'GO' }],
  };
  const [listName, item] = map[kind];
  level[listName] ??= [];
  level[listName].push(item);
  return { kind: listName, item };
}

function nextSwitchId() {
  const ids = new Set((level.switches ?? []).map(s => s.id));
  for (const id of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') if (!ids.has(id)) return id;
  return `S${ids.size + 1}`;
}

function getList(kind) {
  if (kind === 'ballStart' || kind === 'target') return [];
  return level[kind] ?? [];
}

function hitTest(p) {
  const checks = [
    ['switches', level.switches ?? []],
    ['gates', level.gates ?? []],
    ['movingObstacles', level.movingObstacles ?? []],
    ['mirrors', level.mirrors ?? []],
    ['obstacles', level.obstacles ?? []],
  ];
  if (dist(p, level.ballStart) < 18) return { kind: 'ballStart', item: level.ballStart };
  if (dist(p, level.target) < 24) return { kind: 'target', item: level.target };
  for (const [kind, list] of checks) {
    for (let i = list.length - 1; i >= 0; i--) {
      const item = list[i];
      if ('r' in item && dist(p, item) <= item.r + 8) return { kind, item };
      if (p.x >= item.x && p.x <= item.x + item.w && p.y >= item.y && p.y <= item.y + item.h) return { kind, item };
    }
  }
  return null;
}

function render() {
  ctx.clearRect(0, 0, DESIGN_W, DESIGN_H);
  drawArena();
  for (const ob of level.obstacles ?? []) drawRect(ob, '#303743', '#677385');
  for (const gate of level.gates ?? []) drawRect(gate, '#35191d', '#ff4b4b', gate.requires?.join('+') ?? 'LOCK');
  for (const ob of level.movingObstacles ?? []) drawRect(ob, '#31264a', '#b887ff', 'MOVE');
  for (const m of level.mirrors ?? []) drawRect(m, '#12384a', '#38c8ff', m.label ?? 'GO');
  for (const s of level.switches ?? []) drawCircle(s, s.r ?? 16, '#ffb02e', '#fff4b8', s.label ?? s.id);
  drawCircle(level.target, level.targetRadius ?? 18, '#45f6a3', '#0d5f3c', 'T');
  drawCircle(level.ballStart, 12, '#ffb02e', '#fff0b6', 'S');
  if (selected?.item) drawSelection(selected.item);
  output.value = exportLevel();
}

function drawArena() {
  ctx.fillStyle = '#111722';
  ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let x = WALL_THICK; x < DESIGN_W; x += 40) line(x, WALL_THICK, x, DESIGN_H - WALL_THICK);
  for (let y = WALL_THICK; y < DESIGN_H; y += 40) line(WALL_THICK, y, DESIGN_W - WALL_THICK, y);
  ctx.strokeStyle = '#3d4654';
  ctx.lineWidth = WALL_THICK;
  ctx.strokeRect(WALL_THICK / 2, WALL_THICK / 2, DESIGN_W - WALL_THICK, DESIGN_H - WALL_THICK);
}

function drawRect(r, fill, stroke, label = '') {
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.strokeRect(r.x, r.y, r.w, r.h);
  if (label) {
    ctx.fillStyle = '#f2f6ff';
    ctx.font = '12px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, r.x + r.w / 2, r.y + r.h / 2);
  }
}

function drawCircle(p, r, fill, stroke, label) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#061015';
  ctx.font = 'bold 12px Inter, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, p.x, p.y);
}

function drawSelection(item) {
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.setLineDash([6, 4]);
  ctx.lineWidth = 2;
  if ('w' in item) ctx.strokeRect(item.x - 5, item.y - 5, item.w + 10, item.h + 10);
  else {
    ctx.beginPath();
    ctx.arc(item.x, item.y, (item.r ?? 18) + 8, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function exportLevel() {
  const clean = JSON.stringify(level, null, 2)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"([A-Z][0-9]+|[A-Z])"/g, "'$1'");
  return `level('${level.id}', '${level.name}', ${clean})`;
}

function pointer(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(DESIGN_W, ((event.clientX - rect.left) / rect.width) * DESIGN_W)),
    y: Math.max(0, Math.min(DESIGN_H, ((event.clientY - rect.top) / rect.height) * DESIGN_H)),
  };
}

function snap(v) { return Math.round(v / 10) * 10; }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function line(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }

syncMeta();
syncSelection();
render();
