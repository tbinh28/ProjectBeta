/* ================================================================
   EXAM.JS — Exam Screen (timer, questions, options, submit)
================================================================ */

/** Render the exam screen, start the timer. */
function renderExam() {
  const { questions, duration } = AppState;
  const total = questions.length;

  document.getElementById('app').innerHTML = `
    <div class="min-h-screen bg-surface flex flex-col animate-fadeIn">

      <!-- ══ STICKY HEADER ══════════════════════════════════════ -->
      <header class="exam-header shadow-2xl">
        <div class="max-w-2xl mx-auto px-4 py-3">

          <!-- Row 1: Title + Timer -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <div class="min-w-0">
                <p class="text-white font-outfit font-600 text-sm leading-none truncate">EnglishQuiz</p>
                <p id="progressText" class="text-brand-300 text-xs mt-0.5">0 / ${total} câu đã chọn</p>
              </div>
            </div>

            <!-- Timer -->
            <div class="flex flex-col items-end">
              <div id="timerDisplay" class="timer-display text-white text-3xl leading-none">
                ${formatTime(duration)}
              </div>
              <p class="text-brand-400 text-xs mt-0.5">còn lại</p>
            </div>
          </div>

          <!-- Row 2: Progress bar -->
          <div class="mt-3 h-1.5 bg-brand-800 rounded-full overflow-hidden">
            <div id="progressBar" class="progress-bar-fill" style="width: 0%"></div>
          </div>
        </div>
      </header>

      <!-- ══ QUESTION LIST ═══════════════════════════════════════ -->
      <main class="flex-1 max-w-2xl w-full mx-auto px-4 py-6 pb-32 space-y-5">
        ${questions.map((q, idx) => renderQuestionCard(q, idx)).join('')}
      </main>

      <!-- ══ FLOATING SUBMIT ════════════════════════════════════ -->
      <div class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-100 shadow-2xl px-4 py-4">
        <div class="max-w-2xl mx-auto flex items-center gap-3">
          <div class="flex-1 min-w-0">
            <p class="text-xs text-slate-400 leading-none">Đã hoàn thành</p>
            <p id="submitProgressText" class="text-slate-700 font-600 text-sm mt-0.5">0 / ${total} câu</p>
          </div>
          <button id="submitBtn" class="btn-danger flex-shrink-0">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Nộp bài
          </button>
        </div>
      </div>

    </div>
  `;

  _bindExamEvents();
  _startExamTimer();
}


/** Render a single question card. */
function renderQuestionCard(q, idx) {
  const letters = ['A', 'B', 'C', 'D'];
  const optionsHTML = letters.map(letter => {
    const text = q.options[letter];
    if (!text) return ''; // skip empty options
    return `
      <label class="option-block" data-qid="${q.id}" data-letter="${letter}">
        <input type="radio" name="q_${q.id}" value="${letter}" />
        <span class="option-letter">${letter}</span>
        <span class="option-text">${escapeHtml(text)}</span>
      </label>
    `;
  }).join('');

  return `
    <div class="question-card bg-white rounded-2xl shadow-sm shadow-slate-200 border border-slate-100 overflow-hidden"
         style="animation-delay: ${Math.min(idx * 40, 600)}ms"
         id="qcard_${q.id}">

      <!-- Question Header -->
      <div class="flex items-start gap-3 px-5 pt-5 pb-3">
        <span class="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-600 text-white
                     font-outfit font-700 text-sm flex items-center justify-center">
          ${q.id}
        </span>
        <p class="text-slate-800 font-500 text-[15px] leading-relaxed pt-0.5">${escapeHtml(q.content)}</p>
      </div>

      <!-- Options -->
      <div class="px-5 pb-5 space-y-2">
        ${optionsHTML}
      </div>
    </div>
  `;
}


/** Bind click events on option blocks + submit button. */
function _bindExamEvents() {
  const total = AppState.questions.length;

  // ── Option selection (event delegation) ──
  document.getElementById('app').addEventListener('click', (e) => {
    const block = e.target.closest('.option-block');
    if (!block) return;

    const qid    = parseInt(block.dataset.qid, 10);
    const letter = block.dataset.letter;

    // Deselect previous in same question
    document.querySelectorAll(`.option-block[data-qid="${qid}"]`).forEach(b => {
      b.classList.remove('selected');
      b.querySelector('input').checked = false;
    });

    // Select new
    block.classList.add('selected');
    block.querySelector('input').checked = true;
    AppState.answers[qid] = letter;

    // Update progress
    _updateExamProgress(total);
  });

  // ── Submit button ──
  document.getElementById('submitBtn').addEventListener('click', () => {
    _confirmAndSubmit(total);
  });
}

/** Update the progress indicators in the header and floating bar. */
function _updateExamProgress(total) {
  const answered = Object.keys(AppState.answers).length;
  const pct      = (answered / total) * 100;

  const progressText       = document.getElementById('progressText');
  const progressBar        = document.getElementById('progressBar');
  const submitProgressText = document.getElementById('submitProgressText');

  if (progressText)       progressText.textContent       = `${answered} / ${total} câu đã chọn`;
  if (submitProgressText) submitProgressText.textContent  = `${answered} / ${total} câu`;
  if (progressBar)        progressBar.style.width         = pct + '%';
}

/** Show a confirm dialog then submit (or auto-submit when time's up). */
function _confirmAndSubmit(total, force = false) {
  const answered = Object.keys(AppState.answers).length;
  const unanswered = total - answered;

  if (!force && unanswered > 0) {
    const ok = confirm(
      `Bạn còn ${unanswered} câu chưa trả lời.\n\nBạn có chắc muốn nộp bài không?`
    );
    if (!ok) return;
  }

  // Stop the timer
  if (AppState.timer) AppState.timer.stop();

  navigate('result');
}

/** Initialise and start the countdown timer. */
function _startExamTimer() {
  const display = document.getElementById('timerDisplay');
  const total   = AppState.questions.length;

  AppState.timer = new CountdownTimer(
    AppState.duration,
    // onTick
    (remaining, formatted) => {
      if (!display) return;
      display.textContent = formatted;

      // Turn red & pulsing when < 60 seconds
      if (remaining <= 60) {
        display.classList.add('timer-danger');
      } else {
        display.classList.remove('timer-danger');
      }
    },
    // onEnd — auto-submit
    () => {
      showToast('⏰ Hết giờ! Đang nộp bài tự động...', 'info');
      setTimeout(() => _confirmAndSubmit(total, true), 1200);
    }
  );

  AppState.timer.start();
}

/** Simple MM:SS formatter (also used for header initial render). */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Escape HTML to prevent XSS from file content. */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
