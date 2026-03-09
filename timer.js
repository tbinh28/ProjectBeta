/* ================================================================
   TIMER.JS — Countdown Timer
================================================================ */

class CountdownTimer {
  /**
   * @param {number}   totalSeconds  — how long the timer runs
   * @param {Function} onTick        — called every second with (remaining, formatted)
   * @param {Function} onEnd         — called when time reaches 0
   */
  constructor(totalSeconds, onTick, onEnd) {
    this.total     = totalSeconds;
    this.remaining = totalSeconds;
    this.onTick    = onTick || (() => {});
    this.onEnd     = onEnd || (() => {});
    this._interval = null;
    this._running  = false;
  }

  /** Start or resume the timer. */
  start() {
    if (this._running) return;
    this._running = true;

    // Fire immediately so the display shows the right time from the start
    this.onTick(this.remaining, this.format(this.remaining));

    this._interval = setInterval(() => {
      this.remaining--;

      if (this.remaining <= 0) {
        this.remaining = 0;
        this.onTick(0, '00:00');
        this.stop();
        this.onEnd();
      } else {
        this.onTick(this.remaining, this.format(this.remaining));
      }
    }, 1000);
  }

  /** Pause the timer (preserves remaining time). */
  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    this._running = false;
  }

  /** Stop and reset back to total. */
  reset() {
    this.stop();
    this.remaining = this.total;
  }

  /** @returns {boolean} */
  isRunning() { return this._running; }

  /**
   * Format seconds as MM:SS string.
   * @param {number} seconds
   * @returns {string}
   */
  format(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  /**
   * Fraction of time elapsed (0 → 1).
   * Useful for progress bars.
   */
  progress() {
    return (this.total - this.remaining) / this.total;
  }
}
