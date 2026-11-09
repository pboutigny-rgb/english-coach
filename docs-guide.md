# English Coach : guide de mise en route

Application web installable sur téléphone (PWA) pour t'entraîner à l'anglais oral en conversation naturelle. Gratuite : elle utilise ta clé gratuite Gemini et héberge tout chez toi.

## 1. Obtenir la clé gratuite (2 minutes)

1. Va sur https://aistudio.google.com/apikey avec ton compte Google.
2. Crée une clé API et copie-la.
3. Garde-la pour l'étape 3. Elle sera enregistrée uniquement dans ton téléphone.

## 2. Mettre l'application en ligne gratuitement (5 minutes)

Le micro n'est autorisé par les navigateurs que sur une adresse en HTTPS. Choisis une option :

**Option la plus simple : Netlify Drop**
1. Ouvre https://app.netlify.com/drop
2. Glisse-dépose le dossier `english-coach` décompressé.
3. Tu obtiens une adresse en https. Elle est publique mais sans ta clé : personne ne peut s'en servir sans la saisir lui-même.

**Alternatives** : GitHub Pages ou Cloudflare Pages (même principe, dépôt avec ces fichiers à la racine).

## 3. Installer sur le téléphone

- **iPhone** : ouvre l'adresse dans Safari, bouton Partager, "Sur l'écran d'accueil".
- **Android** : ouvre l'adresse dans Chrome, menu, "Installer l'application".

Ouvre ensuite l'application, onglet Réglages, colle ta clé, renseigne ton prénom et quelques mots sur toi (métier, famille, centres d'intérêt) pour que les conversations soient plus proches de ta vie.

## 4. Utiliser en mains libres

1. Crée ton interlocuteur la première fois (voir plus bas), éventuellement choisis un ou plusieurs sujets de départ (sinon il suit ce dont tu parles), puis touche **Commencer la séance**. C'est la seule manipulation obligatoire : les navigateurs interdisent d'ouvrir le micro sans un geste de ta part.
2. Pose le téléphone (branché, écran allumé). Tout le reste se fait à la voix :
   - "Let's talk about music" : changer de sujet
   - "Slow down" ou "speed up" : régler le débit
   - "Say that again" ou "What does ... mean?" : répéter ou expliquer
   - "Correct me now" : corrections immédiates
   - "Change your voice", "speak with an Irish accent", "be funnier", "be more patient" : il modifie sa voix, son accent ou son caractère (en français aussi : "change de voix", "sois plus drôle")
   - "Remember that..." ou "souviens-toi que..." : il l'ajoute à sa mémoire
   - "Let's wrap up" : bilan oral puis fin de séance, notes enregistrées dans le Carnet
   - En français : "Je n'ai pas compris, explique-moi ce mot" ou "Comment dit-on ... en anglais ?". Ton interlocuteur répond en français, donne l'expression anglaise à répéter puis reprend en anglais. Si tu parles anglais, il répond en anglais. Une demande explicite comme "What's the French for ..." est traitée dans la langue demandée (mode bilingue, désactivable dans Réglages).
3. Le bouton **Écran noir** économise la batterie sans éteindre la séance.

## 5. Conseils pour ton iPhone 13 Pro

- Ouvre l'adresse dans **Safari** (l'installation sur l'écran d'accueil n'est pas possible depuis un autre navigateur pour cette appli).
- Règle **Réglages, Luminosité et affichage, Verrouillage automatique sur Jamais** pendant tes séances si l'écran s'assombrit malgré la demande de l'application. Remets la valeur d'origine ensuite.
- Autorise le micro quand Safari le demande. Selon la version d'iOS la question peut revenir à chaque lancement.
- Branche le téléphone et utilise des AirPods ou un casque : le volume du haut-parleur peut être faible quand le micro est actif et le casque évite l'écho.

## 6. Mesurer son niveau et suivre ses progrès

**Passer le test** : bouton « Passer le test de niveau » sur l'écran d'accueil (environ 12 minutes). Une examinatrice (Sarah) suit toujours le même protocole : échauffement, expérience personnelle, opinions, puis compréhension orale avec de courts passages. Elle ne corrige pas et ne donne pas d'indice pendant le test.

