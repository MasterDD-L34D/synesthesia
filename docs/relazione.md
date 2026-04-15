---
title: "Synesthesia — Relazione di progetto"
course: "Metodologie di Programmazione per il Web"
academic-year: "2025–2026"
student-id: "20051606"
university: "Università del Piemonte Orientale"
---

# 1. Introduzione

**Synesthesia** è una web application che unisce il confronto artistico
multimediale a un sistema di profilazione psicologica basato sull'Enneagramma
della personalità. Gli utenti partecipano a sfide tematiche (challenge)
caricando opere in tre categorie — **Disegno digitale**, **Fotografia**,
**Composizione audio** — e interagendo con i contenuti degli altri. Ogni like,
commento e salvataggio alimenta un algoritmo che calcola il profilo
enneagrammatico dell'utente e personalizza il feed di opere consigliate.

L'elemento distintivo del progetto è la combinazione di un catalogo artistico
multimediale con una progressione utente guidata dall'analisi del comportamento:
la piattaforma stessa riflette "come giochi modella ciò che diventi".

---

# 2. Scenari d'uso e tipi di utente

Il sistema distingue quattro livelli di interazione:

| Tipo | Login | Capacità |
|---|---|---|
| **Guest** | no | Navigare home, challenge, dettaglio opere, ricerca server-side |
| **Registered** | sì | Like, commenti, salvataggi, profilo enneagrammatico personale |
| **Creator** | sì | Tutto Registered + upload opere + dashboard personale + task generate |
| **Admin** | sì | Moderazione opere, gestione challenge, vista amministrativa |

Un utente **Registered** viene promosso automaticamente a **Creator** quando
raggiunge una soglia di 10 interazioni significative (like + commento + save),
sbloccando l'upload di opere. L'**Admin** è un ruolo separato creato in seed.

Tre ruoli registrati garantiscono il punteggio pieno previsto dal bando
(richiesta minima: 2 tipi diversi di utenti registrati).

---

# 3. Architettura e stack tecnologico

## 3.1 Stack scelto

- **Back end**: Node.js 20+ / Express 4
- **Auth**: Passport.js (strategia `LocalStrategy`) + bcrypt + express-session
  + connect-flash
- **Templating server-side**: EJS
- **Routing client**: Page.js
- **UI**: Bootstrap 5 + Bootstrap Icons, personalizzato tramite `public/css/style.css`
- **Upload file**: Multer con storage su disco
- **Database relazionale**: SQLite (driver `sqlite` + `sqlite3`)
- **Node 22+**: utilizzo del flag `--env-file-if-exists` per la configurazione
  di ambiente senza dipendenze aggiuntive

## 3.2 Pattern architetturale

Il progetto segue il pattern **MVC con dependency injection** dei service nei
controller. Tutte le classi sono in stile ES6:

- `config/` — inizializzazione Database (classe `Database`), Passport, Multer
- `services/` — logica di accesso ai dati e regole di dominio (classi ES6)
- `controllers/` — handler HTTP, costruiti iniettando i service nel costruttore
- `routes/` — registrazione dei router Express, import dei controller
- `middlewares/` — funzioni di protezione (auth, role, upload)
- `views/` — template EJS, organizzati in `pages/` e `partials/`
- `public/` — asset statici (css, js client-side, uploads, img)
- `database/` — `schema.sql` + `seeds.sql`

L'istanza di `Database` è creata in `app.js` e iniettata nei service, che a loro
volta sono iniettati nei controller. Nessuna variabile globale, nessun stato
condiviso al di fuori di questa catena.

## 3.3 Flusso di una richiesta autenticata

```
Browser → Express → session middleware → passport.deserializeUser()
        → route matching → middleware auth/role → controller
        → service → database → response EJS render
```

Esempio per `/creator/dashboard`:

