'use strict';
/* Évaluation du niveau (alignée sur le CECRL) et suivi de la progression.
   Ce fichier doit être chargé AVANT app.js. */

/* ====================== ÉCHELLE ====================== */

/* Échelle 0 à 100 ancrée sur le CECRL : A1 = 15, A2 = 30, B1 = 45, B2 = 60, C1 = 75, C2 = 90. */
const CEFR_BANDS = [[0, 22.5, 'A1'], [22.5, 37.5, 'A2'], [37.5, 52.5, 'B1'], [52.5, 67.5, 'B2'], [67.5, 82.5, 'C1'], [82.5, 101, 'C2']];
const CEFR_ANCHOR = { A1: 15, A2: 30, B1: 45, B2: 60, C1: 75, C2: 90 };

function levelLabel(x) {
  x = Math.max(0, Math.min(100, Number(x) || 0));
  for (const [lo, hi, l] of CEFR_BANDS) {
    if (x >= lo && x < hi) { const f = (x - lo) / (hi - lo); return (f >= 2 / 3 && l !== 'C2') ? l + '+' : l; }
  }
  return 'C2';
}

const ASSESS_CRITERIA = [
  { id: 'range', label: 'Étendue du vocabulaire', w: 15 },
  { id: 'accuracy', label: 'Correction grammaticale', w: 15 },
  { id: 'fluency', label: 'Aisance et débit', w: 15 },
  { id: 'coherence', label: 'Cohérence du discours', w: 10 },
  { id: 'interaction', label: 'Interaction', w: 10 },
  { id: 'pronunciation', label: 'Prononciation et intelligibilité', w: 15 },
  { id: 'listening', label: 'Compréhension orale', w: 20 }
];

const EXAMINERS = {
  en: { id: 'examiner', emoji: '📝', name: 'Sarah', voice: 'Kore', role: 'a professional, neutral and kind English speaking examiner', trait: 'calm, neutral, encouraging but never evaluative during the test', accent: { en: 'standard British' }, say: 'standard British English' },
  es: { id: 'examiner', emoji: '📝', name: 'Lucía', voice: 'Kore', role: 'a professional, neutral and kind Spanish speaking examiner', trait: 'calm, neutral, encouraging but never evaluative during the test', accent: { es: 'standard neutral Castilian' }, say: 'standard neutral Spanish (Castilian, clear and easy to follow)' }
};
EXAMINERS.de = { id: 'examiner', emoji: '📝', name: 'Anna', voice: 'Kore', role: 'a professional, neutral and kind German speaking examiner', trait: 'calm, neutral, encouraging but never evaluative during the test', accent: { de: 'standard High German' }, say: 'standard High German (clear and neutral, easy to follow)' };
EXAMINERS.it = { id: 'examiner', emoji: '📝', name: 'Giulia', voice: 'Kore', role: 'a professional, neutral and kind Italian speaking examiner', trait: 'calm, neutral, encouraging but never evaluative during the test', accent: { it: 'standard Italian' }, say: 'standard neutral Italian (clear and easy to follow)' };
function examinerFor(lk) { return EXAMINERS[lk] || EXAMINERS.en; }

/* Données propres à chaque langue : mots courants, suffixes, descripteurs, examens officiels. */
const LANG_DATA = {
  en: { idioms: 'idioms or phrasal verbs', exams: ['Linguaskill', 'TOEIC', 'IELTS', 'Cambridge', 'Autre'], officialText: 'Linguaskill, TOEIC ou IELTS', suffixes: ['s', 'es', 'ed', 'd', 'ing', 'ly'], rubricNote: '' },
  es: { idioms: 'idioms or subjunctive constructions', exams: ['DELE', 'SIELE', 'Cervantes', 'Autre'], officialText: 'DELE ou SIELE (Instituto Cervantes)', suffixes: ['s', 'es', 'os', 'as', 'a', 'o', 'mente'],
    rubricNote: 'Spanish specifics: typical B1 errors are gender and number agreement, ser versus estar, por versus para, preterite versus imperfect and missing or wrong prepositions; B2 shows good control of past tenses, the conditional and the present subjunctive in common triggers; C1 uses the imperfect subjunctive, compound tenses and idiomatic connectors accurately. Do not penalise regional vocabulary or the dropping of subject pronouns.' }
};
LANG_DATA.de = { idioms: 'idioms or separable and modal verb constructions', exams: ['Goethe', 'TestDaF', 'telc', 'ÖSD', 'Autre'], officialText: 'Goethe-Zertifikat, TestDaF ou telc', suffixes: ['e', 'en', 'er', 'es', 'em', 's', 'n', 't', 'te', 'st'],
  rubricNote: 'German specifics: typical B1 errors are case (accusative versus dative), noun gender, verb position (verb second, verb final in subordinate clauses), adjective endings and perfect versus preterite; B2 shows good control of word order, the passive and Konjunktiv II in common uses; C1 uses Konjunktiv I and II, participial constructions and idiomatic connectors accurately. Do not penalise Swiss or Austrian variants or the use of the perfect tense in speech.' };
LANG_DATA.it = { idioms: 'idioms or subjunctive constructions', exams: ['CILS', 'CELI', 'PLIDA', 'Autre'], officialText: 'CILS, CELI ou PLIDA', suffixes: ['i', 'e', 'a', 'o', 'mente'],
  rubricNote: 'Italian specifics: typical B1 errors are gender and number agreement, prepositions (a, in, di, da), articles, passato prossimo versus imperfetto and the choice of essere or avere; B2 shows good control of the conditional and the congiuntivo in common triggers; C1 uses the congiuntivo imperfetto, pronoun combinations and idiomatic connectors accurately. Do not penalise regional variants or the dropping of subject pronouns.' };

