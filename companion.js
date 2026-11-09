'use strict';
/* Compagnon de conversation unique, mémoire à long terme et rythme de réponse adaptatif.
   Ce fichier doit être chargé APRÈS progress.js et AVANT app.js. */

/* Silence minimal vu par le serveur Google. Le vrai délai de réponse est piloté côté appli (voir gateFrame). */
const SERVER_VAD_MS = 900;

/* ====================== COMPAGNON ====================== */

const VOICE_GENDER = {
  Zephyr: 'female', Puck: 'male', Charon: 'male', Kore: 'female', Fenrir: 'male', Leda: 'female', Orus: 'male', Aoede: 'female',
  Callirrhoe: 'female', Autonoe: 'female', Enceladus: 'male', Iapetus: 'male', Umbriel: 'male', Algieba: 'male', Despina: 'female',
  Erinome: 'female', Algenib: 'male', Rasalgethi: 'male', Laomedeia: 'female', Achernar: 'female', Alnilam: 'male', Schedar: 'male',
  Gacrux: 'female', Pulcherrima: 'female', Achird: 'male', Zubenelgenubi: 'male', Vindemiatrix: 'female', Sadachbia: 'male',
  Sadaltager: 'male', Sulafat: 'female'
};
const DEFAULT_VOICE = { female: 'Sulafat', male: 'Achird' };

const ACCENTS = {
  en: [
    { k: 'neutral', fr: 'Neutre (international)', en: 'clear neutral international' }, { k: 'us', fr: 'Américain', en: 'General American' },
    { k: 'uk', fr: 'Britannique (Sud)', en: 'British (southern England)' }, { k: 'scot', fr: 'Écossais', en: 'light Scottish' },
    { k: 'irish', fr: 'Irlandais', en: 'Irish' }, { k: 'aus', fr: 'Australien', en: 'Australian' },
    { k: 'can', fr: 'Canadien', en: 'Canadian' }, { k: 'ind', fr: 'Indien', en: 'Indian English' }
  ],
  es: [
    { k: 'neutral', fr: 'Neutre (Amérique latine)', en: 'neutral Latin American' }, { k: 'cast', fr: 'Castillan (Madrid)', en: 'Castilian (Madrid)' },
    { k: 'mex', fr: 'Mexicain', en: 'Mexican' }, { k: 'col', fr: 'Colombien (Bogotá)', en: 'Colombian (Bogotá)' },
    { k: 'arg', fr: 'Argentin (Buenos Aires)', en: 'Argentine (Buenos Aires)' }, { k: 'chi', fr: 'Chilien', en: 'Chilean' }
  ],
  de: [
    { k: 'neutral', fr: 'Allemand standard', en: 'neutral standard German (Hochdeutsch)' }, { k: 'aut', fr: 'Autrichien (Vienne)', en: 'Austrian (Vienna, clear)' },
    { k: 'swiss', fr: 'Suisse alémanique (Zurich)', en: 'Swiss (Zurich) standard German' }, { k: 'berlin', fr: 'Berlinois', en: 'Berlin' },
    { k: 'hamburg', fr: 'Hambourgeois', en: 'standard German from Hamburg' }, { k: 'cologne', fr: 'Rhénan (Cologne)', en: 'Cologne (light Rhineland)' }
  ],
  it: [
    { k: 'neutral', fr: 'Italien standard', en: 'neutral standard Italian' }, { k: 'rome', fr: 'Romain', en: 'Roman' },
    { k: 'milan', fr: 'Milanais', en: 'Milanese-tinged standard Italian' }, { k: 'tuscan', fr: 'Toscan (Florence)', en: 'standard Italian from Florence (clear)' },
    { k: 'sicily', fr: 'Sicilien (léger)', en: 'Sicilian-tinged (light and clear)' }, { k: 'naples', fr: 'Napolitain (léger)', en: 'Neapolitan-tinged (light and clear)' }
  ]
};

