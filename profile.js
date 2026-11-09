'use strict';
/* Sauvegarde, import et invitation de profil. Chargé APRÈS companion.js et AVANT app.js.
   Un profil vit uniquement dans le téléphone : ce module le sort ou le fait entrer par fichier, code, lien ou QR. */

const BACKUP_KEYS = ['ec_settings', 'ec_memory', 'ec_sessions', 'ec_assess', 'ec_official', 'ec_topics'];
const INVITE_PREFIX = 'ECP1.';

/* ====================== OUTILS ====================== */

function b64uEnc(str) { return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function b64uDec(t) { t = String(t).replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '='; return decodeURIComponent(escape(atob(t))); }
function hasOwn(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
function str(x, n) { return typeof x === 'string' ? x.slice(0, n) : ''; }
function isIOS() { return /iPad|iPhone|iPod/.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
function isStandalone() { try { return navigator.standalone === true || !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches); } catch (e) { return false; } }
function validKey(k) { return typeof k === 'string' && /^[A-Za-z0-9._-]{20,140}$/.test(k.trim()); }

/* ====================== ASSAINISSEMENT ====================== */

function sanitizeCompanion(c) {
  const d = defaultCompanion();
  if (!c || typeof c !== 'object') return d;
  const o = Object.assign({}, d);
  o.name = str(c.name, 30).trim() || d.name;
  o.gender = c.gender === 'female' ? 'female' : 'male';
  o.voice = hasOwn(VOICE_GENDER, c.voice) && VOICE_GENDER[c.voice] === o.gender ? c.voice : DEFAULT_VOICE[o.gender];
  o.accent = {}; o.accentCustom = {};
  for (const lk of Object.keys(ACCENTS)) {
    if (c.accent && ACCENTS[lk].some(a => a.k === c.accent[lk])) o.accent[lk] = c.accent[lk];
    if (c.accentCustom && typeof c.accentCustom[lk] === 'string' && c.accentCustom[lk]) o.accentCustom[lk] = str(c.accentCustom[lk], 80);
  }
  o.traits = (Array.isArray(c.traits) ? c.traits : []).filter(k => TRAITS.some(t => t.k === k)).slice(0, 4);
  if (!o.traits.length) o.traits = d.traits;
  o.patience = Object.prototype.hasOwnProperty.call(PATIENCE, c.patience) ? c.patience : 'normal';
  o.custom = str(c.custom, 400);
  o.adjust = (Array.isArray(c.adjust) ? c.adjust : []).map(x => str(x, 120)).filter(Boolean).slice(0, 6);
  o.created = true;
  return o;
}

const ENUMS = { level: ['B1', 'B2', 'C1'], speed: ['slow', 'natural', 'fast'], correction: ['recast', 'end', 'coach'], talk: ['auto', 'short', 'normal'], period: ['7', '30', '90', 'all', 'custom'], trDir: ['both', 'fr2x', 'x2fr'] };

function sanitizeSettings(raw, allowKey) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const k of Object.keys(DEFAULTS)) {
    if (!(k in raw)) continue;
    const dv = DEFAULTS[k], v = raw[k];
    if (typeof v !== typeof dv) continue;
    if (typeof v === 'string') out[k] = v.slice(0, 600); else if (typeof v === 'number') out[k] = isFinite(v) ? v : dv; else out[k] = v;
    if (ENUMS[k] && !ENUMS[k].includes(String(out[k]))) delete out[k];
  }
  if (out.lang && !(hasOwn(LANGUAGES, out.lang) && LANGUAGES[out.lang].enabled)) delete out.lang;
  if (out.trLang && !hasOwn(TR_LANGS, out.trLang)) delete out.trLang;
  if (out.trVoice && !hasOwn(VOICE_GENDER, out.trVoice)) delete out.trVoice;
  if (out.silenceMs != null) out.silenceMs = Math.max(500, Math.min(2500, out.silenceMs));
  if ('apiKey' in out) { if (allowKey && validKey(out.apiKey)) out.apiKey = out.apiKey.trim(); else delete out.apiKey; }
  if (raw.companion) out.companion = sanitizeCompanion(raw.companion);
  out.v2 = true;
  return out;
}

