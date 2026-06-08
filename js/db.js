import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- words ----
export async function getAllWords() {
  const { data } = await db.from('words').select('*');
  return data || [];
}

export async function getWordsByCategory(category) {
  const { data } = await db.from('words').select('*').eq('category', category);
  return data || [];
}

// ---- user_progress ----
export async function getProgress(wordId) {
  const { data } = await db.from('user_progress').select('*').eq('word_id', wordId).maybeSingle();
  return data;
}

export async function getAllProgress() {
  const { data } = await db.from('user_progress').select('*');
  return data || [];
}

export async function upsertProgress(progress) {
  progress.updated_at = new Date().toISOString();
  const { data } = await db.from('user_progress').upsert(progress, { onConflict: 'word_id' }).select().single();
  return data;
}

export async function getDueWords(limit = 20) {
  const now = new Date().toISOString();
  const { data } = await db.from('user_progress')
    .select('*, words(*)')
    .lte('next_review', now)
    .order('next_review', { ascending: true })
    .limit(limit);
  return (data || []).map(r => ({ ...r.words, _progress: r }));
}

export async function getNewWords(limit = 10) {
  const { data: seen } = await db.from('user_progress').select('word_id');
  const seenIds = (seen || []).map(r => r.word_id);
  let query = db.from('words').select('*').limit(limit);
  if (seenIds.length > 0) query = query.not('id', 'in', `(${seenIds.join(',')})`);
  const { data } = await query;
  return data || [];
}

export async function countDueWords() {
  const now = new Date().toISOString();
  const { count } = await db.from('user_progress').select('id', { count: 'exact', head: true }).lte('next_review', now);
  return count || 0;
}

// ---- study_sessions ----
export async function insertSession(session) {
  const { data } = await db.from('study_sessions').insert(session).select().single();
  return data;
}

export async function getRecentSessions(limit = 10) {
  const { data } = await db.from('study_sessions').select('*').order('created_at', { ascending: false }).limit(limit);
  return data || [];
}

export async function getSessionsLast7Days() {
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const { data } = await db.from('study_sessions').select('*').gte('created_at', since).order('created_at');
  return data || [];
}

// ---- user_config ----
export async function getConfig() {
  const { data } = await db.from('user_config').select('*').eq('id', 1).maybeSingle();
  return data;
}

export async function updateConfig(fields) {
  const { data } = await db.from('user_config').update(fields).eq('id', 1).select().single();
  return data;
}