const TRAITS = [
  { k: 'warm', fr: 'Chaleureux', en: 'warm and kind' },
  { k: 'funny', fr: 'Drôle', en: 'funny, with a light and quick sense of humor' },
  { k: 'teasing', fr: 'Taquin', en: 'playfully teasing (never hurtful)' },
  { k: 'calm', fr: 'Calme', en: 'calm and reassuring' },
  { k: 'curious', fr: 'Curieux', en: 'very curious about people and ideas' },
  { k: 'direct', fr: 'Direct', en: 'direct and honest, no beating around the bush' },
  { k: 'thoughtful', fr: 'Posé', en: 'thoughtful and measured' },
  { k: 'enthusiastic', fr: 'Enthousiaste', en: 'enthusiastic and energetic' },
  { k: 'empathetic', fr: 'Empathique', en: 'deeply empathetic and attentive to feelings' },
  { k: 'cultured', fr: 'Cultivé', en: 'well-read and cultured, enjoys sharing interesting things' }
];

const PATIENCE = {
  quick: { fr: 'Vive', mult: 0.8, text: 'You are quick and lively: you react readily when the learner pauses briefly, but you never cut them off in the middle of a thought.' },
  normal: { fr: 'Normale', mult: 1, text: 'You are patient in a natural, balanced way.' },
  high: { fr: 'Grande', mult: 1.4, text: 'You are very patient: you give the learner plenty of time and rarely rush to fill a silence.' }
};

function defaultCompanion() {
  return { name: 'Alex', gender: 'male', voice: 'Achird', accent: {}, accentCustom: {}, traits: ['warm', 'curious', 'funny'], patience: 'normal', custom: '', adjust: [], created: false };
}
function companionData() {
  if (!S.settings.companion) S.settings.companion = defaultCompanion();
  const c = S.settings.companion, d = defaultCompanion();
  for (const k of Object.keys(d)) if (c[k] === undefined || c[k] === null) c[k] = d[k];
  return c;
}
function saveCompanion() { store.set('ec_settings', S.settings); }
function companionAccent(lk) {
  const c = companionData();
  if (c.accentCustom[lk]) return c.accentCustom[lk];
  const list = ACCENTS[lk] || ACCENTS.en;
  const a = list.find(x => x.k === c.accent[lk]) || list[0];
  return a.en;
}
function companionPersona() {
  const c = companionData();
  return { id: 'companion', emoji: c.gender === 'female' ? '👩' : '👨', name: c.name || 'Alex', voice: c.voice || DEFAULT_VOICE[c.gender] };
}
function traitsText() {
  const c = companionData();
  const t = c.traits.map(k => (TRAITS.find(x => x.k === k) || {}).en).filter(Boolean);
  return t.length ? t.join(', ') : 'warm and kind';
}

/* Modification demandée à voix haute pendant une séance. */
function applyCompanionUpdate(a) {
  const c = companionData(), lk = curLang(), changed = [];
  const g = String(a.gender || '').toLowerCase();
  if (g === 'male' || g === 'female') { if (c.gender !== g) { c.gender = g; changed.push('gender'); if (VOICE_GENDER[c.voice] !== g) c.voice = DEFAULT_VOICE[g]; } }
  const vname = Object.keys(VOICE_GENDER).find(v => v.toLowerCase() === String(a.voice || '').toLowerCase());
  if (vname && vname !== c.voice) { c.voice = vname; c.gender = VOICE_GENDER[vname]; changed.push('voice'); }
  if (a.accent) {
    const txt = String(a.accent).toLowerCase();
    const hit = (ACCENTS[lk] || []).find(x => txt.includes(x.k) || [x.fr, x.en].some(s => s.toLowerCase().split(/[ (),]+/).some(w => w.length > 3 && txt.includes(w))));
    if (hit) { c.accent[lk] = hit.k; c.accentCustom[lk] = ''; } else c.accentCustom[lk] = String(a.accent).slice(0, 80);
    changed.push('accent');
  }
  const norm = x => String(x).toLowerCase();
  for (const t of (a.traits_add || [])) {
    const hit = TRAITS.find(x => norm(t).includes(x.k) || norm(t).includes(norm(x.fr)));
    if (hit) { if (!c.traits.includes(hit.k)) c.traits.push(hit.k); } else c.adjust.push(String(t).slice(0, 100));
    changed.push('trait');
  }
  for (const t of (a.traits_remove || [])) {
    const hit = TRAITS.find(x => norm(t).includes(x.k) || norm(t).includes(norm(x.fr)));
    if (hit) c.traits = c.traits.filter(k => k !== hit.k); else c.adjust.push('less ' + String(t).slice(0, 90));
    changed.push('trait');
  }
  c.traits = c.traits.slice(-4);
  const p = { quick: 'quick', normal: 'normal', very_patient: 'high', high: 'high' }[String(a.patience || '')];
  if (p && p !== c.patience) { c.patience = p; changed.push('patience'); }
  if (a.note) { c.adjust.push(String(a.note).slice(0, 120)); changed.push('note'); }
  c.adjust = c.adjust.slice(-6);
  if (changed.length) { saveCompanion(); renderCompanion(); }
  return changed;
}

