/**
 * Overlay
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages the win/lose full-screen overlay.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export class Overlay {
  /**
   * @param {{
   *   el: HTMLElement,
   *   title: HTMLElement,
   *   msg: HTMLElement,
   *   btn: HTMLElement,
   * }} els
   */
  constructor(els) {
    this._els = els;
  }

  show(type, title, msg, btnLabel = 'PLAY AGAIN') {
    const { el, title: titleEl, msg: msgEl, btn } = this._els;
    titleEl.textContent = title;
    msgEl.textContent   = msg;
    btn.textContent     = btnLabel;
    el.className        = `show ${type}`;  // 'win' | 'lose'
  }

  hide() {
    this._els.el.className = '';
  }

  onButtonClick(fn) {
    this._els.btn.addEventListener('click', fn);
  }
}