function sanitizeMemory(m) {
  const base = emptyMemory();
  if (!m || typeof m !== 'object') return base;
  for (const k of ['facts', 'interests', 'threads', 'difficulties', 'style', 'pinned']) base[k] = cleanList(m[k], 40);
  base.recent = (Array.isArray(m.recent) ? m.recent : []).filter(r => r && typeof r.s === 'string').map(r => ({ d: str(r.d, 10), s: str(r.s, 220) })).slice(0, 6);
  if (m.life && typeof m.life === 'object') base.life = { name: str(m.life.name, 30), items: cleanList(m.life.items, 12) };
  base.sessions = Math.max(0, Math.min(5000, Number(m.sessions) || 0)); base.last = typeof m.last === 'string' ? m.last.slice(0, 40) : null;
  return base;
}

/* ====================== SAUVEGARDE ====================== */

function buildBackup(o) {
  const data = {};
  if (o.settings) {
    const st = JSON.parse(JSON.stringify(S.settings));
    if (!o.key) st.apiKey = '';
    data.ec_settings = st; data.ec_topics = [...S.topics];
  }
  if (o.memory) data.ec_memory = getMemory();
  if (o.history) { data.ec_sessions = store.get('ec_sessions', []); data.ec_assess = store.get('ec_assess', []); data.ec_official = store.get('ec_official', []); }
  return { app: 'english-coach', v: 1, kind: 'backup', exportedAt: new Date().toISOString(), hasKey: !!(o.settings && o.key && S.settings.apiKey), data };
}

function importBackup(obj) {
  const d = obj.data || {}, keys = Object.keys(d).filter(k => BACKUP_KEYS.includes(k));
  if (!keys.length) { toast('Cette sauvegarde est vide.'); return false; }
  const parts = [];
  if (d.ec_settings) parts.push('réglages et interlocuteur' + (obj.hasKey ? ' (avec clé API)' : ''));
  if (d.ec_memory) parts.push('mémoire');
  if (d.ec_sessions || d.ec_assess) parts.push((Array.isArray(d.ec_sessions) ? d.ec_sessions.length : 0) + ' séance(s) et ' + (Array.isArray(d.ec_assess) ? d.ec_assess.length : 0) + ' test(s) de niveau');
  if (!confirm('Remplacer les données de ce téléphone par cette sauvegarde (' + parts.join(', ') + ') ? Cette action ne peut pas être annulée.')) return false;
  if (d.ec_settings) {
    const clean = sanitizeSettings(d.ec_settings, !!obj.hasKey);
    const merged = Object.assign({}, S.settings, clean);
    if (!clean.apiKey) merged.apiKey = S.settings.apiKey;
    store.set('ec_settings', merged);
  }
  if (Array.isArray(d.ec_topics)) store.set('ec_topics', d.ec_topics.filter(x => TOPICS.some(t => t.id === x)).slice(0, 15));
  if (d.ec_memory) store.set(MEM_KEY, sanitizeMemory(d.ec_memory));
  if (Array.isArray(d.ec_sessions)) store.set('ec_sessions', d.ec_sessions.filter(s => s && s.id && s.startedAt).slice(0, 40));
  if (Array.isArray(d.ec_assess)) store.set('ec_assess', d.ec_assess.filter(a => a && a.id && a.date && a.criteria).slice(0, 200));
  if (Array.isArray(d.ec_official)) store.set('ec_official', d.ec_official.filter(o => o && o.id && o.date && o.level).slice(0, 100));
  refreshAfterImport('Sauvegarde importée.');
  return true;
}

/* ====================== INVITATION ====================== */

function buildInvite(o) {
  if (typeof EC_EDITION === 'undefined' || EC_EDITION !== 'owner') throw new Error('invitation réservée à la version propriétaire');
  /* Profil distinct : aucun interlocuteur, réglage personnel, mémoire ni historique n'est copié. */
  const s = S.settings, keep = {};
  for (const k of ['lang', 'model', 'textModel']) keep[k] = s[k];
  const inv = { app: 'english-coach', v: 2, kind: 'invite', s: keep };
  return inv; /* jamais de clé API dans une invitation */
}
function inviteCode(inv) { return INVITE_PREFIX + b64uEnc(JSON.stringify(inv)); }
function inviteBase() { try { return new URL(typeof EC_GUEST_URL === 'string' ? EC_GUEST_URL : '.', location.href).href; } catch (e) { return location.origin + location.pathname; } }
function normBase(u) { try { const x = new URL(String(u).trim()); if (x.protocol !== 'https:') return ''; return x.origin + x.pathname.replace(/index\.html$/, ''); } catch (e) { return ''; } }
function inviteLink(code) { return inviteBase().split('#')[0] + '#ecp=' + code; }

