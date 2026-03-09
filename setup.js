/* ================================================================
   SETUP.JS — Setup / Upload Screen
================================================================ */

/** Render the setup screen HTML and inject into #app. */
function renderSetup() {
  document.getElementById('app').innerHTML = `
    <div class="min-h-screen bg-surface flex flex-col items-center justify-center p-4 py-10 animate-fadeIn">

      <!-- ── Logo / Branding ── -->
      <div class="mb-8 text-center">
        <div class="inline-flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <span class="font-outfit font-800 text-2xl text-brand-900 tracking-tight">EnglishQuiz</span>
        </div>
        <p class="text-slate-500 text-sm">Tải đề thi lên và bắt đầu ngay</p>
      </div>

      <!-- ── Main Card ── -->
      <div class="w-full max-w-lg bg-white rounded-2xl shadow-xl shadow-brand-900/5 border border-brand-100 overflow-hidden">

        <!-- Card Header -->
        <div class="bg-brand-900 px-7 py-5">
          <h1 class="font-outfit font-700 text-xl text-white">Thiết lập bài thi</h1>
          <p class="text-brand-200 text-sm mt-0.5">Hỗ trợ file .docx và .pdf</p>
        </div>

        <!-- Card Body -->
        <div class="p-7 space-y-6">

          <!-- ── File Upload Zone ── -->
          <div>
            <label class="block text-sm font-600 text-slate-700 mb-2">
              Đề thi <span class="text-brand-500">*</span>
            </label>
            <div id="uploadZone" class="upload-zone rounded-xl p-6 text-center">
              <input type="file" id="fileInput" accept=".docx,.pdf" class="hidden" />

              <!-- Default state -->
              <div id="uploadDefault">
                <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-brand-50 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p class="text-slate-700 font-500 text-sm">Kéo thả file vào đây</p>
                <p class="text-slate-400 text-xs mt-1">hoặc <span class="text-brand-600 font-600 cursor-pointer hover:underline" id="browseBtn">chọn file từ máy tính</span></p>
                <p class="text-slate-300 text-xs mt-2">.docx · .pdf</p>
              </div>

              <!-- File selected state (hidden initially) -->
              <div id="uploadSelected" class="hidden">
                <div class="w-12 h-12 mx-auto mb-2 rounded-full bg-brand-100 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <p id="selectedFileName" class="text-brand-700 font-600 text-sm truncate max-w-xs mx-auto"></p>
                <p class="text-slate-400 text-xs mt-1 cursor-pointer hover:text-brand-500" id="changeFileBtn">Đổi file khác</p>
              </div>
            </div>
          </div>

          <!-- ── Time Input ── -->
          <div>
            <label for="timeInput" class="block text-sm font-600 text-slate-700 mb-2">
              Thời gian làm bài (phút)
            </label>
            <div class="relative">
              <input
                type="number"
                id="timeInput"
                value="45"
                min="1"
                max="300"
                class="w-full border-2 border-slate-200 rounded-xl px-4 py-3 pr-16 text-slate-800 font-500 text-base
                       focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-500">phút</span>
            </div>
          </div>

          <!-- ── Answer Key (Collapsible) ── -->
          <div>
            <button
              type="button"
              id="toggleKeyBtn"
              class="flex items-center gap-2 text-sm font-600 text-slate-600 hover:text-brand-600 transition-colors"
            >
              <svg id="toggleKeyIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition:transform 0.2s">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              Nhập Key đáp án <span class="text-slate-400 font-400">(tuỳ chọn)</span>
            </button>

            <div id="keySection" class="hidden mt-3">
              <textarea
                id="answerKeyInput"
                rows="4"
                placeholder="Ví dụ: 1A 2B 3C 4D 5A&#10;Hoặc: 1. A  2. B  3. C"
                class="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm font-jakarta
                       focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all
                       resize-none placeholder-slate-300"
              ></textarea>
              <p class="text-xs text-slate-400 mt-1">
                Format: <code class="bg-slate-100 px-1 rounded text-slate-500">1A 2B 3C</code> hoặc
                <code class="bg-slate-100 px-1 rounded text-slate-500">1. A  2. B</code>
              </p>
            </div>
          </div>

          <!-- ── Start Button ── -->
          <button id="startBtn" class="btn-primary w-full text-base mt-2" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Bắt đầu thi
          </button>

        </div>
      </div>

      <!-- Footer -->
      <p class="mt-6 text-slate-400 text-xs">EnglishQuiz v1.0 · Thi trắc nghiệm Tiếng Anh</p>
    </div>
  `;

  _bindSetupEvents();
}


