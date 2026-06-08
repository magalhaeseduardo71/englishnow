import { renderCategoryHeader } from '../ui.js';

export function render(word, onAnswer) {
  const area = document.getElementById('exercise-area');
  area.innerHTML = `
    ${renderCategoryHeader(word)}
    <div style="font-size:15px;color:var(--color-text-secondary);margin-bottom:var(--space-md)">Traduza para inglês:</div>
    <div class="translate-pt">"${word.example_sentence_pt || word.portuguese}"</div>
    <textarea class="translate-textarea" id="tr-input" placeholder="Digite sua tradução em inglês..." rows="3"></textarea>
    <div class="translate-ideal" id="tr-ideal">✓ Resposta ideal: <em>${word.example_sentence_en || word.english}</em></div>
    <button class="btn-submit" id="tr-submit">Verificar</button>`;

  const input = document.getElementById('tr-input');
  const idealEl = document.getElementById('tr-ideal');
  const submitBtn = document.getElementById('tr-submit');
  let answered = false;

  setTimeout(() => input.focus(), 100);

  submitBtn.addEventListener('click', () => {
    if (answered) { onAnswer(answered === 'correct'); return; }
    const val = input.value.trim();
    if (!val) return;
    const isOk = checkTranslation(val, word);
    answered = isOk ? 'correct' : 'wrong';
    idealEl.classList.add('visible');
    input.style.borderColor = isOk ? 'var(--color-success)' : 'var(--color-error)';
    submitBtn.textContent = 'Próxima →';
    submitBtn.style.background = isOk ? 'var(--gradient-accent)' : 'rgba(255,77,109,0.2)';
    if (!isOk) submitBtn.style.color = 'var(--color-error)';
    setTimeout(() => onAnswer(isOk), 1500);
  });
}

function checkTranslation(userInput, word) {
  const ideal = word.example_sentence_en || word.english;
  const normalizedUser = normalize(userInput);
  const normalizedIdeal = normalize(ideal);
  if (normalizedUser === normalizedIdeal) return true;
  // keyword check: main word must be present
  const mainWord = normalize(word.english);
  if (!normalizedUser.includes(mainWord)) return false;
  // at least 50% keyword overlap
  const idealWords = normalizedIdeal.split(' ').filter(w => w.length > 3);
  const userWords = normalizedUser.split(' ');
  const hits = idealWords.filter(w => userWords.some(u => u.includes(w) || w.includes(u)));
  return hits.length / idealWords.length >= 0.5;
}

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}