const RUBRIC = [
  'RUBRIC (CEFR qualitative aspects of spoken language use). Score each criterion on a 0 to 100 scale anchored on the CEFR: 15 = A1, 30 = A2, 45 = B1, 60 = B2, 75 = C1, 90 = C2, and interpolate (for example 52 = high B1). Score what the learner sustains most of the time, NOT their best moment. When unsure between two values, choose the lower one.',
  '- range (vocabulary): A2 basic words and memorised phrases for everyday needs; B1 enough words to cope on familiar topics with hesitation and circumlocution; B2 clear descriptions and viewpoints on most general topics with some complex sentences; C1 broad repertoire, expresses ideas on general, professional or leisure topics without holding back, idiomatic.',
  '- accuracy (grammar): A2 simple structures right but basic errors persist; B1 reasonably accurate with routine patterns, errors in tenses, articles or prepositions but meaning clear; B2 good control, errors rarely cause misunderstanding and many are self-corrected; C1 consistently high accuracy, errors rare and hard to spot.',
  '- fluency: A2 very short utterances with many pauses, false starts and reformulations; B1 keeps going intelligibly despite visible pauses for planning and repair, especially in longer stretches; B2 fairly even pace with some hesitation and few long pauses; C1 spontaneous and nearly effortless.',
  '- coherence: A2 links with simple connectors (and, but, because); B1 links short points into a linear sequence; B2 uses a limited set of cohesive devices, long contributions may feel somewhat disjointed; C1 clear, well-structured speech with controlled organisation and a range of connectors.',
  '- interaction: A2 answers questions, rarely sustains conversation alone; B1 starts, maintains and closes simple conversations on familiar topics and checks understanding; B2 takes turns, keeps discussions going, checks understanding and invites others in; C1 links contributions skilfully, uses set phrases to hold the floor.',
  '- pronunciation (intelligibility and phonological control, assessed from how the speech sounds): A2 understandable with some effort from the listener; B1 clearly intelligible despite a foreign accent and occasional mispronunciations; B2 clear natural pronunciation and intonation; C1 varied intonation and stress used to convey nuance.',
  '- listening: from the comprehension questions. Passage 1 (B1) understood: about 45 to 50. Passage 2 (B2) also understood: about 60 to 65. Passage 3 (C1) also understood: about 75 to 80. Below 40 if the B1 passage was not understood.'
].join('\n');

const ASSESS_FUNCTIONS = [
  { name: 'submit_assessment',
    description: 'Submit the final assessment ONLY after the whole test is finished. All scores use the 0-100 scale anchored on the CEFR (15 A1, 30 A2, 45 B1, 60 B2, 75 C1, 90 C2).',
    parameters: { type: 'OBJECT', properties: {
      scores: { type: 'OBJECT', properties: {
        range: { type: 'NUMBER' }, accuracy: { type: 'NUMBER' }, fluency: { type: 'NUMBER' }, coherence: { type: 'NUMBER' },
        interaction: { type: 'NUMBER' }, pronunciation: { type: 'NUMBER' }, listening: { type: 'NUMBER' } } },
      evidence: { type: 'OBJECT', description: 'For each production criterion two short EXACT quotes (3 to 12 words) from the learner, copied as spoken including mistakes. Never invent quotes.', properties: {
        range: { type: 'ARRAY', items: { type: 'STRING' } }, accuracy: { type: 'ARRAY', items: { type: 'STRING' } },
        fluency: { type: 'ARRAY', items: { type: 'STRING' } }, coherence: { type: 'ARRAY', items: { type: 'STRING' } },
        interaction: { type: 'ARRAY', items: { type: 'STRING' } }, pronunciation: { type: 'ARRAY', items: { type: 'STRING' } } } },
      listening_detail: { type: 'STRING', description: 'In French: which comprehension questions were answered correctly at each level.' },
      highest_level_sustained: { type: 'STRING', description: 'CEFR level sustained, for example B1 or B2.' },
      confidence: { type: 'STRING', description: 'low, medium or high' },
      strengths: { type: 'ARRAY', items: { type: 'STRING' }, description: 'In French, three at most.' },
      priorities: { type: 'ARRAY', items: { type: 'STRING' }, description: 'In French, three at most, actionable.' }
    }, required: ['scores'] } },
  { name: 'end_session',
    description: 'End the test after submit_assessment and a brief goodbye.',
    parameters: { type: 'OBJECT', properties: { reason: { type: 'STRING' } } } }
];

function rubricFor(lk) { const n = (LANG_DATA[lk] || LANG_DATA.en).rubricNote; return RUBRIC + (n ? '\n- ' + n : ''); }

const ASSESS_RECAP_TEXT = 'The learner wants to stop the test now. If you have heard less than about five minutes of the learner speaking, say briefly that the test was too short for a reliable estimate and call end_session WITHOUT submit_assessment. Otherwise score only what you observed, set confidence to low, call submit_assessment, say a short goodbye, then call end_session.';

function buildAssessmentInstruction(ctx) {
  const lk = curLang(), L = LANGUAGES[lk].name, ex = examinerFor(lk);
  let t = 'You are ' + ex.name + ', a calm, professional and kind examiner running a standardised spoken ' + L + ' level assessment aligned with the CEFR for a native French speaker. The test lasts about 12 to 15 minutes. Speak only ' + L + ', in ' + ex.say + ', at a natural but clear pace. Behave the same way every time: this test is repeated over the weeks to measure progress.\n';
  t += '\nSTRICT RULES\n';
  t += '- Never correct, teach, translate or help in French, and never reveal scores or levels during the test. If asked about the result, say it will be saved at the end. Stay warm but neutral: avoid evaluative praise, prefer "thank you", "I see", "interesting".\n';
  t += '- Keep your own turns short (one or two sentences) except for the listening passages. Ask one question at a time. Silence of several seconds is normal: if there is a long silence say once "Take your time", and if there is still nothing, simplify the question.\n';
  t += '- Adapt the difficulty: start easy and move up only while the learner copes. If the learner clearly struggles twice at a level, step back once to an easier question, then finish that part. If they cope easily, move up.\n';
  t += '- Elicit at least eight minutes of learner speech: use follow-ups such as "Why?", "Can you give an example?", "Tell me more".\n';
  t += '\nSTRUCTURE\n';
  t += 'Part 1, warm-up (about 2 minutes, A1 to A2): how they like to be called, where they live, daily routine, family, hobbies.\n';
  t += 'Part 2, personal experience (about 3 minutes, B1): a recent trip, a memorable day or a work project; past events and future plans; likes and dislikes with reasons.\n';
  t += 'Part 3, opinions and abstract topics (about 4 minutes, B2 to C1): opinions on work, technology or society with justification; advantages and disadvantages; hypotheticals ("What would you do if..."); comparing past and present; if they cope well, ask them to defend a view and answer a counter-argument on a social or economic issue.\n';
  t += 'Part 4, listening (about 3 minutes): tell two or three short spoken passages from memory, never reading a list. Passage 1 at B1 level (about 60 words, an everyday story at natural speed). Passage 2 at B2 level (about 90 words, more complex information with a few ' + LANG_DATA[lk].idioms + '). Passage 3 at C1 level only if the first two went well (about 110 words, an implicit point, less common vocabulary). Invent new passages on different topics each time. After each passage ask two questions: one about a detail and one requiring inference or the speaker\'s attitude. Repeat a passage only once and only if asked. Keep track of which questions were answered correctly. If time allows, ask the learner to summarise one passage in their own words.\n';
  t += 'Finally thank the learner, say the results are saved, call submit_assessment, then call end_session.\n';
  t += '\n' + rubricFor(lk) + '\n';
  t += '\nSCORING RULES\n- Give exact learner quotes as evidence for the six production criteria (two each, 3 to 12 words, copied as spoken with their mistakes). Never invent quotes.\n';
  t += '- confidence: high only if the learner spoke for more than eight minutes and the audio was clear; low if the test was short, noisy or interrupted.\n- strengths, priorities and listening_detail must be written in French.\n';
  if (ctx) t += '\nEARLIER IN THIS TEST (a short connection drop happened; continue where you stopped, never restart):\n' + ctx + '\n';
  return t;
}

