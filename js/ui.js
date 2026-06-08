export function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`screen-${id}`);
  if (target) target.classList.add('active');
}

export function showToast(msg, type = 'success') {
  const toast = document.getElementById('feedback-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `feedback-toast ${type} visible`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('visible'), 2000);
}

export function speak(text, lang = 'en-US') {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
  utt.rate = 0.85;
  speechSynthesis.speak(utt);
}

export function diffBadgeClass(difficulty) {
  if (difficulty === 2) return 'medium';
  if (difficulty >= 3) return 'hard';
  return '';
}

export function categoryLabel(cat) {
  const map = { computer: '💻 Computador', self_service: '🏧 Autoatendimento', daily: '📅 Dia a Dia', conversation: '💬 Conversação', tech: '📱 Tecnologia' };
  return map[cat] || cat;
}

export function renderCategoryHeader(word) {
  return `<div class="card-category"><span class="diff-badge ${diffBadgeClass(word.difficulty)}"></span>${categoryLabel(word.category)}</div>`;
}