1. Sessione Passport deserializza l'utente dal cookie
2. Middleware `isAuthenticated` verifica login
3. Middleware `isCreator` verifica ruolo ≥ creator
4. `CreatorController.renderCreatorDashboard()` chiama `EntryService.getCreatorEntriesWithStats()`
   e `EntryService.getCreatorAggregateStats()`, poi `ZenService.getRecommendedTasks()`
5. Se le task sono vuote, il controller auto-genera e persiste 3 task via
   `ZenService.saveRecommendedTask()`
6. Rendering EJS della view con i dati recuperati

---

# 4. Modello dei dati

Il database SQLite è organizzato in **15 tabelle** che coprono utenti, profili
enneagrammatici, contenuti, interazioni sociali, moderazione e questionario.

## 4.1 Tabelle principali

| Tabella | Ruolo |
|---|---|
| `users` | Credenziali, ruolo (`registered`/`creator`/`admin`), stato sblocco creator |
| `profiles` | Un record per utente: 9 punteggi enneagrammatici, tipo dominante, flag onboarding |
| `questionnaire_questions` | Domande del questionario con opzioni JSON + mappa pesi → tipo enneagramma |
| `questionnaire_answers` | Log delle risposte grezze per audit e ricalcolo |
| `prompts` | Prompt creativi riusabili |
| `challenges` | Sfide pubblicate (attive/inattive, date, collegamento a prompt) |
| `entries` | Opere caricate (titolo, descrizione, media_type, status moderazione) |
| `entry_files` | File associati a ogni entry (path, mime, size, tipo main/thumbnail) |
| `tags` / `entry_tags` | Tag tematici per la ricerca per keyword |
| `likes` | Like utente→opera (PK composta) |
| `comments` | Commenti con supporto a thread (parent_comment_id) |
| `saved_entries` | Bookmark utente→opera |
| `interactions` | Log completo di eventi (view, like, comment, save, search, upload, complete_onboarding…) |
| `recommended_tasks` | Task Zen persistenti per creator |

## 4.2 Scoring enneagrammatico

Il calcolo del profilo avviene su **due canali paralleli**:

- **Canale esplicito (onboarding)**: le 15 domande del questionario hanno un
  campo JSON `enneagram_influence_json` che mappa ciascuna opzione scelta a un
  vettore di pesi sui 9 tipi. Alla submit, il service somma i pesi ai punteggi
  del profilo e ricalcola il tipo dominante come argmax.

- **Canale implicito (interazioni sociali)**: ogni like/commento/save compiuto
  da un utente su un'opera con autore di tipo dominante *T* incrementa il
  punteggio di tipo *T* del viewer (delta configurabili: like +2, comment +3,
  save +2). Il tipo dominante viene ricalcolato continuamente. Le view non
  contribuiscono, per evitare unlock involontari.

Questo disegno garantisce che **il comportamento del creator** nel tempo
convergerà verso i tipi che più apprezza, personalizzando il feed in modo
organico.

## 4.3 Promozione automatica a Creator

Dopo 10 interazioni significative cumulative, un utente `registered` viene
promosso a `creator` (colonna `users.role` + `is_creator_unlocked`). La
promozione è idempotente: `ProfileService.promoteToCreatorIfReady()` verifica
lo stato corrente prima di scrivere.

---

# 5. Sicurezza e autenticazione

## 5.1 Passport LocalStrategy

La verifica credenziali usa `bcrypt.compare()` contro l'hash salvato in
`users.password_hash`. La sessione è gestita da `express-session` con cookie
httpOnly e `secure: true` in production. `app.set('trust proxy', 1)` permette
a Express di riconoscere `X-Forwarded-Proto: https` dietro il reverse proxy
del servizio di deploy.

## 5.2 Middleware di protezione

- `isAuthenticated` — verifica `req.isAuthenticated()`
- `isCreator` — ammette role `creator` o `admin`
- `isAdmin` — ammette solo `admin`

Applicati sia sulle rotte pagina (es. `/upload`, `/creator/dashboard`, `/admin`)
sia sulle rotte API (es. `POST /api/entries`, `POST /api/entries/:id/save`).