function parseCode(text) {
  let t = String(text || '').trim();
  const i = t.indexOf('#ecp='); if (i >= 0) t = t.slice(i + 5);
  if (t.startsWith('{')) return JSON.parse(t);
  if (!t.startsWith(INVITE_PREFIX)) throw new Error('code');
  return JSON.parse(b64uDec(t.slice(INVITE_PREFIX.length).replace(/[^A-Za-z0-9_-]/g, '')));
}

function applyInvite(inv) {
  /* Une invitation ne transmet jamais de clé API : toute clé éventuelle est ignorée. */
  const hasKey = validKey(S.settings.apiKey);
  if (!confirm('Créer ton profil à partir de cette invitation ? Tu choisiras ton propre interlocuteur, et ta mémoire et ton historique resteront à toi.')) return false;
  const clean = sanitizeSettings(inv.s, false);
  store.set('ec_settings', Object.assign({}, S.settings, clean, { v2: true }));
  refreshAfterImport(hasKey ? 'Invitation acceptée. Choisis ton interlocuteur.' : 'Invitation acceptée. Crée maintenant ta clé gratuite avec l\'assistant.');
  return true;
}

/* ====================== ENTRÉE (fichier, code, lien) ====================== */

function handleImportObject(obj) {
  if (!obj || obj.app !== 'english-coach') { toast('Ce fichier ou ce code n\'est pas un profil English Coach.'); return false; }
  if (obj.kind === 'backup') return importBackup(obj);
  if (obj.kind === 'invite') return applyInvite(obj);
  toast('Profil non reconnu.'); return false;
}
function handleImportText(text) {
  let obj;
  try { obj = parseCode(text); } catch (e) { toast('Code ou fichier illisible. Vérifie que tu as tout copié.'); return false; }
  return handleImportObject(obj);
}
function refreshAfterImport(msg) {
  toast(msg);
  if (window.__ecNoReload) return;
  setTimeout(() => location.reload(), 900);
}

/* Lien ou QR code ouvert sur ce téléphone. Sur iPhone, l'appli installée a son propre stockage, séparé de Safari. */
function initProfile() {
  renderKeyWizards();
  renderQrTab();
  const hash = location.hash || '';
  if (!hash.startsWith('#ecp=')) return;
  const code = hash.slice(5);
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ignore */ }
  let inv; try { inv = parseCode(code); } catch (e) { toast('Lien d\'invitation illisible.'); return; }
  if (!inv || inv.app !== 'english-coach') return;
  if (isIOS() && !isStandalone()) { showInviteBanner(inv, code); return; }
  setTimeout(() => handleImportObject(inv), 300);
}
function showInviteBanner(inv, code) {
  const home = document.getElementById('tab-home'); if (!home) return;
  const b = h('div', 'banner');
  b.appendChild(h('p', '', 'Invitation reçue. Sur iPhone, installe d\'abord l\'appli : touche Partager puis « Sur l\'écran d\'accueil ». Ouvre-la ensuite depuis l\'icône, va dans Réglages, section Profil, et colle ce code dans « Importer ».'));
  const cp = h('button', '', 'Copier le code');
  cp.onclick = async () => { try { await navigator.clipboard.writeText(INVITE_PREFIX + code.replace(/^ECP1\./, '')); toast('Code copié.'); } catch (e) { toast('Copie impossible : sélectionne le code ci-dessous.'); } };
  b.appendChild(cp);
  const ta = h('textarea'); ta.readOnly = true; ta.value = code.startsWith(INVITE_PREFIX) ? code : INVITE_PREFIX + code; ta.style.marginTop = '8px';
  b.appendChild(ta);
  home.insertBefore(b, home.firstChild);
}

/* ====================== INTERFACE ====================== */

function checkRow(label, checked, hint) {
  const row = h('div', 'row'); const d = h('div'); d.appendChild(document.createTextNode(label));
  if (hint) d.appendChild(h('small', '', hint));
  const cb = h('input'); cb.type = 'checkbox'; cb.className = 'sw'; cb.checked = checked;
  row.append(d, cb); return { row, cb };
}

async function shareOrDownload(name, text) {
  try {
    const file = new File([text], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); return 'share'; }
  } catch (e) { if (e && e.name === 'AbortError') return 'cancel'; }
  try {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000); return 'download';
  } catch (e) { return 'fail'; }
}