/* ====================== MÉMOIRE ====================== */

const MEM_KEY = 'ec_memory';
const MEM_LABELS = { life: 'Ce que ton interlocuteur a raconté de sa propre vie', pinned: 'À retenir (ajouté par toi ou demandé à voix haute)', facts: 'Ce que je sais de toi', interests: 'Centres d\'intérêt', threads: 'Sujets à reprendre', difficulties: 'Difficultés récurrentes', style: 'Ce qui marche avec toi', recent: 'Dernières conversations' };

function emptyMemory() { return { v: 1, facts: [], interests: [], threads: [], difficulties: [], style: [], pinned: [], recent: [], life: { name: '', items: [] }, sessions: 0, last: null }; }
function getMemory() { return Object.assign(emptyMemory(), store.get(MEM_KEY, null) || {}); }
function setMemory(m) { store.set(MEM_KEY, m); }
function cleanList(a, max, len) {
  const seen = new Set(), out = [];
  for (const x of (Array.isArray(a) ? a : [])) {
    const t = String(x == null ? '' : x).replace(/\s+/g, ' ').trim().slice(0, len || 170);
    const k = t.toLowerCase();
    if (t.length < 3 || seen.has(k)) continue;
    seen.add(k); out.push(t);
    if (out.length >= max) break;
  }
  return out;
}
function addPinned(text) {
  const m = getMemory(); m.pinned = cleanList([String(text)].concat(m.pinned), 30); setMemory(m);
  if (typeof renderMemory === 'function') renderMemory();
}
function agoText(iso) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);
  return d <= 0 ? 'earlier today' : d === 1 ? 'yesterday' : d + ' days ago';
}

function memoryPrompt() {
  if (!S.settings.memory) return '';
  const m = getMemory();
  if (!(m.sessions || m.pinned.length || m.facts.length || m.interests.length)) return '';
  let out = '\nWHAT YOU KNOW ABOUT THE LEARNER (from your earlier conversations, written in French). Use it the way a friend does: bring things up naturally and only when relevant, never recite it like a list, never say "according to my memory", and do not keep repeating the same personal detail.\n';
  if (m.sessions) out += '- You have already talked together ' + m.sessions + ' time(s)' + (m.last ? ', the last time ' + agoText(m.last) : '') + '.\n';
  const add = (label, arr, n) => { if (arr && arr.length) out += '- ' + label + ': ' + arr.slice(0, n).join(' ; ') + '\n'; };
  add('Asked to remember', m.pinned, 12); add('Facts', m.facts, 25); add('Interests', m.interests, 10);
  add('Open threads you can follow up on gently (at most one per conversation)', m.threads, 6);
  add('Recurring language difficulties', m.difficulties, 6); add('What works with this learner', m.style, 8);
  if (m.recent.length) out += '- Recent conversations: ' + m.recent.slice(0, 3).map(r => r.d + ' : ' + r.s).join(' | ') + '\n';
  return out.slice(0, 3400);
}