**Ce que tu obtiens** (onglet Progrès) : un niveau estimé de A1 à C2 selon le CECRL, une note de 0 à 100 et le détail sur 7 critères : étendue du vocabulaire, correction grammaticale, aisance, cohérence, interaction, prononciation et compréhension orale.

**Pourquoi c'est plus fiable qu'un simple avis de l'IA**
- Chaque note doit s'appuyer sur des citations de ta propre transcription. L'appli vérifie que ces citations existent vraiment (coche verte) et baisse la confiance si ce n'est pas le cas.
- Un second modèle indépendant relit la transcription et compare sa notation à celle de l'examinatrice.
- Des mesures objectives sont calculées sans IA à chaque séance : longueur des phrases, richesse du vocabulaire, part de français, débit, pauses d'hésitation, temps de réponse.
- Un indice de confiance (haute, moyenne, faible) est affiché, par exemple si tu as peu parlé.

**Suivre l'évolution** : choisis la période affichée (7 jours, 30 jours, 90 jours, tout ou dates libres). Les graphiques, les écarts par critère et le rapport copiable se recalculent pour cette période.

**Bonnes pratiques** : un test toutes les 2 à 4 semaines, avec un casque, au calme, sans reformuler ce que tu veux dire en français.

**Limites honnêtes** : c'est une estimation indicative, pas une certification. Pour caler l'échelle sur une référence officielle, passe un jour un test reconnu (Linguaskill, TOEIC, IELTS...) et saisis le résultat dans l'onglet Progrès : il apparaît sur la courbe et permet de comparer.

## 7. Limites à connaître

- **Écran allumé obligatoire** : si l'écran se verrouille, le système coupe le micro d'une application web. L'application demande au téléphone de rester éveillé et se reconnecte seule si la liaison saute.
- **Casque recommandé** : sur iPhone le haut-parleur est faible quand le micro est actif. Avec un casque tu peux désactiver l'anti-écho (Réglages) pour pouvoir interrompre ton interlocuteur.
- **Voix** : Gemini propose 30 voix (16 masculines et 14 féminines dans l'appli) mais pas de vraie voix d'enfant.
- **Accents** : demandés dans la consigne de ton interlocuteur. Le rendu varie selon le modèle.
- **Actualité** : la recherche web en direct est activée par défaut. Si le modèle ne la supporte pas, l'application bascule seule sur une configuration plus simple (ton interlocuteur évite alors d'inventer des faits récents).
- **Niveau gratuit** : les modèles vocaux sont en préversion avec des quotas. Google peut utiliser les contenus envoyés au niveau gratuit pour améliorer ses produits : ne dis pas d'informations confidentielles pendant les séances.
- **Modèle** : si le modèle par défaut est retiré ou renommé, change son nom dans Réglages. Trois noms sont proposés dans la liste.

## Langues d'apprentissage : anglais, espagnol, allemand et italien

Sur l'écran d'accueil (et dans l'onglet Progrès) choisis la langue à travailler : 🇬🇧 English, 🇪🇸 Español, 🇩🇪 Deutsch ou 🇮🇹 Italiano. Tout s'adapte : consignes, accent de ton interlocuteur (castillan, mexicain, autrichien, suisse alémanique, romain, milanais, sicilien...), examinateur du test (Sarah, Lucía, Anna ou Giulia), exemples de commandes vocales et examens officiels (DELE ou SIELE, Goethe, TestDaF ou telc, CILS, CELI ou PLIDA).

- Le mode bilingue marche pareil : parle français pour demander une explication, ou dis par exemple « comment dit-on ... en allemand ? ».
- Les commandes vocales fonctionnent dans la langue apprise ou en français : « más despacio », « langsamer », « più piano », « plus lentement ».
- Les tests de niveau, les courbes et les résultats officiels sont suivis séparément pour chaque langue. Tes anciennes données restent classées en anglais.
- Le carnet affiche un drapeau devant chaque séance.
- Limite : les indicateurs de vocabulaire avancé reposent sur une liste de mots courants, plus approximative hors de l'anglais (surtout en allemand à cause des mots composés). Compare des tendances, pas des valeurs isolées.

## Traduction en direct (onglet Traduire)

Choisis l'autre langue (16 disponibles : anglais, espagnol, allemand, italien, portugais, néerlandais, arabe, japonais, chinois, coréen, russe, polonais, turc, hindi, ukrainien, mongol) puis un mode :
- **Interprète** : pose le téléphone entre deux personnes. Le français est traduit dans l'autre langue et inversement, à voix haute.
- **FR vers autre** : tu parles français et la traduction est dite pour ton interlocuteur.
- **Autre vers FR** : tu écoutes quelqu'un qui parle l'autre langue et la traduction française est dite pour toi (casque recommandé).

Conseils : parlez par phrases avec une courte pause, la traduction arrive en 1 à 3 secondes. Avec le haut-parleur garde l'anti-écho activé dans les réglages (le micro se coupe pendant que l'interprète parle). Avec un casque tu peux le désactiver. Rien n'est enregistré dans le carnet. La qualité varie selon la langue : ne l'utilise pas seul pour des sujets médicaux, juridiques ou contractuels.