function renderProfile() {
  const box = document.getElementById('profileBox'); if (!box) return;
  box.innerHTML = '';

  /* Sauvegarde */
  const bk = h('div', 'note');
  bk.appendChild(h('h3', '', 'Sauvegarder mon profil'));
  bk.appendChild(h('p', 'sub', 'Crée un fichier pour retrouver ton profil sur un autre téléphone ou après une réinstallation.'));
  const o1 = checkRow('Réglages et interlocuteur', true), o2 = checkRow('Mémoire de ton interlocuteur', true), o3 = checkRow('Carnet, séances et tests de niveau', true), o4 = checkRow('Inclure ma clé API', false, 'Quiconque a le fichier peut alors la lire.');
  bk.append(o1.row, o2.row, o3.row, o4.row);
  const ex = h('button', 'btn pri', 'Exporter la sauvegarde');
  ex.onclick = async () => {
    const b = buildBackup({ settings: o1.cb.checked, memory: o2.cb.checked, history: o3.cb.checked, key: o4.cb.checked });
    if (!Object.keys(b.data).length) { toast('Coche au moins une case.'); return; }
    const r = await shareOrDownload('english-coach-profil-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(b));
    toast(r === 'fail' ? 'Export impossible.' : r === 'cancel' ? 'Export annulé.' : 'Sauvegarde créée.');
  };
  bk.appendChild(ex);
  box.appendChild(bk);

  /* Import */
  const im = h('div', 'note');
  im.appendChild(h('h3', '', 'Importer un profil'));
  im.appendChild(h('p', 'sub', 'Choisis un fichier de sauvegarde, ou colle un code ou un lien d\'invitation.'));
  const fi = h('input'); fi.type = 'file'; fi.accept = '.json,application/json';
  fi.onchange = async () => { const f = fi.files && fi.files[0]; if (!f) return; try { handleImportText(await f.text()); } catch (e) { toast('Fichier illisible.'); } fi.value = ''; };
  const ta = h('textarea'); ta.placeholder = 'Colle ici un code (ECP1...) ou un lien d\'invitation';
  const go = h('button', 'btn', 'Importer le code'); go.onclick = () => { if (ta.value.trim()) handleImportText(ta.value); else toast('Colle d\'abord un code.'); };
  im.append(fieldOf('Fichier de sauvegarde', fi), ta, go);
  box.appendChild(im);

}

/* Onglet QR : réservé à l'édition propriétaire. Dans la version invités, onglet et contenu sont retirés. */
function isOwner() { return typeof EC_EDITION !== 'undefined' && EC_EDITION === 'owner'; }
function renderQrTab() {
  const tab = document.getElementById('tab-qr'), btn = document.getElementById('qrTabBtn');
  if (!isOwner()) { if (tab) tab.remove(); if (btn) btn.remove(); return; }
  const box = document.getElementById('qrBox'); if (!box) return;
  box.innerHTML = '';
  const iv = h('div', 'note');
  iv.appendChild(h('h3', '', 'Accès gratuit pour un proche'));
  iv.appendChild(h('p', 'sub', 'Fais scanner ce QR code avec l\'appareil photo, sur iPhone ou Android. La personne installe l\'appli et obtient son propre profil vierge. Elle crée sa clé Google gratuite avec son compte, donc ton quota n\'est jamais utilisé, et rien de ton profil n\'est copié.'));
  const out = h('div');
  iv.appendChild(out);
  box.appendChild(iv);
  try { renderInvite(out, buildInvite({})); } catch (e) { out.appendChild(h('p', 'sub', 'Invitation indisponible.')); }
}

function renderInvite(out, inv) {
  out.innerHTML = '';
  const code = inviteCode(inv), link = inviteLink(code);
  const qrBox = h('div'); qrBox.style.cssText = 'background:#fff;padding:10px;border-radius:12px;width:min(100%,260px);margin:12px auto 6px';
  try { const qr = qrcode(0, 'L'); qr.addData(link); qr.make(); qrBox.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); }
  catch (e) { qrBox.style.background = 'transparent'; qrBox.appendChild(h('p', 'sub', 'QR code indisponible : utilise le lien ou le code.')); }
  out.appendChild(qrBox);
  out.appendChild(h('p', 'sub', 'La personne scanne ce QR code avec l\'appareil photo, ou reçoit le lien. Sur iPhone : elle ouvre le lien, installe l\'appli (Partager, Sur l\'écran d\'accueil), l\'ouvre depuis l\'icône puis colle le code dans Réglages, section Profil. Sur Android : elle ouvre le lien dans Chrome, installe l\'appli depuis le menu, et l\'invitation s\'applique.'));
  const row = h('div', 'frow');
  const sh = h('button', 'btn', 'Partager le lien');
  sh.onclick = async () => { try { if (navigator.share) await navigator.share({ title: 'English Coach', text: 'Invitation English Coach', url: link }); else { await navigator.clipboard.writeText(link); toast('Lien copié.'); } } catch (e) { /* annulé */ } };
  const cl = h('button', 'btn', 'Copier le lien'); cl.onclick = async () => { try { await navigator.clipboard.writeText(link); toast('Lien copié.'); } catch (e) { toast('Copie impossible.'); } };
  const cc = h('button', 'btn', 'Copier le code'); cc.onclick = async () => { try { await navigator.clipboard.writeText(code); toast('Code copié.'); } catch (e) { toast('Copie impossible.'); } };
  row.append(sh, cl, cc); out.appendChild(row);
  S.lastInvite = { code, link };
}


