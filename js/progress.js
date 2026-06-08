import { getAllProgress, getAllWords, getConfig, getSessionsLast7Days, getRecentSessions } from './db.js';

const XP_PER_LEVEL = 500;

export async function renderProgressScreen() {
  const [allProgress, allWords, config, sessions7, recentSessions] = await Promise.all([
    getAllProgress(), getAllWords(), getConfig(), getSessionsLast7Days(), getRecentSessions(6)
  ]);

  const totalXP = config?.total_xp || 0;
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const xpInLevel = totalXP % XP_PER_LEVEL;
  const streak = config?.current_streak_days || 0;
  const mastered = allProgress.filter(p => p.mastered).length;

  document.getElementById('stat-total-xp').textContent = totalXP;
  document.getElementById('stat-level').textContent = level;
  document.getElementById('stat-mastered').textContent = mastered;
  document.getElementById('stat-streak').textContent = streak;
  document.getElementById('level-label').textContent = `Nível ${level}`;
  document.getElementById('level-xp-text').textContent = `${xpInLevel} / ${XP_PER_LEVEL} XP`;
  document.getElementById('level-bar').style.width = `${(xpInLevel / XP_PER_LEVEL) * 100}%`;

  // 7-day chart
  renderChart(sessions7);

  // Category breakdown
  const categories = ['computer', 'self_service', 'daily', 'conversation', 'tech'];
  const progressMap = Object.fromEntries(allProgress.map(p => [p.word_id, p]));
  const wordsByCat = {};
  categories.forEach(c => { wordsByCat[c] = allWords.filter(w => w.category === c); });

  const catNames = { computer: '💻 Computador', self_service: '🏧 Autoatendimento', daily: '📅 Dia a Dia', conversation: '💬 Conversação', tech: '📱 Tecnologia' };
  const catList = document.getElementById('category-list');
  catList.innerHTML = categories.map(cat => {
    const words = wordsByCat[cat];
    const done = words.filter(w => progressMap[w.id]?.mastered).length;
    const pct = words.length ? Math.round((done / words.length) * 100) : 0;
    return `
      <div class="category-row">
        <div class="category-row-header">
          <div class="category-row-name">${catNames[cat]}</div>
          <div class="category-row-count">${done}/${words.length} dominadas</div>
        </div>
        <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
      </div>`;
  }).join('');

  // Recent sessions
  const modeNames = { flashcard: '🃏 Flashcard', fillblank: '✏️ Lacuna', listen: '🔊 Escutar', order: '🔀 Ordenar', translate: '🌐 Traduzir' };
  const sl = document.getElementById('session-list');
  sl.innerHTML = recentSessions.length ? recentSessions.map(s => {
    const date = new Date(s.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    return `
      <div class="session-item">
        <div>
          <div class="session-item-mode">${modeNames[s.mode] || s.mode}</div>
          <div class="session-item-date">${date} · ${s.correct_answers}/${s.total_questions} corretas</div>
        </div>
        <div class="session-item-xp">+${s.xp_earned} XP</div>
      </div>`;
  }).join('') : '<div style="color:var(--color-text-muted);font-size:14px;padding:16px">Nenhuma sessão ainda.</div>';
}

function renderChart(sessions) {
  const container = document.getElementById('chart-bars');
  if (!container) return;
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push({ label: d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3), dateStr: d.toDateString() });
  }
  const countsByDay = {};
  sessions.forEach(s => {
    const key = new Date(s.created_at).toDateString();
    countsByDay[key] = (countsByDay[key] || 0) + s.correct_answers;
  });
  const max = Math.max(1, ...days.map(d => countsByDay[d.dateStr] || 0));
  container.innerHTML = days.map(d => {
    const val = countsByDay[d.dateStr] || 0;
    const pct = Math.max(4, (val / max) * 100);
    return `<div class="chart-bar-wrap"><div class="chart-bar" style="height:${pct}%"></div><div class="chart-bar-day">${d.label}</div></div>`;
  }).join('');
}

export async function renderHomeProgress() {
  const config = await getConfig();
  if (!config) return;
  const goal = config.daily_goal || 10;
  const streak = config.current_streak_days || 0;
  const today = new Date().toDateString();
  const lastDate = config.last_study_date ? new Date(config.last_study_date).toDateString() : null;

  document.getElementById('streak-count').textContent = streak;
  document.getElementById('daily-goal').textContent = goal;

  const sessions = await getSessionsLast7Days();
  const todaySessions = sessions.filter(s => new Date(s.created_at).toDateString() === today);
  const done = todaySessions.reduce((a, s) => a + s.correct_answers, 0);
  const xp = todaySessions.reduce((a, s) => a + s.xp_earned, 0);
  const pct = Math.min(100, (done / goal) * 100);

  document.getElementById('daily-done').textContent = Math.min(done, goal);
  document.getElementById('daily-xp').textContent = xp;
  document.getElementById('daily-progress-bar').style.width = `${pct}%`;
}