/* ====================== TEXTE ET MESURES ====================== */

function normText(s) { return String(s || '').toLowerCase().replace(/[^\p{L}\p{N}' ]+/gu, ' ').replace(/\s+/g, ' ').trim(); }

function quoteVerified(q, hay) {
  const nq = normText(q);
  if (nq.length < 6) return false;
  if (hay.includes(nq)) return true;
  const w = nq.split(' ');
  if (w.length < 3) return false;
  let hit = 0, tot = 0;
  for (let i = 0; i < w.length - 1; i++) { tot++; if (hay.includes(w[i] + ' ' + w[i + 1])) hit++; }
  return tot > 0 && hit / tot >= 0.75;
}

const COMMON_WORDS = new Set(('the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us is are was were been am has had did does dont doesnt didnt im its thats yes yeah okay ok very really much many thing things lot little big great long still here where why going got let tell ask need feel try leave call again always never sometimes every too should may might must said home house family friend friends life world school week today tomorrow yesterday morning night hello hi thanks thank please sorry sure right maybe something nothing everything someone anyone man woman child children kid kids place put mean keep start show hear play run move live believe bring happen write sit stand lose pay meet include continue set learn change lead understand watch follow stop create speak read allow add spend grow open walk win offer remember love consider appear buy wait serve die send expect build stay fall cut reach remain yes no oh well so um uh er').split(' '));
const FR_WORDS = new Set('je tu il elle nous vous ils elles est pas qui une des les pour avec mais comment dit ça suis sont dans sur mon ma mes très aussi donc alors oui bonjour merci pourquoi quoi c\'est j\'ai n\'est parce quand être avoir fait faire peux veux voudrais comprends compris mot phrase anglais espagnol'.split(' '));

function tokenize(s) { return (String(s || '').toLowerCase().replace(/’/g, "'").match(/[\p{L}']+/gu) || []); }

function isFrenchLine(text) {
  const w = tokenize(text); if (w.length < 3) return false;
  const fr = w.filter(x => FR_WORDS.has(x)).length;
  return fr >= 2 && fr / w.length >= 0.25;
}

const COMMON_ES = new Set(('el la los las un una unos unas de del a al en y o u e pero que no sí si como cuando donde porque por para con sin sobre entre desde hasta muy más menos tan tanto mucho mucha muchos muchas poco poca algo nada todo toda todos todas otro otra otros otras mismo misma este esta estos estas ese esa esos esas eso esto aquello aquí allí ahí ya aún todavía también tampoco siempre nunca veces ahora luego después antes hoy ayer mañana noche día días año años semana mes vez cosa cosas gente persona personas hombre mujer niño niña niños niñas casa familia amigo amiga amigos amigas trabajo vida mundo país ciudad yo tú él ella usted nosotros nosotras vosotros ellos ellas me te se nos os lo le les mi mis tu tus su sus nuestro nuestra es son era eran fue fueron soy eres somos está están estaba estaban estoy estás estamos ser estar haber hay había hubo he has ha hemos han tener tengo tienes tiene tenemos tienen tenía hacer hago haces hace hacemos hacen hizo ir voy vas va vamos van iba fui decir digo dices dice dicen dijo poder puedo puedes puede podemos pueden podía querer quiero quieres quiere queremos quieren quería saber sé sabes sabe sabemos saben ver veo ves ve vemos ven visto dar doy da dan dio venir vengo viene vienen pensar pienso piensa creo cree creer parecer parece llegar llevar poner pongo pone seguir sigo sigue encontrar hablar hablo habla hablamos comer come vivir vivo vive trabajar trabaja gustar gusta gustan bien mal bueno buena buenos buenas malo mala grande pequeño pequeña nuevo nueva primero primera último última mejor peor mayor menor claro verdad entonces así qué quién cuál cuánto cómo dónde cuándo hola gracias favor perdón vale oye pues eh mm um').split(' '));
const COMMON_DE = new Set(('der die das den dem des ein eine einen einem einer eines und oder aber doch denn weil dass wenn als wie wo wer was wann warum wieso ob nicht kein keine keinen kaum nur auch noch schon sehr ganz so zu zum zur von vom mit nach bei aus auf an am im in ins für über unter vor hinter neben zwischen durch gegen ohne um bis seit ich du er sie es wir ihr mich dich ihn uns euch mein meine meinen meinem dein deine sein seine ihre unser unsere hier da dort jetzt heute gestern morgen immer nie oft manchmal wieder dann danach vorher noch mehr weniger viel viele wenig alle alles etwas nichts jemand niemand man sein bin bist ist sind seid war waren gewesen haben habe hast hat habt hatte hatten gehabt werden werde wirst wird wurde wurden geworden können kann kannst könnte müssen muss musst musste wollen will willst wollte sollen soll sollte dürfen darf mögen mag möchte möchten machen mache macht gemacht gehen gehe geht ging gegangen kommen komme kommt kam gekommen sagen sage sagt sagte gesagt geben gibt gab sehen sehe sieht sah wissen weiß wusste denken denke glaube glauben finden finde nehmen nimm bleiben bleibe bleibt leben lebe wohnen wohne arbeiten arbeite arbeit sprechen spreche spricht essen trinken gut besser beste schlecht groß klein neu alt jung schön richtig falsch wichtig ja nein doch bitte danke hallo tschüss entschuldigung okay genau natürlich vielleicht eigentlich also mal halt eben tag tage jahr jahre woche monat zeit mal ding dinge mensch menschen leute mann frau kind kinder haus familie freund freunde leben welt land stadt wasser geld ähm äh hm').split(' '));
const COMMON_IT = new Set(('il lo la i gli le un uno una di a da in con su per tra fra e ed o ma però anche perché se che come quando dove chi cosa quale quanto non né più meno molto poco troppo tanto tutto tutti tutta tutte niente nulla qualcosa qualcuno nessuno ogni altro altra altri altre stesso questo questa questi queste quello quella quelli quelle già ancora sempre mai spesso qualche volta ora adesso oggi ieri domani dopo prima poi allora quindi così sì no io tu lui lei noi voi loro mi ti si ci vi lo la li le mio mia miei mie tuo tua suo sua nostro nostra essere sono sei è siamo siete era erano stato stata avere ho hai ha abbiamo avete hanno aveva avuto fare faccio fai fa facciamo fanno fatto andare vado vai va andiamo vanno venire vengo viene dire dico dici dice detto potere posso puoi può possiamo possono volere voglio vuoi vuole vogliamo vogliono dovere devo devi deve dobbiamo sapere so sai sa sappiamo vedere vedo vede visto dare do dà dato stare sto stai sta stiamo pensare penso pensa credere credo crede parlare parlo parla mangiare vivere vivo vive abitare abito lavorare lavoro lavora bene male meglio peggio buono buona buoni buone grande piccolo piccola nuovo nuova vecchio giovane bello bella giusto sbagliato importante grazie prego scusa scusi ciao salve certo naturalmente forse davvero giorno giorni anno anni settimana mese tempo cosa cose persona persone uomo donna bambino bambina bambini casa famiglia amico amica amici vita mondo paese città acqua soldi ehm beh boh allora ecco').split(' '));
const COMMON_BY_LANG = { en: COMMON_WORDS, es: COMMON_ES, de: COMMON_DE, it: COMMON_IT };

function isCommon(w, lk) {
  lk = lk || 'en';
  const set = COMMON_BY_LANG[lk] || COMMON_WORDS, sufs = (LANG_DATA[lk] || LANG_DATA.en).suffixes;
  w = w.replace(/'/g, '');
  if (set.has(w)) return true;
  for (const suf of sufs) if (w.endsWith(suf) && set.has(w.slice(0, -suf.length))) return true;
  return false;
}

/* Indicateurs objectifs calculés pour chaque séance à partir de la transcription et du chronométrage du micro. */
function computeMetrics(sess, act) {
  const user = sess.transcript.filter(l => l.who === 'user');
  const ai = sess.transcript.filter(l => l.who === 'ai');
  const enLines = user.filter(l => !isFrenchLine(l.text));
  const tokens = enLines.flatMap(l => tokenize(l.text)).filter(w => /\p{L}/u.test(w));
  const words = tokens.length;
  const types = new Set(tokens).size;
  const aiWords = ai.flatMap(l => tokenize(l.text)).length;
  const content = tokens.filter(w => w.length >= 3);
  const lk = sess.lang || 'en';
  const adv = content.filter(w => !isCommon(w, lk)).length;
  const m = {
    words, turns: enLines.length,
    avgTurn: enLines.length ? words / enLines.length : 0,
    guiraud: words ? types / Math.sqrt(words) : 0,
    advancedPct: content.length ? 100 * adv / content.length : 0,
    frenchPct: user.length ? 100 * (user.length - enLines.length) / user.length : 0,
    talkShare: (words + aiWords) ? 100 * words / (words + aiWords) : 0,
    minutes: Math.max(0, (Date.now() - new Date(sess.startedAt).getTime()) / 60000)
  };
  if (act && act.speechMs > 8000 && words >= 20) {
    const sp = act.speechMs / 60000;
    m.wpm = words / sp;
    m.pausesPerMin = act.pauses / sp;
    m.longPausesPerMin = act.longPauses / sp;
    m.latencyMs = act.latCount ? act.latSum / act.latCount : 0;
  }
  return m;
}

/* ====================== ÉVALUATION ====================== */

function processAssessment(a) {
  const sess = S.session;
  const sc = a.scores || {}, ev = a.evidence || {};
  const learnerText = normText(sess.transcript.filter(l => l.who === 'user').map(l => l.text).join(' ') + ' ' + (S.cur.user || ''));
  const learnerWords = learnerText ? learnerText.split(' ').length : 0;
  const criteria = {}; let sum = 0, wsum = 0, q = 0, ok = 0;
  for (const c of ASSESS_CRITERIA) {
    const v = Number(sc[c.id]);
    if (!isFinite(v)) continue;
    const score = Math.max(0, Math.min(100, v));
    const quotes = (c.id === 'listening' ? [] : (ev[c.id] || [])).slice(0, 3).map(x => { const good = quoteVerified(x, learnerText); q++; if (good) ok++; return { q: String(x), ok: good }; });
    criteria[c.id] = { score, level: levelLabel(score), evidence: quotes };
    sum += score * c.w; wsum += c.w;
  }
  if (!wsum) return null;
  const overall = sum / wsum;
  const verifiedRatio = q ? ok / q : 0;
  let confidence = ['low', 'medium', 'high'].includes(String(a.confidence).toLowerCase()) ? String(a.confidence).toLowerCase() : 'medium';
  const reasons = [];
  if (learnerWords < 250) { confidence = 'low'; reasons.push('peu de parole enregistrée'); }
  if (q && verifiedRatio < 0.5) { confidence = 'low'; reasons.push('citations de preuve peu vérifiables'); }
  if (!q) { confidence = 'low'; reasons.push('aucune preuve citée'); }
  const res = {
    id: Date.now(), lang: sess.lang || 'en', date: new Date().toISOString(), overall, level: levelLabel(overall), criteria,
    listeningDetail: String(a.listening_detail || ''), highest: String(a.highest_level_sustained || ''),
    confidence, reasons, strengths: (a.strengths || []).map(String).slice(0, 3), priorities: (a.priorities || []).map(String).slice(0, 3),
    verifiedRatio, learnerWords, second: null, timing: null
  };
  const all = store.get('ec_assess', []); all.unshift(res); store.set('ec_assess', all.slice(0, 200));
  sess.assessId = res.id;
  return res;
}

function updateAssessment(id, fn) {
  const all = store.get('ec_assess', []); const a = all.find(x => x.id === id);
  if (!a) return; fn(a); store.set('ec_assess', all);
}

/* Second avis indépendant sur la transcription (texte seul) : vocabulaire, grammaire, cohérence, interaction. */
async function secondOpinion(id, transcript) {
  if (!S.settings.secondOpinion) return;
  const lines = transcript.map(l => (l.who === 'user' ? 'LEARNER: ' : 'EXAMINER: ') + l.text).join('\n').slice(-9000);
  if (lines.length < 500) { updateAssessment(id, a => { a.second = { unavailable: true, why: 'transcription trop courte' }; }); return; }
  const a0 = store.get('ec_assess', []).find(x => x.id === id) || {}; const SL = (LANGUAGES[a0.lang || 'en'] || LANGUAGES.en).name;
  const prompt = 'You are an independent CEFR speaking rater. Below is an automatic transcription of a ' + SL + ' speaking test (the transcription may contain recognition errors and may have smoothed some learner mistakes, so do not penalise odd spellings). Rate ONLY the learner on four criteria from the text.\n\n' + rubricFor(a0.lang || 'en').split('\n').filter(l => /^RUBRIC|^- (range|accuracy|coherence|interaction)|^- Spanish specifics/.test(l)).join('\n') + '\n\nReturn ONLY a JSON object {"range":n,"accuracy":n,"coherence":n,"interaction":n} with numbers on the 0 to 100 scale.\n\nTRANSCRIPT:\n' + lines;
  const models = [S.settings.textModel, 'gemini-2.5-flash'].filter((m, i, arr) => m && arr.indexOf(m) === i);
  for (const m of models) {
    try {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(m) + ':generateContent?key=' + encodeURIComponent(S.settings.apiKey.trim()), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0, responseMimeType: 'application/json' } })
      });
      if (!r.ok) continue;
      const j = await r.json();
      const txt = ((((j.candidates || [])[0] || {}).content || {}).parts || []).map(p => p.text || '').join('').replace(/^```json|```$/g, '').trim();
      const o = JSON.parse(txt);
      const ids = ['range', 'accuracy', 'coherence', 'interaction'];
      if (!ids.every(k => isFinite(Number(o[k])))) continue;
      updateAssessment(id, a => {
        const mine = ids.map(k => a.criteria[k] ? a.criteria[k].score : null).filter(v => v != null);
        const theirs = ids.filter(k => a.criteria[k]).map(k => Number(o[k]));
        const diff = mine.length ? Math.abs(mine.reduce((x, y) => x + y, 0) / mine.length - theirs.reduce((x, y) => x + y, 0) / theirs.length) : null;
        a.second = { model: m, scores: o, diff, agree: diff != null && diff <= 8 };
      });
      if (typeof renderProgress === 'function') renderProgress();
      return;
    } catch (e) { /* essaie le modèle suivant */ }
  }
  updateAssessment(id, a => { a.second = { unavailable: true, why: 'modèle texte indisponible' }; });
  if (typeof renderProgress === 'function') renderProgress();
}

/* ====================== PÉRIODE ET AGRÉGATS ====================== */

function periodRange() {
  const p = S.settings.period || 'all', now = Date.now();
  if (p === 'all') return [0, Infinity];
  if (p === 'custom') {
    const f = S.settings.from ? new Date(S.settings.from + 'T00:00:00').getTime() : 0;
    const t = S.settings.to ? new Date(S.settings.to + 'T23:59:59').getTime() : Infinity;
    return [f, t];
  }
  return [now - Number(p) * 864e5, Infinity];
}
function inPeriod(iso) { const t = new Date(iso).getTime(), [a, b] = periodRange(); return t >= a && t <= b; }
function fmtDate(iso) { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }); }
function fmtDateLong(iso) { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
function mean(a) { return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0; }
function trendOf(vals) {
  if (vals.length < 3) return null;
  const k = Math.max(1, Math.floor(vals.length / 3));
  return { first: mean(vals.slice(0, k)), last: mean(vals.slice(-k)) };
}

/* ====================== DESSIN ====================== */

function h(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
function svgEl(name, attrs, text) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  return e;
}

function lineChart(series, opt) {
  const pts = series.flatMap(s => s.points);
  if (!pts.length) return null;
  const W = 320, H = 160, pl = 34, pr = 10, pt = 10, pb = 22;
  let t0 = Math.min(...pts.map(p => p.t)), t1 = Math.max(...pts.map(p => p.t));
  if (t1 === t0) { t0 -= 3 * 864e5; t1 += 3 * 864e5; }
  let y0 = opt.min != null ? opt.min : Math.min(...pts.map(p => p.v));
  let y1 = opt.max != null ? opt.max : Math.max(...pts.map(p => p.v));
  const span = opt.minSpan || 10;
  if (y1 - y0 < span) { const m = (y0 + y1) / 2; y0 = m - span / 2; y1 = m + span / 2; }
  const pad = (y1 - y0) * 0.08; y0 -= pad; y1 += pad;
  if (opt.clamp) { y0 = Math.max(opt.clamp[0], y0); y1 = Math.min(opt.clamp[1], y1); }
  const X = t => pl + (t - t0) / (t1 - t0) * (W - pl - pr);
  const Y = v => pt + (1 - (v - y0) / (y1 - y0)) * (H - pt - pb);
  const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', role: 'img' });
  for (const g of (opt.grid || [])) {
    if (g.v < y0 || g.v > y1) continue;
    svg.appendChild(svgEl('line', { x1: pl, x2: W - pr, y1: Y(g.v), y2: Y(g.v), stroke: '#2a3555', 'stroke-width': 1 }));
    svg.appendChild(svgEl('text', { x: 4, y: Y(g.v) + 4, fill: '#9aa6c7', 'font-size': 10 }, g.label));
  }
  if (!(opt.grid || []).length) {
    for (const v of [y0 + pad, (y0 + y1) / 2, y1 - pad]) {
      svg.appendChild(svgEl('line', { x1: pl, x2: W - pr, y1: Y(v), y2: Y(v), stroke: '#2a3555', 'stroke-width': 1 }));
      svg.appendChild(svgEl('text', { x: 4, y: Y(v) + 4, fill: '#9aa6c7', 'font-size': 10 }, (opt.fmt ? opt.fmt(v) : Math.round(v))));
    }
  }
  svg.appendChild(svgEl('text', { x: pl, y: H - 6, fill: '#9aa6c7', 'font-size': 10 }, fmtDate(new Date(Math.min(...pts.map(p => p.t))).toISOString())));
  svg.appendChild(svgEl('text', { x: W - pr, y: H - 6, fill: '#9aa6c7', 'font-size': 10, 'text-anchor': 'end' }, fmtDate(new Date(Math.max(...pts.map(p => p.t))).toISOString())));
  for (const s of series) {
    const sorted = s.points.slice().sort((a, b) => a.t - b.t);
    if (s.marker === 'diamond') {
      for (const p of sorted) {
        const x = X(p.t), y = Y(p.v);
        svg.appendChild(svgEl('path', { d: 'M' + x + ' ' + (y - 6) + ' L' + (x + 6) + ' ' + y + ' L' + x + ' ' + (y + 6) + ' L' + (x - 6) + ' ' + y + ' Z', fill: s.color }));
      }
      continue;
    }
    if (sorted.length > 1) svg.appendChild(svgEl('polyline', { points: sorted.map(p => X(p.t) + ',' + Y(p.v)).join(' '), fill: 'none', stroke: s.color, 'stroke-width': 2, 'stroke-linejoin': 'round' }));
    for (const p of sorted) svg.appendChild(svgEl('circle', { cx: X(p.t), cy: Y(p.v), r: 3.5, fill: s.color }));
  }
  return svg;
}

function barChart(bars, fmt) {
  if (!bars.length) return null;
  const W = 320, H = 120, pl = 8, pr = 8, pt = 14, pb = 20;
  const max = Math.max(...bars.map(b => b.v), 1);
  const bw = Math.min(34, (W - pl - pr) / bars.length - 6);
  const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', role: 'img' });
  bars.forEach((b, i) => {
    const x = pl + (i + 0.5) * (W - pl - pr) / bars.length - bw / 2, hh = (H - pt - pb) * b.v / max;
    svg.appendChild(svgEl('rect', { x, y: H - pb - hh, width: bw, height: Math.max(1, hh), rx: 3, fill: '#6ea8ff' }));
    svg.appendChild(svgEl('text', { x: x + bw / 2, y: H - pb - hh - 3, fill: '#eef2ff', 'font-size': 9, 'text-anchor': 'middle' }, fmt ? fmt(b.v) : Math.round(b.v)));
    svg.appendChild(svgEl('text', { x: x + bw / 2, y: H - 6, fill: '#9aa6c7', 'font-size': 9, 'text-anchor': 'middle' }, b.label));
  });
  return svg;
}

/* ====================== ONGLET PROGRÈS ====================== */

function section(parent, title) { parent.appendChild(h('h2', '', title)); }

function metricBlock(body, title, unit, vals, series, opt) {
  const box = h('div', 'note');
  box.appendChild(h('h3', '', title));
  if (!vals.length) { box.appendChild(h('p', 'sub', 'Pas encore assez de séances sur cette période.')); body.appendChild(box); return; }
  const tr = trendOf(vals.map(v => v.v));
  const last = vals[vals.length - 1].v;
  const f = opt.fmt || (x => x.toFixed(1));
  let line = 'Dernière séance : ' + f(last) + unit;
  if (tr) { const d = tr.last - tr.first; line += ' · début → fin de période : ' + f(tr.first) + ' → ' + f(tr.last) + unit + ' (' + (d >= 0 ? '+' : '') + f(d) + ')'; }
  box.appendChild(h('p', 'sub', line));
  const svg = lineChart([{ color: '#6ea8ff', points: vals }], Object.assign({ minSpan: opt.minSpan || 5 }, opt));
  if (svg) box.appendChild(svg);
  if (opt.help) box.appendChild(h('p', 'sub', opt.help));
  body.appendChild(box);
}

function renderProgress() {
  const body = document.getElementById('progressBody');
  if (!body) return;
  body.innerHTML = '';
  const cd = document.getElementById('customDates'); if (cd) cd.hidden = S.settings.period !== 'custom';
  const fromEl = document.getElementById('pFrom'), toEl = document.getElementById('pTo');
  if (fromEl && fromEl.value !== (S.settings.from || '')) fromEl.value = S.settings.from || '';
  if (toEl && toEl.value !== (S.settings.to || '')) toEl.value = S.settings.to || '';

  const lk = S.settings.lang || 'en', inLang = x => (x.lang || 'en') === lk, LD = LANG_DATA[lk] || LANG_DATA.en;
  const assess = store.get('ec_assess', []).filter(inLang).sort((a, b) => new Date(a.date) - new Date(b.date));
  const rangeA = assess.filter(a => inPeriod(a.date));
  const official = store.get('ec_official', []).filter(inLang).sort((a, b) => new Date(a.date) - new Date(b.date));
  const sessions = store.get('ec_sessions', []).filter(s => inLang(s) && inPeriod(s.startedAt));
  const withM = sessions.filter(s => s.metrics && s.metrics.words >= 30).slice().sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));

  /* Niveau estimé */
  section(body, 'Niveau estimé (CECRL) : ' + (LANGUAGES[lk].flag || '') + ' ' + ({ en: 'anglais', es: 'espagnol', de: 'allemand', it: 'italien' }[lk] || lk));
  const card = h('div', 'note');
  const ref = rangeA.length ? rangeA[rangeA.length - 1] : null;
  if (!ref) {
    card.appendChild(h('p', '', assess.length ? 'Aucun test de niveau sur cette période. Dernier test : ' + fmtDateLong(assess[assess.length - 1].date) + ', niveau ' + assess[assess.length - 1].level + '.' : 'Aucun test de niveau pour l\'instant. Le test dure environ 12 minutes et sert de base de référence.'));
  } else {
    const big = h('div', 'bigLevel'); big.appendChild(h('span', 'lv', ref.level)); big.appendChild(h('span', 'sc', Math.round(ref.overall) + ' / 100'));
    card.appendChild(big);
    card.appendChild(h('p', 'sub', 'Test du ' + fmtDateLong(ref.date) + ' · fiabilité : ' + ({ low: 'faible', medium: 'moyenne', high: 'bonne' }[ref.confidence] || 'moyenne') + (ref.reasons && ref.reasons.length ? ' (' + ref.reasons.join(', ') + ')' : '')));
    if (rangeA.length >= 2) {
      const d = ref.overall - rangeA[0].overall;
      card.appendChild(h('p', '', 'Évolution depuis le test du ' + fmtDateLong(rangeA[0].date) + ' : ' + (d >= 0 ? '+' : '') + d.toFixed(1) + ' points (' + rangeA[0].level + ' → ' + ref.level + ').'));
    } else {
      card.appendChild(h('p', 'sub', 'Un seul test sur la période : refais-en un dans 2 à 4 semaines pour mesurer ta progression.'));
    }
  }
  const tb = h('button', 'btn pri', 'Passer le test de niveau (≈ 12 min)'); tb.onclick = () => startSession({ mode: 'assessment' });
  card.appendChild(tb);
  card.appendChild(h('p', 'sub', 'Estimation indicative alignée sur les descripteurs du CECRL, non certifiante. Compare plutôt des tendances sur plusieurs tests que de petits écarts entre deux tests. Pour une valeur officielle : ' + LD.officialText + '.'));
  body.appendChild(card);

  /* Courbe du score global */
  if (assess.length) {
    const box = h('div', 'note');
    box.appendChild(h('h3', '', 'Score global des tests'));
    const grid = Object.keys(CEFR_ANCHOR).map(k => ({ v: CEFR_ANCHOR[k], label: k }));
    const series = [{ color: '#6ea8ff', points: rangeA.map(a => ({ t: new Date(a.date).getTime(), v: a.overall })) }];
    const offp = official.filter(o => inPeriod(o.date)).map(o => ({ t: new Date(o.date).getTime(), v: CEFR_ANCHOR[o.level] || 45 }));
    if (offp.length) series.push({ color: '#fbbf24', marker: 'diamond', points: offp });
    const svg = lineChart(series, { grid, minSpan: 30 });
    if (svg) box.appendChild(svg); else box.appendChild(h('p', 'sub', 'Aucun test sur cette période.'));
    if (offp.length) box.appendChild(h('p', 'sub', '◆ jaune : résultats officiels saisis (repères de calibrage).'));
    body.appendChild(box);
  }

  /* Critères */
  if (ref) {
    section(body, 'Détail par critère');
    const tbl = h('div', 'note');
    const first = rangeA[0];
    for (const c of ASSESS_CRITERIA) {
      const cur = ref.criteria[c.id]; if (!cur) continue;
      const row = h('div', 'crit');
      row.appendChild(h('span', 'cl', c.label));
      let right = cur.level + ' · ' + Math.round(cur.score);
      if (first && first !== ref && first.criteria[c.id]) { const d = cur.score - first.criteria[c.id].score; right += ' (' + (d >= 0 ? '+' : '') + d.toFixed(0) + ')'; }
      row.appendChild(h('span', 'cv', right));
      tbl.appendChild(row);
    }
    body.appendChild(tbl);
  }

  /* Mesures objectives par séance */
  section(body, 'Indicateurs mesurés à chaque séance');
  body.appendChild(h('p', 'sub', sessions.length + ' séance(s) sur la période, ' + Math.round(sessions.reduce((a, s) => a + ((s.metrics && s.metrics.minutes) || 0), 0)) + ' minutes au total. Ces mesures sont calculées par l\'appli à partir de ta parole, sans avis d\'IA.'));
  const pts = k => withM.filter(s => s.metrics[k] != null && isFinite(s.metrics[k])).map(s => ({ t: new Date(s.startedAt).getTime(), v: s.metrics[k] }));
  metricBlock(body, 'Longueur moyenne de tes réponses', ' mots', pts('avgTurn'), null, { minSpan: 4, help: 'Des réponses plus longues et plus développées signalent plus d\'aisance.' });
  metricBlock(body, 'Vocabulaire au-delà des mots courants', ' %', pts('advancedPct'), null, { minSpan: 6, fmt: x => x.toFixed(0), help: 'Part des mots que tu emploies qui sortent du vocabulaire de base. Indicateur approximatif.' });
  metricBlock(body, 'Richesse lexicale (indice de Guiraud)', '', pts('guiraud'), null, { minSpan: 1, fmt: x => x.toFixed(2), help: 'Variété des mots, moins sensible à la durée de parole.' });
  metricBlock(body, 'Débit de parole', ' mots/min', pts('wpm'), null, { minSpan: 20, fmt: x => x.toFixed(0), help: 'Mots par minute de parole effective, mesuré sur le micro (indicatif, dépend de la transcription).' });
  metricBlock(body, 'Pauses d\'hésitation', ' /min', pts('pausesPerMin'), null, { minSpan: 2, fmt: x => x.toFixed(1), help: 'Silences de 0,6 à 4 secondes au milieu de tes prises de parole. Moins il y en a plus l\'aisance progresse.' });
  metricBlock(body, 'Part de français dans tes phrases', ' %', pts('frenchPct'), null, { minSpan: 10, fmt: x => x.toFixed(0), min: 0, help: 'Doit baisser avec le temps (hors demandes d\'explication).' });

  /* Volume de pratique */
  const weeks = {};
  for (const s of sessions) {
    const d = new Date(s.startedAt); const day = (d.getDay() + 6) % 7; d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - day);
    const k = d.getTime(); weeks[k] = (weeks[k] || 0) + ((s.metrics && s.metrics.minutes) || 0);
  }
  const bars = Object.keys(weeks).map(Number).sort((a, b) => a - b).slice(-12).map(k => ({ v: weeks[k], label: fmtDate(new Date(k).toISOString()) }));
  if (bars.length) {
    const box = h('div', 'note'); box.appendChild(h('h3', '', 'Minutes de pratique par semaine'));
    box.appendChild(barChart(bars, x => Math.round(x))); body.appendChild(box);
  }

  /* Résultats officiels */
  section(body, 'Résultats officiels (calibrage)');
  const form = h('div', 'note');
  form.appendChild(h('p', 'sub', 'Saisis un résultat de test officiel pour comparer avec les estimations de l\'appli.'));
  const row = h('div', 'frow');
  const dt = h('input'); dt.type = 'date'; dt.value = new Date().toISOString().slice(0, 10);
  const kind = h('select'); LD.exams.forEach(k => { const o = h('option', '', k); o.value = k; kind.appendChild(o); });
  const lvl = h('select'); Object.keys(CEFR_ANCHOR).forEach(k => { const o = h('option', '', k); o.value = k; if (k === 'B1') o.selected = true; lvl.appendChild(o); });
  const add = h('button', 'btn', 'Ajouter');
  add.onclick = () => { const all = store.get('ec_official', []); all.push({ id: Date.now(), lang: lk, date: new Date(dt.value + 'T12:00:00').toISOString(), kind: kind.value, level: lvl.value }); store.set('ec_official', all); renderProgress(); };
  row.append(dt, kind, lvl, add); form.appendChild(row);
  for (const o of official.slice().reverse()) {
    const r = h('div', 'crit'); r.appendChild(h('span', 'cl', fmtDateLong(o.date) + ' · ' + o.kind)); r.appendChild(h('span', 'cv', o.level));
    const del = h('button', 'mini', '✕'); del.onclick = () => { if (confirm('Supprimer ce résultat ?')) { store.set('ec_official', store.get('ec_official', []).filter(x => x.id !== o.id)); renderProgress(); } };
    r.appendChild(del); form.appendChild(r);
  }
  body.appendChild(form);

  /* Détail des tests */
  if (assess.length) {
    section(body, 'Historique des tests');
    for (const a of assess.slice().reverse()) {
      const d = document.createElement('details');
      d.appendChild(h('summary', '', fmtDateLong(a.date) + ' · ' + a.level + ' (' + Math.round(a.overall) + ')'));
      const inner = h('div', 'note');
      if (a.strengths && a.strengths.length) { inner.appendChild(h('h3', '', 'Points forts')); const ul = h('ul'); a.strengths.forEach(s => ul.appendChild(h('li', '', s))); inner.appendChild(ul); }
      if (a.priorities && a.priorities.length) { inner.appendChild(h('h3', '', 'À travailler en priorité')); const ul = h('ul'); a.priorities.forEach(s => ul.appendChild(h('li', '', s))); inner.appendChild(ul); }
      if (a.listeningDetail) { inner.appendChild(h('h3', '', 'Compréhension orale')); inner.appendChild(h('p', '', a.listeningDetail)); }
      inner.appendChild(h('h3', '', 'Preuves citées (✓ retrouvées dans ta transcription)'));
      for (const c of ASSESS_CRITERIA) {
        const cr = a.criteria[c.id]; if (!cr || !cr.evidence.length) continue;
        inner.appendChild(h('p', 'sub', c.label + ' : ' + cr.level));
        const ul = h('ul'); cr.evidence.forEach(e => ul.appendChild(h('li', '', (e.ok ? '✓ ' : '? ') + '« ' + e.q + ' »'))); inner.appendChild(ul);
      }
      if (a.timing) inner.appendChild(h('p', 'sub', 'Mesures objectives pendant le test : ' + (a.timing.wpm ? Math.round(a.timing.wpm) + ' mots/min' : 'n/a') + (a.timing.pausesPerMin != null ? ' · ' + a.timing.pausesPerMin.toFixed(1) + ' pauses/min' : '') + (a.timing.latencyMs ? ' · délai de réponse moyen ' + (a.timing.latencyMs / 1000).toFixed(1) + ' s' : '') + '.'));
      if (a.second && !a.second.unavailable) inner.appendChild(h('p', 'sub', 'Second avis indépendant (texte, ' + a.second.model + ') : écart moyen de ' + (a.second.diff != null ? a.second.diff.toFixed(1) : '?') + ' points avec l\'examinateur sur vocabulaire, grammaire, cohérence et interaction : ' + (a.second.agree ? 'résultats cohérents.' : 'écart notable, prends ce test avec prudence.')));
      else if (a.second && a.second.unavailable) inner.appendChild(h('p', 'sub', 'Second avis indisponible (' + (a.second.why || 'erreur') + ').'));
      else inner.appendChild(h('p', 'sub', 'Second avis en cours ou non demandé.'));
      d.appendChild(inner); body.appendChild(d);
    }
  }
}

