export class Overlay {
  constructor(els) {
    this._els = els;
    this._handlers = [];
  }

  show(type, title, msg, btnLabel = 'PLAY AGAIN') {
    const { el, title: titleEl, msg: msgEl, btn } = this._els;
    titleEl.textContent = title;
    msgEl.textContent   = msg;
    btn.textContent     = btnLabel;
    el.className        = `show ${type}`;
  }

  hide() { this._els.el.className = ''; }

  /** Register a one-off click handler on the action button */
  onButtonClick(fn) {
    // Replace previous listener so only one fires
    const btn = this._els.btn;
    const handler = () => fn(this._els.btn.textContent);
    btn.removeEventListener('click', this._lastHandler);
    this._lastHandler = handler;
    btn.addEventListener('click', handler);
  }
}