## 5.3 Upload sicuro

`config/multer.js` implementa:
- `fileFilter` che ammette solo mime `image/jpeg|png|gif|webp`, `audio/mpeg|mp3|wav|ogg`, `text/plain`
- `limits.fileSize` a 20 MB
- `filename` sanificato con timestamp + random + nome originale normalizzato
- `destination` calcolata dinamicamente in base al mime (images / audio / text)

---

# 6. Ricerca server-side (requisito d'esame)

La pagina `/search` presenta un form di filtri (testo, categoria media, tipo
enneagramma, tag); ogni submit genera una richiesta asincrona a
`/api/search` che restituisce JSON.

Il service `SearchService.search()` costruisce dinamicamente:

```sql
SELECT e.id, e.title, … , p.dominant_type AS author_enneagram_type
FROM entries e
JOIN users u ON e.user_id = u.id
JOIN profiles p ON u.id = p.user_id
[LEFT JOIN entry_tags / tags se filtro per tag]
WHERE e.status = 'published'
  [AND t.name IN (?, ?, …)]       ← tag
  [AND (e.title LIKE ? OR e.description LIKE ?)]    ← testo
  [AND e.media_type = ?]          ← categoria
  [AND p.dominant_type = ?]       ← affinità enneagramma
GROUP BY e.id
ORDER BY e.created_at DESC
LIMIT ? OFFSET ?
```

Il count totale viene calcolato separatamente per supportare la paginazione.
Il filtro per affinità psicologica usa **JOIN reale** alla tabella `profiles`,
non un filtro client: questo soddisfa il vincolo del bando che esclude la
semplice selezione lato client.

Un endpoint aggiuntivo `/api/search/affinity` restituisce automaticamente le
opere affini al tipo dominante dell'utente loggato.

Ogni query di ricerca da parte di un utente autenticato viene loggata in
`interactions` con `type='search'` e il testo della query come `interaction_value`.

---

# 7. Feed personalizzato e raccomandazioni

Il feed (`/feed`, disponibile a utenti autenticati) combina tre sezioni:

1. **Task Zen consigliate** — record da `recommended_tasks` dell'utente
2. **Challenge attive** — da `ChallengeService.getActiveChallenges()`
3. **Opere affini** — `EntryService.getFeedEntries()` restituisce opere di
   autori con `dominant_type` nell'intervallo ±1 rispetto a quello del viewer
   (wrap circolare 1→9)

Ogni card opera è decorata con un'**auto-caption** generata da `ZenService.generateCaption()`.
Il banco di frasi contiene 9 tipi × 3 varianti (27 caption totali). La
selezione è deterministica (hash stabile di `entryId + mediaType.length`),
così la stessa opera mostra sempre la stessa frase tra refresh.

---

# 8. Dashboard creator e admin

## 8.1 Creator dashboard

- **6 card di statistiche aggregate** (entries totali, pubblicate, pending, like ricevuti, commenti, view)
- **Tabella opere** con thumbnail, conteggio interazioni, stato moderazione
- **Task Zen personalizzate** — al primo accesso vengono generate 3 task dal tipo dominante e persistite in DB

## 8.2 Admin dashboard

- **Coda di moderazione** con bottoni Approve/Reject per ogni entry pending
- **CRUD challenge** — form create/edit/toggle-status con modale dinamico
- **Elenco utenti** con ruolo

Le azioni admin usano `POST` con form standard (no JS custom per le mutation)
rispettando il vincolo "HTTP methods usati in maniera appropriata".

---

# 9. Conformità ai vincoli del bando

