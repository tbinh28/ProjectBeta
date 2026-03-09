/* ================================================================
   RESULT.JS — Result / Review Screen
================================================================ */

/** Render the result screen. */
function renderResult() {
  const { questions, answers, answerKey } = AppState;
  const total     = questions.length;
  const hasKey    = Object.keys(answerKey).length > 0;
  const answered  = Object.keys(answers).length;

  // ── Scoring ──
  let correct = 0;
  let wrong   = 0;
  if (hasKey) {
    questions.forEach(q => {
      const userAns = answers[q.id];
      const keyAns  = answerKey[q.id];
      if (!userAns) return; // unanswered
      if (keyAns && userAns === keyAns) correct++;
      else if (keyAns) wrong++;
    });
  }
  const unanswered = total - answered;
  const score      = hasKey ? correct : null;
  const pct        = hasKey ? Math.round((correct / total) * 100) : null;

  // ── Score ring circumference ──
  const radius    = 54;
  const circ      = Math.round(2 * Math.PI * radius);
  const fillDash  = hasKey ? Math.round((correct / total) * circ) : 0;
  const ringColor = pct >= 80 ? '#059669' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const ringLabel = pct >= 80 ? '🎉 Xuất sắc!' : pct >= 50 ? '👍 Khá tốt' : '📚 Cần ôn thêm';

  document.getElementById('app').innerHTML = `
    <div class="min-h-screen bg-surface animate-fadeIn">

      <!-- ══ HEADER ═════════════════════════════════════════════ -->
      <div class="bg-brand-900 text-white px-4 pt-10 pb-16">
        <div class="max-w-2xl mx-auto text-center">
          <p class="text-brand-300 text-sm font-500 mb-1 uppercase tracking-widest">Kết quả</p>
          <h1 class="font-outfit font-800 text-2xl text-white">Bài thi hoàn thành</h1>

          ${hasKey ? `
            <!-- Score ring -->
            <div class="flex justify-center mt-6 mb-2">
              <div class="score-ring">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle class="score-ring-bg" cx="80" cy="80" r="${radius}" />
                  <circle
                    class="score-ring-fill"
                    id="scoreRingFill"
                    cx="80" cy="80" r="${radius}"
                    stroke="${ringColor}"
                    stroke-dasharray="${circ}"
                    stroke-dashoffset="${circ}"
                  />
                </svg>
                <div class="score-ring-label">
                  <span class="font-outfit font-900 text-4xl text-white leading-none">${correct}</span>
                  <span class="text-brand-300 text-sm mt-0.5">/ ${total}</span>
                </div>
              </div>
            </div>
            <p class="text-brand-200 text-sm">${ringLabel} · ${pct}% đúng</p>
          ` : `
            <div class="mt-6">
              <div class="inline-flex items-center gap-2 bg-brand-800 rounded-full px-5 py-2 text-white font-outfit font-700 text-2xl">
                ${answered}<span class="text-brand-400 font-400 text-base ml-1">/ ${total} câu đã trả lời</span>
              </div>
              <p class="text-brand-300 text-sm mt-2">Chưa có đáp án — xem danh sách để tự dò</p>
            </div>
          `}
        </div>
      </div>

      <!-- ══ STATS PILLS ════════════════════════════════════════ -->
      <div class="max-w-2xl mx-auto px-4 -mt-6">
        <div class="bg-white rounded-2xl shadow-lg shadow-brand-900/8 border border-brand-50 p-4">
          <div class="grid grid-cols-3 divide-x divide-slate-100">
            ${hasKey ? `
              <div class="text-center px-2">
                <p class="font-outfit font-800 text-2xl text-emerald-600">${correct}</p>
                <p class="text-xs text-slate-500 mt-0.5">Đúng</p>
              </div>
              <div class="text-center px-2">
                <p class="font-outfit font-800 text-2xl text-red-500">${wrong}</p>
                <p class="text-xs text-slate-500 mt-0.5">Sai</p>
              </div>
              <div class="text-center px-2">
                <p class="font-outfit font-800 text-2xl text-slate-400">${unanswered}</p>
                <p class="text-xs text-slate-500 mt-0.5">Bỏ qua</p>
              </div>
            ` : `
              <div class="text-center px-2">
                <p class="font-outfit font-800 text-2xl text-brand-600">${answered}</p>
                <p class="text-xs text-slate-500 mt-0.5">Đã chọn</p>
              </div>
              <div class="text-center px-2">
                <p class="font-outfit font-800 text-2xl text-slate-400">${unanswered}</p>
                <p class="text-xs text-slate-500 mt-0.5">Bỏ qua</p>
              </div>
              <div class="text-center px-2">
                <p class="font-outfit font-800 text-2xl text-slate-700">${total}</p>
                <p class="text-xs text-slate-500 mt-0.5">Tổng</p>
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- ══ REVIEW LIST ════════════════════════════════════════ -->
      <div class="max-w-2xl mx-auto px-4 mt-6 pb-10 space-y-4">

        <div class="flex items-center justify-between mb-2">
          <h2 class="font-outfit font-700 text-lg text-slate-800">Chi tiết từng câu</h2>
          ${hasKey ? `
            <div class="flex items-center gap-3 text-xs text-slate-500">
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>Đúng</span>
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>Sai</span>
            </div>
          ` : ''}
        </div>

        ${questions.map(q => renderResultCard(q, answers[q.id], answerKey[q.id], hasKey)).join('')}

        <!-- Redo button -->
        <div class="pt-4 flex flex-col sm:flex-row gap-3">
          <button id="retryBtn" class="btn-primary flex-1">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
            Làm lại bài này
          </button>
          <button id="newExamBtn" class="btn-ghost flex-1">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 109-9H3"/><polyline points="3 3 3 9 9 9"/>
            </svg>
            Thi đề mới
          </button>
        </div>

      </div>
    </div>
  `;

  _bindResultEvents();
  _animateScoreRing(circ, fillDash);
}


/** Render a single result card. */
function renderResultCard(q, userAnswer, keyAnswer, hasKey) {
  const letters = ['A', 'B', 'C', 'D'];

  // Determine card status
  let cardBadge = '';
  if (hasKey && keyAnswer) {
    if (!userAnswer) {
      cardBadge = `<span class="px-2 py-0.5 rounded-full text-xs font-600 bg-slate-100 text-slate-500">Bỏ qua</span>`;
    } else if (userAnswer === keyAnswer) {
      cardBadge = `<span class="px-2 py-0.5 rounded-full text-xs font-600 bg-emerald-100 text-emerald-700">✓ Đúng</span>`;
    } else {
      cardBadge = `<span class="px-2 py-0.5 rounded-full text-xs font-600 bg-red-100 text-red-600">✗ Sai</span>`;
    }
  } else if (!hasKey && userAnswer) {
    cardBadge = `<span class="px-2 py-0.5 rounded-full text-xs font-600 bg-brand-100 text-brand-700">Đáp án: ${userAnswer}</span>`;
  } else if (!hasKey && !userAnswer) {
    cardBadge = `<span class="px-2 py-0.5 rounded-full text-xs font-600 bg-slate-100 text-slate-500">Bỏ qua</span>`;
  }

  const optionsHTML = letters.map(letter => {
    const text = q.options[letter];
    if (!text) return '';

    let classes = 'option-block';
    if (hasKey && keyAnswer) {
      if (letter === keyAnswer)                      classes += ' correct';     // correct answer (always show)
      else if (letter === userAnswer && userAnswer !== keyAnswer) classes += ' wrong'; // user's wrong pick
    } else {
      if (letter === userAnswer) classes += ' selected'; // just highlight what user chose
    }

    return `
      <div class="${classes}" style="cursor:default; pointer-events:none;">
        <span class="option-letter">${letter}</span>
        <span class="option-text">${escapeHtml(text)}</span>
        ${(hasKey && letter === keyAnswer && userAnswer !== keyAnswer)
          ? `<span class="ml-auto text-emerald-600 text-xs font-600 flex-shrink-0">✓ Đáp án</span>`
          : ''}
      </div>
    `;
  }).join('');

  // Card border color
  let cardBorder = 'border-slate-100';
  if (hasKey && keyAnswer) {
    if (!userAnswer) cardBorder = 'border-slate-200';
    else if (userAnswer === keyAnswer) cardBorder = 'border-emerald-200';
    else cardBorder = 'border-red-200';
  }

  return `
    <div class="question-card bg-white rounded-2xl shadow-sm border ${cardBorder} overflow-hidden">
      <div class="flex items-start gap-3 px-5 pt-5 pb-3">
        <span class="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-600 text-white
                     font-outfit font-700 text-sm flex items-center justify-center">
          ${q.id}
        </span>
        <div class="flex-1 min-w-0">
          <p class="text-slate-800 font-500 text-[15px] leading-relaxed">${escapeHtml(q.content)}</p>
        </div>
        <div class="flex-shrink-0">${cardBadge}</div>
      </div>
      <div class="px-5 pb-5 space-y-2">
        ${optionsHTML}
      </div>
    </div>
  `;
}


/** Animate the score ring from 0 to filled. */
function _animateScoreRing(circ, fillDash) {
  requestAnimationFrame(() => {
    const ring = document.getElementById('scoreRingFill');
    if (!ring) return;
    setTimeout(() => {
      ring.style.strokeDashoffset = circ - fillDash;
    }, 200);
  });
}


/** Bind retry / new exam buttons. */
function _bindResultEvents() {
  document.getElementById('retryBtn')?.addEventListener('click', () => {
    // Reset answers and go back to exam with same questions
    AppState.answers = {};
    navigate('exam');
  });

  document.getElementById('newExamBtn')?.addEventListener('click', () => {
    // Full reset
    AppState.questions    = [];
    AppState.answers      = {};
    AppState.answerKey    = {};
    AppState.selectedFile = null;
    if (AppState.timer) AppState.timer.stop();
    navigate('setup');
  });
}