/* Niveau réel de l'apprenant, mesuré par les tests de niveau et les dernières séances. */
const CRIT_EN = { range: 'vocabulary range', accuracy: 'grammatical accuracy', fluency: 'fluency', coherence: 'coherence', interaction: 'interaction', pronunciation: 'pronunciation', listening: 'listening comprehension' };
function learnerLevelPrompt() {
  const lk = S.settings.lang || 'en', parts = [];
  const asm = store.get('ec_assess', []).filter(a => (a.lang || 'en') === lk).sort((x, y) => new Date(y.date) - new Date(x.date))[0];
  if (asm) {
    const low = Object.keys(asm.criteria || {}).sort((x, y) => asm.criteria[x].score - asm.criteria[y].score).slice(0, 2).map(k => CRIT_EN[k]).filter(Boolean);
    parts.push('measured level about ' + asm.level + ' (' + Math.round(asm.overall) + ' out of 100) at the last level test on ' + String(asm.date).slice(0, 10) + (low.length ? ', weakest areas: ' + low.join(' and ') : ''));
  }
  const rows = store.get('ec_sessions', []).filter(s => (s.lang || 'en') === lk && (!s.mode || s.mode === 'practice') && s.metrics && s.metrics.words >= 30).slice(0, 5);
  if (rows.length) {
    const avg = k => rows.reduce((a, s) => a + (s.metrics[k] || 0), 0) / rows.length;
    let line = 'in recent conversations their answers average about ' + Math.round(avg('avgTurn')) + ' words';
    if (avg('wpm')) line += ', they speak about ' + Math.round(avg('wpm')) + ' words per minute and hesitate about ' + avg('pausesPerMin').toFixed(1) + ' times per minute';
    line += ', and about ' + Math.round(avg('frenchPct')) + ' percent of their sentences contain French';
    parts.push(line);
  }
  if (!parts.length) return 'LEARNER LEVEL: not measured yet. Judge it yourself in the first minutes (length of answers, vocabulary, errors, hesitations, use of French) and calibrate from there.';
  return 'LEARNER LEVEL (measured, use it as a starting point and keep calibrating from what you actually hear): ' + parts.join('; ') + '.';
}

/* La vie de l'interlocuteur : détails inventés au fil des séances, gardés pour rester cohérent. */
function ownLifeItems() {
  const m = getMemory(), name = companionData().name;
  return (m.life && m.life.name === name && Array.isArray(m.life.items)) ? m.life.items : [];
}
function ownLifePrompt() {
  const items = S.settings.memory ? ownLifeItems() : [];
  let out = '\nYOUR OWN LIFE (you are a real person with an everyday life: work or activities, family or friends, a place you live in, small habits, projects, worries, things you look forward to). ';
  if (items.length) out += 'Here is what you already told the learner about yourself in earlier conversations (written in French). Stay consistent with it, never contradict it, and let it move forward naturally like real life (news, small developments, a thing that went well or badly): ' + items.slice(0, 12).join(' ; ') + '. ';
  else out += 'Invent a simple, believable everyday life for yourself right away and stay consistent with it for the whole conversation. ';
  return out + 'Mention it in small touches, never as a monologue, and invent new details only when they fit the moment.\n';
}

function kickoffText(kind) {
  if (kind === 'switch') return 'Your voice or personality was just adjusted as the learner asked. Continue the conversation naturally from where you were, without re-introducing yourself. You may acknowledge the change with a short light remark.';
  const m = S.settings.memory ? getMemory() : null;
  if (m && m.sessions > 0) return 'Begin the conversation now like a friend who already knows the learner: greet them naturally in one or two short sentences. Start with a statement, not a question: a small thing from your own life or day, or a light callback to something from last time that feels natural. Do not list what you remember and do not open with "how are you".';
  return 'Begin the conversation now: introduce yourself very briefly and naturally in character, then say something small and human about your own day so the learner has something to react to. Ask at most one easy, friendly question, and only if it fits.';
}

