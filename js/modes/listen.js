import { speak, renderCategoryHeader } from '../ui.js';

export function render(word, allWords, onAnswer) {
  const pool = allWords.filter(w => w.id !== word.id && w.category === word.category);
  const distractors = shuffle(pool).slice(0, 3).map(w => w.english);
  const options = shuffle([word.english, ...distractors]);

  const area = document.getElementById('exercise-area');
  area.innerHTML = `
    ${renderCategoryHeader(word)}
    <div style="text-align:center;font-size:16px;color:var(--color-text-secondary);margin:var(--space-md) 0">O que você ouviu?</div>
    <div style="display:flex;justify-content:center">
      <button class="listen-play-btn" id="listen-play">🔊</button>
    </div>
    <div style="font-size:13px;color:var(--color-text-muted);text-align:center;margin:var(--space-md) 0">Toque para ouvir novamente</div>
    <div class="listen-options" id="listen-options">
      ${options.map(opt => `<button class="listen-option" data-val="${escOpt(opt)}">${opt}</button>`).join('')}
    </div>`;

  speak(word.english);

  document.getElementById('listen-play').addEventListener('click', () => speak(word.english));

  let answered = false;
  document.getElementById('listen-options').addEventListener('click', e => {
    const btn = e.target.closest('.listen-option');
    if (!btn || answered) return;
    answered = true;
    const chosen = btn.dataset.val;
    const isOk = chosen === word.english;
    btn.classList.add(isOk ? 'selected-correct' : 'selected-wrong');
    if (!isOk) {
      document.querySelectorAll('.listen-option').forEach(b => {
        if (b.dataset.val === word.english) b.classList.add('reveal-correct');
      });
    }
    setTimeout(() => onAnswer(isOk), 1200);
  });
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escOpt(s) {
  return s.replace(/"/g, '&quot;');
}
