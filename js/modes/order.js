import { renderCategoryHeader } from '../ui.js';

export function render(word, onAnswer) {
  const sentence = word.example_sentence_en || word.english;
  const words = sentence.split(/\s+/);
  const shuffled = shuffle([...words]);

  const area = document.getElementById('exercise-area');
  area.innerHTML = `
    ${renderCategoryHeader(word)}
    <div style="font-size:15px;color:var(--color-text-secondary);margin-bottom:var(--space-sm)">Monte a frase em inglês:</div>
    <div style="font-family:var(--font-display);font-size:20px;font-weight:600;margin-bottom:var(--space-lg)">"${word.example_sentence_pt || word.portuguese}"</div>
    <div class="order-target" id="order-target"></div>
    <div class="word-chips" id="word-chips">
      ${shuffled.map((w, i) => `<div class="word-chip" data-idx="${i}" data-word="${escW(w)}">${w}</div>`).join('')}
    </div>
    <div style="display:flex;gap:8px;margin-top:auto">
      <button class="btn-next" id="order-clear" style="flex:0 0 auto;padding:0 20px">↺</button>
      <button class="btn-submit" id="order-submit" style="flex:1">Verificar</button>
    </div>`;

  const target = document.getElementById('order-target');
  const chipsEl = document.getElementById('word-chips');
  const chosen = [];

  chipsEl.addEventListener('click', e => {
    const chip = e.target.closest('.word-chip');
    if (!chip || chip.classList.contains('used')) return;
    chip.classList.add('used');
    chosen.push({ word: chip.dataset.word, idx: chip.dataset.idx });
    renderTarget();
    target.classList.add('has-words');
  });

  target.addEventListener('click', e => {
    const chip = e.target.closest('.word-chip');
    if (!chip) return;
    const i = chosen.findIndex(c => c.idx === chip.dataset.idx);
    if (i === -1) return;
    chosen.splice(i, 1);
    chip.remove();
    const orig = chipsEl.querySelector(`[data-idx="${chip.dataset.idx}"]`);
    if (orig) orig.classList.remove('used');
    if (!chosen.length) target.classList.remove('has-words');
  });

  document.getElementById('order-clear').addEventListener('click', () => {
    chosen.length = 0;
    target.innerHTML = '';
    target.classList.remove('has-words');
    chipsEl.querySelectorAll('.word-chip').forEach(c => c.classList.remove('used'));
  });

  document.getElementById('order-submit').addEventListener('click', () => {
    const answer = chosen.map(c => c.word).join(' ');
    const correct = sentence;
    const isOk = normalize(answer) === normalize(correct);
    if (!isOk) {
      target.style.borderColor = 'var(--color-error)';
      setTimeout(() => {
        target.style.borderColor = '';
        onAnswer(false);
      }, 1200);
    } else {
      target.style.borderColor = 'var(--color-success)';
      setTimeout(() => onAnswer(true), 800);
    }
  });

  function renderTarget() {
    target.innerHTML = chosen.map(c =>
      `<div class="word-chip in-target" data-idx="${c.idx}" data-word="${escW(c.word)}">${c.word}</div>`
    ).join('');
  }
}

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escW(s) { return s.replace(/"/g, '&quot;'); }