function progressReport() {
  const lines = [];
  for (const a of store.get('ec_assess', []).filter(x => (x.lang || 'en') === (S.settings.lang || 'en')).sort((x, y) => new Date(x.date) - new Date(y.date))) {
    lines.push(fmtDateLong(a.date) + ' : ' + a.level + ' (' + Math.round(a.overall) + '/100), fiabilité ' + a.confidence);
    for (const c of ASSESS_CRITERIA) if (a.criteria[c.id]) lines.push('  ' + c.label + ' : ' + a.criteria[c.id].level + ' (' + Math.round(a.criteria[c.id].score) + ')');
  }
  return lines.join('\n');
}

function initProgress() {
  const f = document.getElementById('pFrom'), t = document.getElementById('pTo');
  if (f) f.onchange = () => { S.settings.from = f.value; store.set('ec_settings', S.settings); renderProgress(); };
  if (t) t.onchange = () => { S.settings.to = t.value; store.set('ec_settings', S.settings); renderProgress(); };
  const tb = document.getElementById('testBtn'); if (tb) tb.onclick = () => startSession({ mode: 'assessment' });
  const ex = document.getElementById('copyReport');
  if (ex) ex.onclick = async () => { try { await navigator.clipboard.writeText(progressReport()); toast('Rapport copié.'); } catch (e) { toast('Copie impossible.'); } };
  renderProgress();
}