| Vincolo | Soluzione adottata |
|---|---|
| JS ad oggetti (classi ES6) back+front | Tutti i service e controller sono classi ES6; moduli client (`entry-detail.js`, `admin-dashboard.js`, `profile.js`, `app.js`) usano `class` o `document.addEventListener` ES6 |
| HTML5 + CSS3 + Bootstrap personalizzato | Bootstrap via CDN + `public/css/style.css` con regole dedicate (avatar, score-bar, entry-detail-image, entry-text-content) |
| Node + Express + SQLite | Stack di riferimento |
| async/await | Utilizzato in tutti i service e i controller |
| Client + server con fetch + API + Page.js | Page.js importato in `public/js/app.js`; moduli ES6 separati per ogni pagina interattiva fanno fetch a `/api/*` |
| EJS templating server-side | Tutte le pagine sono EJS |
| Passport auth | LocalStrategy + sessione + deserializzazione al singolo request |
| 2+ tipi di utenti registrati | 3 tipi (registered, creator, admin) |
| Funzioni guest e funzioni autenticate | Home, challenge, dettaglio opere, ricerca pubblici; upload, feed, profili, interazioni protetti |
| Ricerca testuale / keyword / altra | Testuale (LIKE), keyword (tag), affinità enneagrammatica (JOIN su profiles.dominant_type) |
| DB CRUD non solo credenziali | 15 tabelle, INSERT/SELECT/UPDATE/DELETE su contenuti, interazioni, challenge, task |
| Tag HTML semantici | `main`, `header`, `footer`, `nav`, `article`, `section`, `aside`, `figure` usati ovunque |
| No tag deprecati | Audit Fase 12 pulito |
| No variabili globali JS | Tutti i moduli client usano `<script type="module">` → scope automatico |
| No dichiarazioni CSS/JS inline | Audit Fase 12: zero `<script>` inline, zero `style=""`. Width dinamiche dei progress bar gestite via `data-width` attribute e piccolo modulo JS |
| `classList` invece di `style` | `entry-detail.js` usa `.classList.add/remove` per toggle visual di like/save button |
| HTTP methods appropriati | GET per fetch dati, POST per mutation. `/auth/logout` è POST. Like/comment/save usano POST JSON |
| Usabile e responsive | Bootstrap grid + viewport meta ovunque |

---

# 10. Struttura finale del progetto

```text
synesthesia/
├── app.js                          # bootstrap Express + DI
├── package.json                    # node --env-file-if-exists + deps
├── render.yaml                     # config deploy Render
├── Procfile                        # fallback deploy
├── .env.example / .env
├── .gitignore
├── README.md
├── config/
│   ├── db.js                       # classe Database + mkdir parent
│   ├── passport.js                 # LocalStrategy
│   └── multer.js                   # storage + filter + limits
├── routes/
│   ├── auth.routes.js
│   ├── page.routes.js              # home, login, register, challenges, profile, feed, onboarding
│   ├── api.routes.js               # /api/search, /api/entries/:id/{like,save,comments}
│   ├── creator.routes.js           # /creator/dashboard
│   └── admin.routes.js             # /admin, moderate, challenges
├── controllers/                    # 6 classi ES6
│   ├── auth.controller.js
│   ├── page.controller.js
│   ├── entry.controller.js         # EntryApiController
│   ├── creator.controller.js
│   ├── admin.controller.js
│   └── search.controller.js
├── services/                       # 6 classi ES6
│   ├── user.service.js
│   ├── profile.service.js          # scoring + promo creator
│   ├── challenge.service.js
│   ├── entry.service.js            # create + feed + aggregate stats
│   ├── search.service.js
│   └── zen.service.js              # 27 caption + task bank
├── middlewares/
│   ├── auth.middleware.js          # isAuthenticated, isCreator, isAdmin
│   └── upload.middleware.js        # Multer wrapper con error handling
├── public/
│   ├── css/style.css
│   ├── js/
│   │   ├── app.js                  # Page.js router
│   │   ├── entry-detail.js         # classe ES6 like/save/comment
│   │   ├── admin-dashboard.js      # modal edit challenge
│   │   └── profile.js              # progress bar widths
│   ├── img/
│   └── uploads/{images,audio,avatars}/
├── views/
│   ├── partials/{header,footer,alerts,navbar}.ejs
│   ├── pages/                      # 14 view: home, login, register, onboarding,
│   │                               # feed, challenge-list, challenge-detail,
│   │                               # entry-detail, profile, upload-entry,
│   │                               # creator-dashboard, admin-dashboard, search
│   ├── 404.ejs
│   └── 500.ejs
├── database/
│   ├── schema.sql                  # 15 tabelle + indici
│   └── seeds.sql                   # 6 utenti + 15 questions + 4 challenge + 11 entries + interazioni
└── docs/
    ├── relazione.md                # questo file
    ├── DEPLOY.md                   # guida deploy Render
    └── screenshots/
```