## Ton interlocuteur unique

Il n'y a plus de liste de personnages : tu crées **une seule personne** avec qui parler au quotidien, sur l'écran d'accueil.
- **Ce que tu définis** : prénom, genre, voix (16 masculines ou 14 féminines), accent (propre à chaque langue), caractère (jusqu'à 4 traits parmi chaleureux, drôle, taquin, calme, curieux, direct, posé, enthousiaste, empathique, cultivé), patience de base, et un texte libre sur sa personnalité.
- **Il évolue** : tu peux le modifier quand tu veux (bouton Modifier) ou le lui demander à voix haute pendant une séance (« change de voix », « parle avec un accent irlandais », « sois plus drôle »). Il reprend alors la conversation sans rupture.
- **Il s'adapte à chaque situation** : il lit ton humeur, ton énergie et ton niveau de confiance. Il devient plus doux et plus court si tu sembles fatigué, plus vif si tu es enthousiaste, plus simple si tu es perdu, plus exigeant si tu es à l'aise. Ses interventions sont courtes par défaut et plus longues seulement quand le sujet l'appelle. Il ne finit pas chaque phrase par une question.
- **Il te laisse le temps** : quand tu hésites, que tu cherches un mot ou que tu dis « attends », il patiente plus longtemps avant de répondre, ou glisse seulement quelques mots d'encouragement ou une suggestion, comme un vrai interlocuteur. L'appli retient le silence côté téléphone et ne le transmet qu'à la fin du temps jugé utile (d'environ 1 seconde pour une question complète à 6 secondes si tu demandes un instant). Le délai de base se règle dans Réglages, et l'appli tient compte de ton rythme sur tes dernières séances.
- **Il te fait parler** : le but est que tu parles environ les deux tiers du temps. Il connaît ton niveau mesuré (dernier test de niveau, longueur de tes réponses, débit, hésitations, part de français) et le réajuste en direct d'après ce qu'il entend : un cran au-dessus de toi, jamais loin au-dessus. Ses interventions s'alignent sur les tiennes (réponse courte de ta part, réaction courte de la sienne). Selon la pertinence de ta réponse, il approfondit un détail, te tend une option facile si tu restes vague, reformule plus simplement si tu n'as pas compris, ou se tait presque pour te laisser dérouler. Sur les sujets que tu maîtrises (ton métier, ta famille) il pousse plus loin et plus précis, sur les sujets nouveaux il simplifie. Fais des tests de niveau réguliers : ils l'aident à se caler.
- **Une conversation, pas un interrogatoire** : il réagit avant de relancer, partage sa propre vie (sa journée, ses petits soucis, ses avis, parfois un désaccord amical), te demande ton avis sur un dilemme à lui, raconte une anecdote, fait une supposition sur toi ou propose un défi. Il vise au plus une question tous les trois tours, ne répète ni ne note tes réponses, et ne te félicite pas à chaque phrase.
- **Il a une vie cohérente** : ce qu'il raconte de lui (métier, famille, animaux, événements) est mémorisé et reste cohérent d'une séance à l'autre, avec de petites nouvelles au fil du temps.
- **Transitions naturelles** : il change de sujet par un lien avec ce que tu viens de dire, une anecdote ou une transition légère, et reprend parfois un fil abandonné.

## Mémoire : il apprend de vos échanges

