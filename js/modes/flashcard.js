import { speak, renderCategoryHeader } from '../ui.js';

export function render(word, onAnswer) {
  const area = document.getElementById('exercise-area');
  area.innerHTML = `
    ${renderCategoryHeader(word)}
    <div class="flashcard-scene" id="fc-scene">
      <div class="flashcard" id="fc">
        <div class="flashcard-face front">
          <div class="card-word-pt">${word.portuguese}</div>
          ${word.example_sentence_pt ? `<div class="card-example">"${word.example_sentence_pt}"</div>` : ''}
          <button class="card-show-btn" id="fc-show">Mostrar resposta</button>
        </div>
        <div class="flashcard-face back">
          <div class="card-word-pt" style="font-size:18px;color:var(--color-text-secondary)">${word.portuguese}</div>
          <div class="card-word-en">${word.english}</div>
          ${word.audio_hint ? `<div class="card-example">${word.audio_hint}</div>` : ''}
          ${word.example_sentence_en ? `<div class="card-example">"${word.example_sentence_en}"</div>` : ''}
          <button class="card-audio-btn" id="fc-audio">🔊 Ouvir</button>
        </div>
      </div>
    </div>
    <div class="judgment-btns" id="fc-btns" style="display:none">
      <button class="btn-wrong" id="fc-wrong">✗ Errei</button>
      <button class="btn-correct" id="fc-correct">✓ Acertei</button>
    </div>`;

  document.getElementById('fc-show').addEventListener('click', () => {
    document.getElementById('fc').classList.add('flipped');
    document.getElementById('fc-btns').style.display = 'grid';
    speak(word.english);
  });

  document.getElementById('fc-audio').addEventListener('click', e => {
    e.stopPropagation();
    speak(word.english);
  });

  document.getElementById('fc-scene').addEventListener('click', () => {
    const fc = document.getElementById('fc');
    if (!fc.classList.contains('flipped')) return;
  });

  document.getElementById('fc-wrong').addEventListener('click', () => onAnswer(false));
  document.getElementById('fc-correct').addEventListener('click', () => onAnswer(true));
}