---

# 11. Verifica end-to-end

La sequenza di demo per la presentazione d'esame:

1. `cd C:\Users\VGit\Desktop\synesthesia && npm install && npm start`
2. Aprire `http://localhost:3000` — home pubblica
3. Registrarsi come nuovo utente → completare il questionario → osservare il
   tipo dominante calcolato
4. Loggare come `creative_soul` / `password` (creator seeded) → `/upload` →
   caricare un'immagine → vedere l'entry in `/profile/creative_soul`
5. Loggare come `adminuser` / `password` → `/admin` → approvare l'entry
6. Dal browser guest: ricercare in `/search?query=tramonto` o per affinità
   tipo 4
7. Dalla dashboard creator osservare le statistiche aggregate e le task Zen

Tutte le rotte sono state testate via `curl` end-to-end con copertura dei role
gate (guest, registered, creator, admin).

---

# 12. Considerazioni finali e possibili estensioni

Il progetto copre tutti i requisiti obbligatori del bando e si presta a
diverse estensioni che permetterebbero di ottenere punti aggiuntivi:

- **API esterna (OpenAI)**: sostituire lo `ZenService.generateCaption` con
  chiamate reali per caption dinamiche basate sull'analisi dell'opera
- **Storage cloud**: Cloudinary o S3 per la persistenza degli upload oltre il
  redeploy
- **Web Push notifications** su nuovi like e commenti
- **Export profilo PDF** tramite libreria (es. pdfkit)
- **Dark mode**: toggle con preferenza salvata in localStorage

Il deploy online su Render.com è configurato via `render.yaml` e documentato
in `docs/DEPLOY.md`: basta un push su GitHub e un blueprint su Render per
ottenere un URL pubblico demo.

---

# Appendice A — Credenziali seed

Tutti gli utenti seed hanno password `password` (hash bcrypt reale in
`database/seeds.sql`).

| Username | Email | Ruolo | Tipo dominante |
|---|---|---|---|
| `adminuser` | admin@synesthesia.com | admin | 8 |
| `creative_soul` | creator@synesthesia.com | creator | 4 |
| `pending_creator` | pending@synesthesia.com | creator | 6 |
| `explorer_user` | user1@synesthesia.com | registered | 7 |
| `zen_seeker` | user2@synesthesia.com | registered | 9 |
| `helper_artist` | user3@synesthesia.com | registered | 2 |

# Appendice B — Screenshot da inserire

Lista degli screenshot da catturare manualmente per il report finale
(salvare in `docs/screenshots/` in formato PNG 1280×720 o superiore):

1. `01-home-guest.png` — home page vista guest
2. `02-register.png` — form di registrazione
3. `03-onboarding.png` — questionario di profilazione
4. `04-profile-own.png` — profilo personale con i 9 punteggi
5. `05-feed.png` — feed personalizzato con caption
6. `06-challenge-list.png` — elenco challenge attive
7. `07-challenge-detail.png` — dettaglio challenge con opere partecipanti
8. `08-upload.png` — form di upload
9. `09-entry-detail.png` — dettaglio opera con like e commenti
10. `10-search-results.png` — ricerca con filtri applicati
11. `11-creator-dashboard.png` — dashboard creator con statistiche
12. `12-admin-moderation.png` — admin panel con coda moderazione