/* Consolidation de la mémoire après chaque séance, par un modèle texte (une requête). */
async function consolidateMemory(sess) {
  if (!S.settings.memory || !sess) return;
  const user = sess.transcript.filter(l => l.who === 'user');
  if (user.length < 3) return;
  const m0 = getMemory(); m0.sessions += 1; m0.last = new Date().toISOString(); setMemory(m0);
  const lines = sess.transcript.map(l => (l.who === 'user' ? 'LEARNER: ' : 'FRIEND: ') + l.text).join('\n').slice(-9000);
  const cur = { facts: m0.facts, interests: m0.interests, threads: m0.threads, difficulties: m0.difficulties, style: m0.style, friend_life: ownLifeItems() };
  const prompt = 'You maintain the long-term memory of a friendly conversation companion about a French-speaking learner of ' + (LANGUAGES[sess.lang || 'en'] || LANGUAGES.en).name + '. You receive the CURRENT MEMORY (JSON) and the TRANSCRIPT of the latest conversation. Return the UPDATED memory as JSON only.\n\n'
    + 'Rules:\n- Write every item in French, short (under 140 characters).\n'
    + '- Use ONLY what the LEARNER said. The FRIEND\'s lines are fiction (the friend invents anecdotes): never store them as facts.\n'
    + '- Keep durable, useful facts about the learner\'s life and personality: family, work, hobbies, tastes, opinions on everyday topics, plans, habits, how they like to be spoken to.\n'
    + '- Do NOT store sensitive data: health, finances, politics, religion, sexuality, home address, phone numbers, passwords, identity numbers, or anything about third parties beyond a first name and relation.\n'
    + '- "threads": things worth following up naturally next time (an event coming up, an unresolved situation). Remove threads that are resolved.\n'
    + '- "difficulties": recurring language difficulties observed (grammar points, vocabulary, pronunciation, hesitation triggers).\n'
    + '- "style": what works with this learner (pace, humor, how much time they need, correction preference, topics that energise them).\n'
    + '- Merge duplicates, drop outdated items, keep at most 40 facts, 15 interests, 8 threads, 8 difficulties, 8 style notes.\n'
    + '- "friend_life": separately, the personal details the FRIEND (not the learner) invented about its OWN life in this conversation (work, family, pets, hobbies, place, recent events, opinions), merged with the current friend_life so the friend stays consistent in future conversations. At most 12 short items.\n'
    + '- "summary": one sentence in French about this conversation.\n\n'
    + 'Output schema: {"facts":[],"interests":[],"threads":[],"difficulties":[],"style":[],"friend_life":[],"summary":""}\n\n'
    + 'CURRENT MEMORY:\n' + JSON.stringify(cur) + '\n\nTRANSCRIPT:\n' + lines;
  const models = [S.settings.textModel, 'gemini-2.5-flash'].filter((x, i, arr) => x && arr.indexOf(x) === i);
  for (const mod of models) {
    try {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(mod) + ':generateContent?key=' + encodeURIComponent(S.settings.apiKey.trim()), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } })
      });
      if (!r.ok) continue;
      const j = await r.json();
      const txt = ((((j.candidates || [])[0] || {}).content || {}).parts || []).map(p => p.text || '').join('').replace(/^```json|```$/g, '').trim();
      const o = JSON.parse(txt);
      const m = getMemory();
      const up = { facts: cleanList(o.facts, 40), interests: cleanList(o.interests, 15), threads: cleanList(o.threads, 8), difficulties: cleanList(o.difficulties, 8), style: cleanList(o.style, 8) };
      /* Garde-fou : une réponse qui effacerait l'essentiel de la mémoire est complétée par l'existant. */
      for (const k of Object.keys(up)) if (m[k].length > 6 && up[k].length < m[k].length * 0.5) up[k] = cleanList(up[k].concat(m[k]), k === 'facts' ? 40 : 15);
      Object.assign(m, up);
      m.life = { name: companionData().name, items: cleanList(o.friend_life, 12) };
      const sum = cleanList([o.summary], 1, 220)[0];
      if (sum) m.recent = [{ d: new Date().toISOString().slice(0, 10), s: sum }].concat(m.recent).slice(0, 6);
      setMemory(m);
      if (typeof renderMemory === 'function') renderMemory();
      return;
    } catch (e) { /* modèle suivant */ }
  }
}

