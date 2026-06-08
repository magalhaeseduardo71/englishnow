import { getDueWords, getNewWords, getAllWords, getProgress, upsertProgress, updateConfig, getConfig } from './db.js';

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function addMinutes(date, mins) {
  return new Date(new Date(date).getTime() + mins * 60000).toISOString();
}

export function calcXP(wasCorrect, firstTry, streakDays) {
  if (!wasCorrect) return 0;
  return firstTry ? 10 : 5;
}

export function calcSessionBonus(correct, total, streakDays) {
  let bonus = 0;
  if (correct === total) bonus += 20;
  if (streakDays > 0) bonus += 15 * Math.min(streakDays, 7);
  return bonus;
}

export async function updateProgress(wordId, wasCorrect) {
  const now = new Date().toISOString();
  const existing = await getProgress(wordId);
  const prog = existing || {
    word_id: wordId,
    correct_count: 0,
    wrong_count: 0,
    streak: 0,
    ease_factor: 2.5,
    next_review: now,
    last_seen: now,
    mastered: false
  };

  if (wasCorrect) {
    prog.correct_count++;
    prog.streak++;
    prog.ease_factor = Math.min(4.0, prog.ease_factor + 0.1);
    const intervals = [1, 3, 7, 14, 30, 60];
    const idx = Math.min(prog.streak - 1, intervals.length - 1);
    prog.next_review = addDays(now, intervals[idx]);
    if (prog.streak >= 5) prog.mastered = true;
  } else {
    prog.wrong_count++;
    prog.streak = 0;
    prog.ease_factor = Math.max(1.3, prog.ease_factor - 0.3);
    prog.mastered = false;
    prog.next_review = addMinutes(now, 10);
  }
  prog.last_seen = now;
  return upsertProgress(prog);
}

export async function selectSessionWords(count = 10) {
  const due = await getDueWords(count);
  if (due.length >= count) return due.slice(0, count);
  const need = count - due.length;
  const fresh = await getNewWords(need);
  return [...due, ...fresh].slice(0, count);
}

export async function addXPAndUpdateStreak(xpEarned) {
  const config = await getConfig();
  if (!config) return;
  const today = new Date().toDateString();
  const lastDate = config.last_study_date ? new Date(config.last_study_date).toDateString() : null;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  let streak = config.current_streak_days || 0;
  if (lastDate === today) {
    // already studied today
  } else if (lastDate === yesterday) {
    streak++;
  } else {
    streak = 1;
  }
  await updateConfig({
    total_xp: (config.total_xp || 0) + xpEarned,
    current_streak_days: streak,
    last_study_date: new Date().toISOString().split('T')[0]
  });
  return streak;
}