/* ====================== CRÉATION GUIDÉE DE LA CLÉ ====================== */

const AISTUDIO_KEYS = 'https://aistudio.google.com/api-keys';

async function checkKey(k) {
  try {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1&key=' + encodeURIComponent(k));
    if (r.ok) return 'ok';
    if (r.status === 400 || r.status === 401 || r.status === 403) return 'bad';
    return 'unknown';
  } catch (e) { return 'unknown'; }
}

async function saveNewKey(raw, status) {
  const k = String(raw || '').trim().replace(/^["']|["']$/g, '');
  if (!validKey(k)) { status.textContent = 'Ce texte ne ressemble pas à une clé. Copie bien la clé en entier depuis Google AI Studio.'; return false; }
  status.textContent = 'Vérification de la clé...';
  const res = await checkKey(k);
  if (res === 'bad') { status.textContent = 'Google refuse cette clé. Vérifie que tu as copié la clé entière et que le projet est actif.'; return false; }
  S.settings.apiKey = k; store.set('ec_settings', S.settings);
  S.stage = 0;
  const inp = document.getElementById('apiKey'); if (inp) inp.value = k;
  if (typeof updateBanner === 'function') updateBanner();
  renderKeyWizards();
  toast(res === 'ok' ? 'Clé enregistrée et vérifiée.' : 'Clé enregistrée (non vérifiée, pas de réseau ?).');
  return true;
}

function buildKeyWizard() {
  const box = h('div', 'wiz');
  box.style.marginTop = '10px';
  if (validKey(S.settings.apiKey)) {
    box.appendChild(h('p', 'sub', 'Clé API enregistrée sur ce téléphone.'));
    return box;
  }
  box.appendChild(h('p', '', 'Crée ta clé gratuite en deux gestes, avec ton propre compte Google.'));
  const b1 = h('button', 'btn pri', '1. Ouvrir Google AI Studio');
  b1.onclick = () => { try { window.open(AISTUDIO_KEYS, '_blank', 'noopener'); } catch (e) { location.href = AISTUDIO_KEYS; } status.textContent = 'Connecte-toi, touche « Créer une clé API », puis copie la clé et reviens ici.'; };
  const status = h('p', 'sub', 'Une page Google s\'ouvre : connecte-toi, touche « Créer une clé API », puis copie-la.');
  const b2 = h('button', 'btn pri', '2. Coller ma clé');
  b2.onclick = async () => {
    let t = '';
    try { t = await navigator.clipboard.readText(); } catch (e) { /* refusé ou indisponible */ }
    if (t && validKey(t.trim())) { await saveNewKey(t, status); return; }
    status.textContent = t ? 'Le presse-papiers ne contient pas de clé. Copie la clé dans Google AI Studio puis réessaie.' : 'Lecture du presse-papiers impossible : colle la clé dans le champ ci-dessous.';
  };
  const ta = h('input'); ta.type = 'text'; ta.placeholder = 'ou colle la clé ici'; ta.autocomplete = 'off'; ta.autocapitalize = 'off'; ta.spellcheck = false; ta.style.marginTop = '8px';
  ta.addEventListener('input', () => { const v = ta.value.trim(); if (validKey(v)) saveNewKey(v, status); });
  const row = h('div', 'frow'); row.append(b1, b2);
  box.append(row, status, ta);
  return box;
}

function renderKeyWizards() {
  for (const id of ['keyWizard', 'keyWizardSettings']) {
    const el = document.getElementById(id); if (!el) continue;
    el.innerHTML = ''; el.appendChild(buildKeyWizard());
  }
}
