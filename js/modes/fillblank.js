import { renderCategoryHeader } from '../ui.js';

export function render(word, onAnswer) {
  const sentence = word.example_sentence_en || `Enter your ${word.english} to continue.`;
  const display = sentence.replace(new RegExp(word.english, 'gi'), '______');

  const area = document.getElementById('exercise-area');
  area.innerHTML = `
    ${renderCategoryHeader(word)}
    <div style="margin-bottom:var(--space-md);font-size:15px;color:var(--color-text-secondary);text-align:center">Complete a frase:</div>
    <div class="fillblank-sentence">${escapeHtml(display)}</div>
    <div style="font-size:13px;color:var(--color-text-muted);text-align:center;margin-bottom:var(--space-md)">${word.portuguese}</div>
    <input class="fillblank-input" id="fb-input" type="text" placeholder="Digite em inglês..." autocomplete="off" autocorrect="off" spellcheck="false">
    <div class="fillblank-feedback" id="fb-feedback"></div>
    <button class="btn-submit" id="fb-submit">Confirmar</button>`;

  const input = document.getElementById('fb-input');
  const submitBtn = document.getElementById('fb-submit');
  let answered = false;

  setTimeout(() => input.focus(), 100);

  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !answered) check(); });
  submitBtn.addEventListener('click', () => { if (!answered) check(); else onAnswer(answered === 'correct'); });

  function check() {
    const val = input.value.trim().toLowerCase();
    const correct = word.english.toLowerCase();
    const isOk = val === correct || val.replace(/[^a-z]/g, '') === correct.replace(/[^a-z]/g, '');
    answered = isOk ? 'correct' : 'wrong';
    input.classList.add(isOk ? 'correct' : 'wrong');
    const fb = document.getElementById('fb-feedback');
    fb.textContent = isOk ? '✓ Correto!' : `✗ Resposta: ${word.english}`;
    fb.className = `fillblank-feedback ${isOk ? 'correct' : 'wrong'}`;
    submitBtn.textContent = 'Próxima →';
    if (!isOk) setTimeout(() => onAnswer(false), 1500);
    else setTimeout(() => onAnswer(true), 800);
  }
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