function renderMemory() {
  const box = document.getElementById('memBox'); if (!box) return;
  box.innerHTML = '';
  const m = getMemory();
  const wrap = h('div', 'note');
  wrap.appendChild(h('p', 'sub', m.sessions ? m.sessions + ' conversation(s) mémorisée(s). Ces informations restent dans ce téléphone et sont transmises à Google avec tes conversations pour que ton interlocuteur te connaisse.' : 'Rien de mémorisé pour l\'instant. Après chaque conversation, ton interlocuteur retient ce qui compte (famille, travail, goûts, projets, difficultés). Tu peux aussi lui dire « souviens-toi que... ».'));
  let any = false;
  for (const k of ['life', 'pinned', 'facts', 'interests', 'threads', 'difficulties', 'style', 'recent']) {
    const arr = k === 'life' ? ownLifeItems() : m[k]; if (!arr || !arr.length) continue;
    any = true;
    wrap.appendChild(h('h3', '', MEM_LABELS[k]));
    arr.forEach((item, i) => {
      const row = h('div', 'crit');
      row.appendChild(h('span', 'cl', k === 'recent' ? item.d + ' : ' + item.s : item));
      const del = h('button', 'mini', '✕'); del.title = 'Supprimer';
      del.onclick = () => { const mm = getMemory(); if (k === 'life') mm.life.items.splice(i, 1); else mm[k].splice(i, 1); setMemory(mm); renderMemory(); };
      row.appendChild(del); wrap.appendChild(row);
    });
  }
  const add = h('div', 'frow');
  const inp = h('input'); inp.type = 'text'; inp.placeholder = 'Ajouter quelque chose à retenir'; inp.autocomplete = 'off';
  const btn = h('button', 'btn', 'Ajouter'); btn.onclick = () => { if (inp.value.trim()) { addPinned(inp.value); } };
  add.append(inp, btn); wrap.appendChild(add);
  if (any || m.sessions) {
    const clr = h('button', 'btn danger', 'Effacer toute la mémoire');
    clr.onclick = () => { if (confirm('Effacer tout ce que ton interlocuteur sait de toi ?')) { setMemory(emptyMemory()); renderMemory(); } };
    wrap.appendChild(clr);
  }
  box.appendChild(wrap);
}

/* ====================== ÉDITEUR DU COMPAGNON ====================== */

function segOf(opts, current, onPick) {
  const seg = h('div', 'seg');
  for (const [v, label] of opts) {
    const b = h('button', current === v ? 'on' : '', label); b.onclick = () => onPick(v); seg.appendChild(b);
  }
  return seg;
}
function fieldOf(label, node) { const f = h('div', 'field'); f.appendChild(h('label', '', label)); f.appendChild(node); return f; }