Après chaque séance (au moins 3 de tes phrases), un modèle texte met à jour la mémoire de ton interlocuteur : famille, travail, goûts, projets, difficultés récurrentes, ce qui marche avec toi, sujets à reprendre, résumé de la conversation. À la séance suivante il te reconnaît et peut reprendre un fil naturellement.
- **Tu gardes la main** : Réglages, rubrique « Mémoire de ton interlocuteur » : tu vois tout ce qu'il retient (y compris ce qu'il a raconté de sa propre vie), tu supprimes un élément, tu ajoutes une information ou tu effaces tout. Un interrupteur désactive entièrement la mémoire.
- **Ce qui n'est pas retenu** : santé, finances, politique, religion, adresse, numéros et mots de passe, sauf si tu demandes expressément de le retenir. Les anecdotes inventées par ton interlocuteur ne sont jamais enregistrées comme des faits sur toi.
- **Confidentialité** : la mémoire reste dans ce téléphone, mais son contenu est transmis à Google avec la conversation pour que ton interlocuteur puisse l'utiliser, comme le reste des échanges.

## Profil : sauvegarde, transfert et invitation

Dans Réglages, section **Profil** (sauvegarde et import) et dans l'onglet **QR** (invitation) :

- **Sauvegarder** : crée un fichier avec ton interlocuteur, tes réglages, la mémoire, le carnet et tes tests de niveau. Tu peux le garder ou le transférer à un autre de tes téléphones. La clé API n'est incluse que si tu coches la case.
- **Importer** : choisis un fichier de sauvegarde, ou colle un code ou un lien d'invitation. L'import remplace les données du téléphone après confirmation.
- **Onglet QR (version propriétaire uniquement)** : affiche le QR code, le lien et le code d'invitation. La personne obtient son propre profil, distinct du tien et vierge : elle choisit son interlocuteur, et sa mémoire, son historique et ses tests restent séparés. Seuls la langue et, si tu le décides, la clé API sont transmis.

**iPhone** : l'appli installée sur l'écran d'accueil a un stockage séparé de Safari. La personne ouvre le lien, installe l'appli (Partager, "Sur l'écran d'accueil"), l'ouvre depuis l'icône, puis colle le code dans Réglages, Profil, Importer.
**Android** : elle ouvre le lien dans Chrome, installe l'appli depuis le menu, et le profil s'importe directement.

**Ta clé API n'est jamais partagée** : une invitation ne la contient pas. L'invité crée sa propre clé gratuite avec son compte Google : un bouton ouvre Google AI Studio, il se connecte, crée sa clé, la copie, puis touche « Coller ma clé ». L'appli vérifie et enregistre la clé. Son usage n'est donc jamais décompté de ton quota. Google n'autorise pas la création totalement automatique d'une clé : ce guidage en deux gestes est le plus proche possible.

### Un seul site, deux versions (adresse automatique)

Le dossier `site` contient deux versions de l'appli :
- à la racine : la **version invités**, sans création d'invitation. C'est l'adresse à laquelle pointent tes QR codes ;
- dans le sous-dossier au nom secret (`p-...`) : ta **version propriétaire**, la seule qui crée des invitations.

Tu publies le dossier `site` une seule fois sur Netlify. Tu n'as rien à saisir : l'adresse des invités est calculée automatiquement. Ouvre et installe ta version sur ton téléphone à l'adresse `https://ton-site.netlify.app/p-...`, et ne donne jamais cette adresse.

Limite à connaître : le site n'a pas de comptes, la séparation repose donc sur le nom secret du sous-dossier. Pour des proches, c'est suffisant.

## Ajouter une autre langue plus tard

Dans `app.js` : ajouter la langue dans `LANGUAGES` avec `enabled: true` et ses accents dans `ACCENTS` de `companion.js`. Dans `progress.js` : ajouter l'examinateur dans `EXAMINERS`, les mots courants dans `LANG_DATA`. Dans `index.html` : ajouter l'option dans les deux sélecteurs de langue.

## Structure des fichiers

- `index.html`, `app.css` : interface
- `companion.js` : interlocuteur unique, mémoire, rythme de réponse adaptatif
- `app.js` : conversation vocale, sujets, carnet
- `edition.js` : version propriétaire ou invités
- `profile.js`, `qrcode.js` : sauvegarde, import et invitation (QR code généré localement)
- `sw.js`, `manifest.webmanifest`, `icons/` : installation sur téléphone