/** Attach all event listeners for the setup screen. */
function _bindSetupEvents() {
  const fileInput      = document.getElementById('fileInput');
  const uploadZone     = document.getElementById('uploadZone');
  const browseBtn      = document.getElementById('browseBtn');
  const changeFileBtn  = document.getElementById('changeFileBtn');
  const uploadDefault  = document.getElementById('uploadDefault');
  const uploadSelected = document.getElementById('uploadSelected');
  const selectedName   = document.getElementById('selectedFileName');
  const startBtn       = document.getElementById('startBtn');
  const timeInput      = document.getElementById('timeInput');
  const toggleKeyBtn   = document.getElementById('toggleKeyBtn');
  const toggleKeyIcon  = document.getElementById('toggleKeyIcon');
  const keySection     = document.getElementById('keySection');
  const answerKeyInput = document.getElementById('answerKeyInput');

  // ── File browse click ──
  browseBtn.addEventListener('click', () => fileInput.click());
  changeFileBtn.addEventListener('click', () => {
    fileInput.value = '';
    AppState.selectedFile = null;
    uploadZone.classList.remove('has-file');
    uploadDefault.classList.remove('hidden');
    uploadSelected.classList.add('hidden');
    startBtn.disabled = true;
  });

  // ── File input change ──
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelected(file);
  });

  // ── Drag and drop ──
  uploadZone.addEventListener('click', (e) => {
    if (e.target === uploadZone || e.target.id === 'uploadDefault') {
      fileInput.click();
    }
  });
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelected(file);
  });

  // ── Toggle answer key ──
  toggleKeyBtn.addEventListener('click', () => {
    const isHidden = keySection.classList.toggle('hidden');
    toggleKeyIcon.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
  });

  // ── Start button ──
  startBtn.addEventListener('click', async () => {
    const minutes = parseInt(timeInput.value, 10);
    if (!minutes || minutes < 1) {
      showToast('Vui lòng nhập thời gian hợp lệ (tối thiểu 1 phút)', 'error');
      return;
    }

    AppState.duration  = minutes * 60;
    AppState.answerKey = parseAnswerKey(answerKeyInput.value || '');

    startBtn.disabled = true;
    startBtn.innerHTML = `
      <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <path d="M21 12a9 9 0 11-6.219-8.56"/>
      </svg>
      Đang xử lý...
    `;

    try {
      const rawText  = await extractText(AppState.selectedFile);
      const questions = parseQuestions(rawText);

      if (!questions || questions.length === 0) {
        throw new Error('Không tìm thấy câu hỏi. Hãy kiểm tra định dạng đề (Câu 1: / Question 1:)');
      }

      AppState.questions = questions;
      AppState.answers   = {};

      navigate('exam');
    } catch (err) {
      showToast(err.message, 'error');
      startBtn.disabled = false;
      startBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        Bắt đầu thi
      `;
    }
  });

  // ── Helper: update UI when file is selected ──
  function handleFileSelected(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['docx', 'pdf'].includes(ext)) {
      showToast('Chỉ hỗ trợ file .docx và .pdf', 'error');
      return;
    }
    AppState.selectedFile = file;
    selectedName.textContent = file.name;
    uploadZone.classList.add('has-file');
    uploadDefault.classList.add('hidden');
    uploadSelected.classList.remove('hidden');
    startBtn.disabled = false;
  }
}