function renderCompanion() {
  const wrap = document.getElementById('compWrap'); if (!wrap) return;
  wrap.innerHTML = '';
  const c = companionData(), lk = curLang(), P = companionPersona();
  const open = S.compOpen || !c.created;
  const accentLabel = ((ACCENTS[lk] || ACCENTS.en).find(a => a.k === c.accent[lk]) || (ACCENTS[lk] || ACCENTS.en)[0]).fr;
  const card = h('div', 'note');
  const head = h('div', 'compHead');
  head.appendChild(h('span', 'cavatar', P.emoji));
  const info = h('div'); info.appendChild(h('b', 'cname', P.name));
  info.appendChild(h('div', 'sub', (c.gender === 'female' ? 'Femme' : 'Homme') + ' · voix ' + c.voice + ' · ' + (c.accentCustom[lk] || accentLabel) + ' · patience ' + PATIENCE[c.patience].fr.toLowerCase()));
  info.appendChild(h('div', 'sub', c.traits.map(k => (TRAITS.find(x => x.k === k) || {}).fr).filter(Boolean).join(', ')));
  head.appendChild(info); card.appendChild(head);
  if (!c.created) card.appendChild(h('p', 'sub', 'Crée la personne avec qui tu vas parler au quotidien. Elle s\'adapte à toi, se souvient de vos échanges, et tu pourras la modifier à tout moment (ou lui demander à voix haute).'));
  if (!open) {
    const b = h('button', 'btn', 'Modifier mon interlocuteur'); b.onclick = () => { S.compOpen = true; renderCompanion(); };
    card.appendChild(b); wrap.appendChild(card); return;
  }
  const nm = h('input'); nm.type = 'text'; nm.value = c.name; nm.autocomplete = 'off';
  nm.oninput = () => { c.name = nm.value.trim() || 'Alex'; saveCompanion(); const n = card.querySelector('.cname'); if (n) n.textContent = c.name; };
  card.appendChild(fieldOf('Prénom', nm));
  card.appendChild(fieldOf('Genre', segOf([['female', 'Femme'], ['male', 'Homme']], c.gender, v => {
    c.gender = v; if (VOICE_GENDER[c.voice] !== v) c.voice = DEFAULT_VOICE[v]; saveCompanion(); renderCompanion();
  })));
  const vs = h('select');
  Object.keys(VOICE_GENDER).filter(v => VOICE_GENDER[v] === c.gender).forEach(v => { const o = h('option', '', (typeof VOICES !== 'undefined' && VOICES[v]) || v); o.value = v; if (v === c.voice) o.selected = true; vs.appendChild(o); });
  vs.onchange = () => { c.voice = vs.value; saveCompanion(); renderCompanion(); };
  card.appendChild(fieldOf('Voix', vs));
  const ac = h('select');
  (ACCENTS[lk] || ACCENTS.en).forEach(a => { const o = h('option', '', a.fr); o.value = a.k; if (!c.accentCustom[lk] && a.k === ((ACCENTS[lk] || ACCENTS.en).find(x => x.k === c.accent[lk]) || (ACCENTS[lk] || ACCENTS.en)[0]).k) o.selected = true; ac.appendChild(o); });
  ac.onchange = () => { c.accent[lk] = ac.value; c.accentCustom[lk] = ''; saveCompanion(); renderCompanion(); };
  card.appendChild(fieldOf('Accent (' + LANGUAGES[lk].flag + ' langue actuelle)', ac));
  if (c.accentCustom[lk]) {
    const line = h('div', 'crit'); line.appendChild(h('span', 'cl', 'Accent demandé à voix haute : ' + c.accentCustom[lk]));
    const x = h('button', 'mini', '✕'); x.onclick = () => { c.accentCustom[lk] = ''; saveCompanion(); renderCompanion(); }; line.appendChild(x); card.appendChild(line);
  }
  const chips = h('div', 'chips');
  for (const t of TRAITS) {
    const b = h('button', 'chip' + (c.traits.includes(t.k) ? ' sel' : ''), t.fr);
    b.onclick = () => {
      if (c.traits.includes(t.k)) c.traits = c.traits.filter(k => k !== t.k);
      else { c.traits.push(t.k); if (c.traits.length > 4) c.traits.shift(); }
      saveCompanion(); renderCompanion();
    };
    chips.appendChild(b);
  }
  card.appendChild(fieldOf('Caractère (4 maximum)', chips));
  card.appendChild(fieldOf('Patience de base (elle s\'adapte ensuite à chaque situation)', segOf(Object.keys(PATIENCE).map(k => [k, PATIENCE[k].fr]), c.patience, v => { c.patience = v; saveCompanion(); renderCompanion(); })));
  const ta = h('textarea'); ta.value = c.custom; ta.placeholder = 'Ex : ancienne infirmière, adore la randonnée, parle simplement et sans détour'; ta.oninput = () => { c.custom = ta.value.slice(0, 400); saveCompanion(); };
  card.appendChild(fieldOf('Ce qui le ou la caractérise (facultatif)', ta));
  if (c.adjust.length) {
    const line = h('div', 'crit'); line.appendChild(h('span', 'cl', 'Ajustements demandés : ' + c.adjust.join(' ; ')));
    const x = h('button', 'mini', '✕'); x.onclick = () => { c.adjust = []; saveCompanion(); renderCompanion(); }; line.appendChild(x); card.appendChild(line);
  }
  const done = h('button', 'btn pri', c.created ? 'Terminé' : 'C\'est parti'); done.onclick = () => { c.created = true; S.compOpen = false; saveCompanion(); renderCompanion(); };
  const reset = h('button', 'btn danger', 'Réinitialiser'); reset.onclick = () => { if (confirm('Revenir à l\'interlocuteur par défaut ?')) { S.settings.companion = defaultCompanion(); saveCompanion(); renderCompanion(); } };
  const row = h('div', 'row'); row.append(done, reset); card.appendChild(row);
  wrap.appendChild(card);
}

/* ====================== RYTHME DE RÉPONSE ADAPTATIF ====================== */

/* Le serveur coupe le tour de parole après SERVER_VAD_MS de silence reçu. L'appli retient les trames de silence
   tant que la situation demande plus de temps (hésitation, mot cherché, « attends ») et ne les envoie qu'à la fin. */
