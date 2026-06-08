import { selectSessionWords, updateProgress, calcXP, calcSessionBonus, addXPAndUpdateStreak } from './engine.js';
import { insertSession, countDueWords, getAllWords } from './db.js';
import { showScreen, showToast } from './ui.js';
import { renderProgressScreen, renderHomeProgress } from './progress.js';
import { render as renderFlashcard } from './modes/flashcard.js';
import { render as renderFillblank } from './modes/fillblank.js';
import { render as renderListen } from './modes/listen.js';
import { render as renderOrder } from './modes/order.js';
import { render as renderTranslate } from './modes/translate.js';

// ---- Guard: redirect to login if needed ----
// (auth.js handles login; app.js assumes user is authenticated)

let session = { mode: '', words: [], idx: 0, correct: 0, wrong: 0, xp: 0, startTime: 0 };
let allWords = [];

// ---- INIT ----
(async () => {
  allWords = await getAllWords();
  await renderHomeProgress();

  const dueCount = await countDueWords();
  const reviewSection = document.getElementById('review-section');
  const reviewCountEl = document.getElementById('review-count');
  if (dueCount > 0) {
    reviewSection.style.display = 'block';
    reviewCountEl.textContent = dueCount;
  }

  bindHomeEvents();
  bindSessionEvents();
  bindResultEvents();
  bindProgressEvents();
})();

// ---- HOME ----
function bindHomeEvents() {
  document.querySelectorAll('.mode-card[data-mode]').forEach(card => {
    card.addEventListener('click', () => startSession(card.dataset.mode));
  });

  document.getElementById('btn-start-review')?.addEventListener('click', () => startSession('flashcard'));
  document.getElementById('btn-progress-nav')?.addEventListener('click', openProgress);
  document.getElementById('btn-progress-full')?.addEventListener('click', openProgress);
}

async function openProgress() {
  showScreen('progress');
  await renderProgressScreen();
}

// ---- SESSION ----
async function startSession(mode) {
  const words = await selectSessionWords(10);
  if (!words.length) { showToast('Nenhuma palavra disponível!', 'error'); return; }

  session = { mode, words, idx: 0, correct: 0, wrong: 0, xp: 0, startTime: Date.now() };
  updateSessionHeader();
  showScreen('session');
  renderQuestion();
}

function updateSessionHeader() {
  const total = session.words.length;
  const pct = (session.idx / total) * 100;
  document.getElementById('session-progress-fill').style.width = `${pct}%`;
  document.getElementById('q-current').textContent = session.idx + 1;
  document.getElementById('q-total').textContent = total;
}

function renderQuestion() {
  if (session.idx >= session.words.length) { finishSession(); return; }
  const word = session.words[session.idx];
  updateSessionHeader();

  switch (session.mode) {
    case 'flashcard': renderFlashcard(word, onAnswer); break;
    case 'fillblank': renderFillblank(word, onAnswer); break;
    case 'listen':    renderListen(word, allWords, onAnswer); break;
    case 'order':     renderOrder(word, onAnswer); break;
    case 'translate': renderTranslate(word, onAnswer); break;
    default:          renderFlashcard(word, onAnswer);
  }
}

async function onAnswer(wasCorrect) {
  const word = session.words[session.idx];
  const firstTry = true;
  const xp = calcXP(wasCorrect, firstTry, 0);

  if (wasCorrect) {
    session.correct++;
    session.xp += xp;
    if (navigator.vibrate) navigator.vibrate(40);
  } else {
    session.wrong++;
    if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
  }

  await updateProgress(word.id, wasCorrect);
  session.idx++;
  renderQuestion();
}

async function finishSession() {
  const duration = Math.round((Date.now() - session.startTime) / 1000);
  const bonus = calcSessionBonus(session.correct, session.words.length, 0);
  const totalXP = session.xp + bonus;

  await insertSession({
    mode: session.mode,
    total_questions: session.words.length,
    correct_answers: session.correct,
    duration_seconds: duration,
    xp_earned: totalXP
  });

  const streak = await addXPAndUpdateStreak(totalXP);

  const pct = session.correct / session.words.length;
  document.getElementById('result-emoji').textContent = pct >= 0.8 ? '🎉' : pct >= 0.5 ? '💪' : '📚';
  document.getElementById('result-title').textContent = pct >= 0.8 ? 'Excelente!' : pct >= 0.5 ? 'Bom trabalho!' : 'Continue praticando!';
  document.getElementById('result-correct').textContent = session.correct;
  document.getElementById('result-wrong').textContent = session.wrong;
  document.getElementById('result-time').textContent = `${duration}s`;
  document.getElementById('result-xp').textContent = totalXP;

  showScreen('result');
}

// ---- SESSION EVENTS ----
function bindSessionEvents() {
  document.getElementById('btn-session-back')?.addEventListener('click', () => {
    showScreen('home');
    renderHomeProgress();
  });
}

// ---- RESULT EVENTS ----
function bindResultEvents() {
  document.getElementById('btn-play-again')?.addEventListener('click', () => startSession(session.mode));
  document.getElementById('btn-go-home')?.addEventListener('click', async () => {
    showScreen('home');
    await renderHomeProgress();
    const due = await countDueWords();
    const reviewSection = document.getElementById('review-section');
    const reviewCountEl = document.getElementById('review-count');
    if (due > 0) {
      reviewSection.style.display = 'block';
      reviewCountEl.textContent = due;
    } else {
      reviewSection.style.display = 'none';
    }
  });
}

// ---- PROGRESS EVENTS ----
function bindProgressEvents() {
  document.getElementById('btn-back-from-progress')?.addEventListener('click', () => showScreen('home'));
}
