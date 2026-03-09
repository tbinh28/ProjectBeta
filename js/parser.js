/* ================================================================
   PARSER.JS — File extraction + Question & Answer-Key parsing
   Supports: .docx (via mammoth.js), .pdf (via pdf.js)
================================================================ */

// Set up PDF.js worker (loaded globally via CDN script tag in index.html)
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXT EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract raw text from a .docx File object using mammoth.js.
 * @param {File} file
 * @returns {Promise<string>}
 */
async function extractFromDocx(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
        resolve(result.value || '');
      } catch (err) {
        reject(new Error('Không thể đọc file .docx: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Không thể đọc file.'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extract raw text from a .pdf File object using pdf.js.
 * Joins text items per page with spaces; pages separated by newlines.
 * @param {File} file
 * @returns {Promise<string>}
 */
async function extractFromPdf(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const typedArray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

        let fullText = '';
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          // Items can be fragmented — join with space, use transform Y to detect newlines
          let pageText = '';
          let lastY = null;
          for (const item of content.items) {
            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
              pageText += '\n';
            }
            pageText += item.str;
            if (item.hasEOL) pageText += '\n';
            else pageText += ' ';
            lastY = item.transform[5];
          }
          fullText += pageText + '\n';
        }
        resolve(fullText);
      } catch (err) {
        reject(new Error('Không thể đọc file .pdf: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Không thể đọc file.'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Dispatcher — choose extractor based on file extension.
 * @param {File} file
 * @returns {Promise<string>}
 */
async function extractText(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'docx') return extractFromDocx(file);
  if (ext === 'pdf')  return extractFromPdf(file);
  throw new Error('Chỉ hỗ trợ file .docx và .pdf');
}


// ─────────────────────────────────────────────────────────────────────────────
// QUESTION PARSING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalize extracted text:
 *  - Unify line endings
 *  - Collapse multiple spaces (but keep newlines)
 *  - Fix garbled option prefixes common in PDF extraction (e.g. "A .word" → "A. word")
 */
function normalizeText(text) {
  return text
    .replace(/\r\n|\r/g, '\n')          // unify line endings
    .replace(/\t/g, ' ')                 // tabs → spaces
    .replace(/[ ]{2,}/g, ' ')            // multiple spaces → single
    .replace(/([ABCD])\s+\.\s*/g, '$1. ') // "A . text" → "A. text"
    .replace(/([ABCD])\)\s*/g, '$1. ')   // "A) text"  → "A. text"
    .trim();
}

/**
 * Find all question-start positions using regex.
 * Supports:
 *  - "Câu 1:"  / "Câu 1."
 *  - "Question 1:" / "Question 1."
 *  - "1." / "1)" at the start of a line (fallback)
 *
 * Returns array of { index, id }
 */
function findQuestionStarts(text) {
  const results = [];

  // Primary: "Câu N" or "Question N" patterns
  const primaryRegex = /(?:^|[\n])[ \t]*(?:Câu|Question)\s+(\d+)\s*[:.]/gi;
  let m;
  while ((m = primaryRegex.exec(text)) !== null) {
    // Advance past the matched prefix to get content start
    results.push({ index: m.index + m[0].length, id: parseInt(m[1], 10) });
  }

  // Fallback: numbered lines "1." or "1)" if primary found nothing
  if (results.length === 0) {
    const fallbackRegex = /(?:^|\n)[ \t]*(\d{1,3})[.)]\s+/gm;
    while ((m = fallbackRegex.exec(text)) !== null) {
      results.push({ index: m.index + m[0].length, id: parseInt(m[1], 10) });
    }
  }

  // Sort by position (should already be, but just in case)
  results.sort((a, b) => a.index - b.index);
  return results;
}

/**
 * Extract options A, B, C, D from a question chunk.
 * Handles options separated by newlines OR inline (mangled PDF).
 *
 * @param {string} chunk  — text after the question number/prefix
 * @returns {{ content: string, options: Object }}
 */
function extractOptionsFromChunk(chunk) {
  // Find all A./B./C./D. positions  (also handles A:  B:)
  const optRegex = /(?:^|[\n ])([ABCD])[.:]\s*/g;
  const positions = [];
  let m;

  while ((m = optRegex.exec(chunk)) !== null) {
    // Only capture ABCD in the expected order
    positions.push({ letter: m[1].toUpperCase(), index: m.index + m[0].length });
  }

  // Need at least A & B to be a valid question
  if (positions.length < 2) {
    return { content: chunk.trim(), options: {} };
  }

  // Question content = text before first option
  const content = chunk.slice(0, positions[0].index - positions[0].letter.length - 2).trim();

  const options = {};
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].index;
    const end   = i + 1 < positions.length ? positions[i + 1].index - 3 : chunk.length;
    options[positions[i].letter] = chunk.slice(start, end).trim();
  }

  return { content, options };
}

/**
 * Main entry point: parse raw text → array of question objects.
 *
 * @param {string} rawText
 * @returns {Array<{ id: number, content: string, options: { A, B, C, D } }>}
 */
function parseQuestions(rawText) {
  const text = normalizeText(rawText);
  const starts = findQuestionStarts(text);

  if (starts.length === 0) return [];

  const questions = [];

  for (let i = 0; i < starts.length; i++) {
    const chunkStart = starts[i].index;
    const chunkEnd   = i + 1 < starts.length ? starts[i + 1].index - 10 : text.length;
    const chunk      = text.slice(chunkStart, chunkEnd);

    const { content, options } = extractOptionsFromChunk(chunk);

    // Skip if content is too short or no options found
    if (!content || Object.keys(options).length < 2) continue;

    questions.push({
      id:      starts[i].id,
      content: content.replace(/\n+/g, ' ').trim(),
      options: {
        A: options.A || '',
        B: options.B || '',
        C: options.C || '',
        D: options.D || '',
      },
    });
  }

  // Ensure IDs are unique (deduplicate by keeping first occurrence)
  const seen = new Set();
  return questions.filter(q => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });
}


// ─────────────────────────────────────────────────────────────────────────────
// ANSWER KEY PARSING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse an answer key string into an object mapping question id → answer letter.
 *
 * Supported formats (mixed):
 *  "1A 2B 3C 4D"
 *  "1. A  2. B  3. C"
 *  "1-A 2-B 3-C"
 *  "1: A\n2: B\n3: C"
 *  "Câu 1: A Câu 2: B"
 *
 * @param {string} keyText
 * @returns {Object<number, string>}  e.g. { 1: 'A', 2: 'B' }
 */
function parseAnswerKey(keyText) {
  const key = {};
  if (!keyText || !keyText.trim()) return key;

  // Match patterns like: "1A", "1. A", "1-A", "1: A", "Câu 1: A", "Question 1: A"
  const pattern = /(?:(?:Câu|Question)\s+)?(\d+)\s*[-.:)]\s*([ABCD])/gi;
  let m;
  while ((m = pattern.exec(keyText)) !== null) {
    key[parseInt(m[1], 10)] = m[2].toUpperCase();
  }
  return key;
}