const RE_THINK = /(\bwait\b|hold on|let me think|give me a (second|moment|sec)|just a (second|moment|sec)|un instant|une seconde|attends|laisse[- ]moi (réfléchir|penser)|un moment|un momento|espera|moment mal|warte|aspetta)[^.?!]{0,25}$/i;
const RE_SEARCH = /(how (do|would|can) (you|i) say|what'?s the (word|name)|what is the word|how do you call|i don'?t know how to say|comment (on )?dit|c'?est quoi le mot|je cherche (le|mon) mot|je sais plus (comment|le mot)|cómo se dice|wie sagt man|come si dice)[^.?!]*$/i;
const RE_FILLER = /(\b(um+|uh+|er+|erm|hmm+|mm+|euh+|heu|hum|eh+|ehm|äh+|ähm|este|pues|allora|cioè)\b[\s,.…-]*|[,…-]\s*|\.\.\.\s*)$/i;
const RE_CONNECT = /\b(and|but|so|because|or|if|when|that|which|who|the|a|an|to|of|in|on|at|for|with|my|i|i'm|i'd|it's|et|mais|donc|parce que|car|ou|si|que|de|du|des|le|la|les|un|une|und|aber|weil|oder|dass|der|die|das|ein|eine|y|pero|porque|o|el|los|las|e|ma|perché|che|il|lo)\s*$/i;

const G = { inUtt: false, silence: 0, speechRun: 0, speechFrames: 0, turnPauses: 0, T: 0 };
function resetGate() { G.inUtt = false; G.silence = 0; G.speechRun = 0; G.speechFrames = 0; G.turnPauses = 0; }

/* Bonus de patience selon l'historique de l'apprenant : pauses d'hésitation et débit des dernières séances. */
function learnerProfileBonus() {
  const rows = store.get('ec_sessions', []).filter(s => (!s.mode || s.mode === 'practice') && s.metrics && s.metrics.wpm).slice(0, 5);
  if (rows.length < 2) return 0;
  const avg = k => rows.reduce((a, s) => a + (s.metrics[k] || 0), 0) / rows.length;
  let b = 0; const ppm = avg('pausesPerMin'), wpm = avg('wpm');
  if (ppm >= 7) b += 400; else if (ppm >= 4) b += 200;
  if (wpm && wpm < 60) b += 200;
  return b;
}

function effectiveSilenceMs() {
  const s = S.settings, p = PATIENCE[companionData().patience] || PATIENCE.normal;
  let T = (Number(s.silenceMs) || 1100) * p.mult + (S.profileBonus || 0);
  const txt = String(S.cur && S.cur.user || '').trim(), tail = txt.slice(-70), words = txt ? txt.split(/\s+/).length : 0;
  if (!txt) T += 500;
  else if (RE_THINK.test(tail)) T = Math.max(T, 6500);
  else if (RE_SEARCH.test(tail)) T = Math.max(T, 4500);
  else if (RE_FILLER.test(tail)) T += 1600;
  else if (RE_CONNECT.test(tail)) T += 1200;
  else if (/[?.!]["')]*$/.test(txt)) T -= 250;
  else if (words <= 3) T += 400;
  T += Math.min(800, 250 * G.turnPauses);
  const max = p === PATIENCE.high ? 9000 : 7500;
  return Math.max(SERVER_VAD_MS, Math.min(max, Math.round(T)));
}

/* Appelée pour chaque trame de 100 ms du micro : renvoie true si elle doit être envoyée au serveur. */
function gateFrame(rms) {
  const a = S.act || {}, thr = Math.max(0.012, (a.floor || 0) * 3);
  if (rms > thr) {
    if (G.inUtt && G.silence >= 600) G.turnPauses++;
    G.speechRun++; G.silence = 0;
    if (G.speechRun >= 2) { G.inUtt = true; G.speechFrames++; }
    return true;
  }
  G.speechRun = 0;
  if (!G.inUtt || G.speechFrames < 3) return true;
  G.silence += 100;
  G.T = effectiveSilenceMs();
  if (G.silence > G.T + 2000) { G.inUtt = false; G.speechFrames = 0; G.turnPauses = 0; return true; }
  return G.silence <= 300 || G.silence > G.T - (SERVER_VAD_MS - 300);
}
