/* ================================================================
   APP.JS — Entry Point · Global State · Navigation · Utilities
================================================================ */

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STATE
// ─────────────────────────────────────────────────────────────────────────────

const AppState = {
  /** @type {'setup'|'exam'|'result'} */
  screen: 'setup',

  /** @type {Array<{id:number, content:string, options:{A:string,B:string,C:string,D:string}}>} */
  questions: [],

  /** @type {Object<number, 'A'|'B'|'C'|'D'>} — user's selected answers { qId: letter } */
  answers: {},

  /** @type {Object<number, 'A'|'B'|'C'|'D'>} — correct answers from key { qId: letter } */
  answerKey: {},

  /** @type {number} — exam duration in seconds */
  duration: 45 * 60,

  /** @type {CountdownTimer|null} */
  timer: null,

  /** @type {File|null} — the uploaded file */
  selectedFile: null,
};


// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Navigate to a screen.
 * Stops any running timer (except when going to exam — exam.js starts its own).
 *
 * @param {'setup'|'exam'|'result'} screen
 */
function navigate(screen) {
  // Stop timer unless we're starting the exam (exam.js will create a fresh one)
  if (AppState.timer && screen !== 'exam') {
    AppState.timer.stop();
    AppState.timer = null;
  }

  AppState.screen = screen;

  switch (screen) {
    case 'setup':  renderSetup();  break;
    case 'exam':   renderExam();   break;
    case 'result': renderResult(); break;
    default:
      console.warn('Unknown screen:', screen);
  }

  // Scroll to top on every navigation
  window.scrollTo({ top: 0, behavior: 'instant' });
}


// ─────────────────────────────────────────────────────────────────────────────
// TOAST NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────

let _toastTimeout = null;

/**
 * Show a brief toast message at the bottom of the screen.
 *
 * @param {string} message
 * @param {'info'|'error'|'success'} type
 * @param {number} duration  ms to show (default 3000)
 */
function showToast(message, type = 'info', duration = 3000) {
  // Remove existing toast
  const existing = document.getElementById('appToast');
  if (existing) existing.remove();
  if (_toastTimeout) clearTimeout(_toastTimeout);

  // Build toast
  const toast = document.createElement('div');
  toast.id = 'appToast';
  toast.className = 'toast';

  const colors = {
    info:    'background:#1e1b4b',
    error:   'background:#991b1b',
    success: 'background:#065f46',
  };
  toast.style.cssText = (colors[type] || colors.info) + ';color:#fff;';
  toast.textContent = message;

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  // Auto-dismiss
  _toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}


// ─────────────────────────────────────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  navigate('setup');
});
