# Synesthesia

> Piattaforma web per sfide artistiche multimediali con **Prisma Interiore** — un sistema di 9 sfaccettature psicologiche che personalizza feed, raccomandazioni e caption delle opere in base al temperamento dell'utente.

Progetto d'esame &mdash; corso **Metodologie di Programmazione per il Web**, Università del Piemonte Orientale, A.A. 2025&ndash;2026 (matricola 20051606).

---

## Concept

**Synesthesia** unisce arte multimediale e psicologia. Gli utenti:

1. Si **registrano** e completano la *Mappatura del Prisma* (15 domande)
2. Ricevono la loro **Sfaccettatura dominante** tra 9 archetipi creativi
3. **Interagiscono** con le opere (like, commenti, salvataggi)
4. Dopo 10 interazioni significative vengono promossi a **Creator** e possono caricare opere
5. Il **feed personalizzato** mostra opere di autori affini e caption generate in base al profilo

Il nome del sistema psicologico è una reinterpretazione originale dell'Enneagramma — stesso modello a 9 archetipi, lessico e naming propri.

### I 9 archetipi del Prisma Interiore

| # | Archetipo | Icona | Essenza |
|:-:|---|:-:|---|
| 1 | **Cesellatore** | ◻ | Ordine, precisione, disciplina |
| 2 | **Donatore** | ♥ | Cura, empatia, generosità |
| 3 | **Faro** | 🏆 | Slancio, successo, visione |
| 4 | **Lirico** | 💧 | Voce unica, introspezione, autenticità |
| 5 | **Cartografo** | 👁 | Osservazione, conoscenza, profondità |
| 6 | **Custode** | 🛡 | Lealtà, sicurezza, fedeltà |
| 7 | **Viandante** | ⚡ | Meraviglia, esplorazione, energia |
| 8 | **Titano** | 💎 | Forza, determinazione, impatto |
| 9 | **Orizzonte** | ☯ | Quiete, armonia, equilibrio |

---

## Stack tecnologico

### Backend

- **Node.js 20+** con ES Modules (`"type": "module"`)
- **Express 4** come web framework
- **SQLite** come database relazionale (`sqlite` + `sqlite3` drivers)
- **Passport.js** con LocalStrategy per autenticazione
- **bcrypt** per hashing password
- **express-session** + **connect-flash** per sessioni e messaggi
- **Multer** per upload multipart

### Frontend

- **EJS** per templating server-side
- **Bootstrap 5** come base CSS, personalizzato tramite `public/css/style.css`
- **Bootstrap Icons** per le icone archetipali
- **Page.js** come router client (routing dichiarativo)
- **ES6 Modules** per il codice client (moduli con classi, nessun JavaScript inline)

### Design system

- **Palette Ink + Prisma** — base Bone (`#FAF7F2`) + Ink (`#1A1625`) + accent Iris (`#5B3FD9`) + Ember (`#F0552B`)
- **Gradiente firma** Prism (`Iris → Magenta → Ember`) — solo hero title, progress bar, logo
- **Typography** — **Fraunces** (display serif variable) + **Inter** (body sans)
- **9 colori HSL uniformi** per le sfaccettature (`L=55% S=65%`, verde ribassato)
- **Dark mode automatica** via `prefers-color-scheme`
- **Motif** — SVG prism mark (3 cerchi sovrapposti in gradient) come logo e bullet, ruota del Prisma come partial EJS parametrico

---

## Avvio rapido

### Prerequisiti

- **Node.js ≥ 22.7** (per `--env-file-if-exists`) — testato con Node 24
- npm ≥ 10
- Connessione internet alla prima esecuzione (il seed usa Picsum Photos e SoundHelix come sorgenti remote per immagini e audio demo)

### Installazione

```bash
cd C:\Users\VGit\Desktop\synesthesia
npm install
npm start
```

Il server parte su [http://localhost:3000](http://localhost:3000). Al primo avvio:

1. Lo schema `database/schema.sql` viene applicato
2. Il seed `database/seeds.sql` popola 6 utenti, 15 domande, 4 challenge, 11 opere, interazioni
3. Il file `database/synesthesia.sqlite` viene creato e persiste tra riavvii

Per ripartire da zero:

```bash
rm database/synesthesia.sqlite
npm start
```

### Dev mode

```bash
npm run dev
```

Avvia `nodemon` con live reload quando modifichi i file sorgente.

---

## Credenziali seed

Tutti gli utenti demo hanno **password = `password`** (hash bcrypt reale in `database/seeds.sql`).

| Username | Ruolo | Sfaccettatura | Note |
|---|---|:-:|---|
| `adminuser` | admin | 8 — Titano | Modera opere, gestisce challenge |
| `creative_soul` | creator | 4 — Lirico | 4 opere pubblicate, 2 task Zen |
| `pending_creator` | creator | 6 — Custode | 2 opere in coda moderazione |
| `explorer_user` | registered | 7 — Viandante | Ha like e commenti seed |
| `zen_seeker` | registered | 9 — Orizzonte | |
| `helper_artist` | registered | 2 — Donatore | 3 opere pubblicate |

---

## Mappa delle rotte

### Pagine pubbliche

| Metodo | Path | Descrizione |
|---|---|---|
| `GET` | `/` | Home con challenge attive e opere recenti |
| `GET` | `/login` | Form di login |
| `GET` | `/register` | Form di registrazione |
| `GET` | `/challenges` | Lista di tutte le challenge |
| `GET` | `/challenges/:id` | Dettaglio challenge con opere partecipanti |
| `GET` | `/entries/:id` | Dettaglio opera (media + commenti) |
| `GET` | `/profile/:username` | Profilo pubblico utente |
| `GET` | `/search` | Pagina di ricerca avanzata |
| `GET` | `/api/search?query=...` | API ricerca server-side (JSON) |

### Pagine autenticate

| Metodo | Path | Ruolo richiesto | Descrizione |
|---|---|:-:|---|
| `GET` | `/feed` | Registered | Feed personalizzato con opere affini |
| `GET` | `/onboarding` | Registered | Mappatura del Prisma (15 domande) |
| `POST` | `/onboarding` | Registered | Calcolo sfaccettatura + salvataggio risposte |
| `POST` | `/api/entries/:id/like` | Registered | Toggle like |
| `POST` | `/api/entries/:id/save` | Registered | Toggle salvataggio |
| `POST` | `/api/entries/:id/comments` | Registered | Nuovo commento |
| `GET` | `/upload` | Creator | Form upload opera |
| `POST` | `/api/entries` | Creator | Upload file multipart + metadati |
| `GET` | `/creator/dashboard` | Creator | Stats + task Zen + tabella opere |

### Admin

| Metodo | Path | Descrizione |
|---|---|---|
| `GET` | `/admin` | Dashboard con coda moderazione |
| `POST` | `/admin/entries/:id/moderate` | Approva o rifiuta opera |
| `POST` | `/admin/challenges` | Crea nuova challenge |
| `POST` | `/admin/challenges/:id` | Aggiorna challenge esistente |
| `POST` | `/admin/challenges/:id/toggle-status` | Attiva/disattiva challenge |

### Auth

| Metodo | Path | Descrizione |
|---|---|---|
| `POST` | `/auth/register` | Crea nuovo account |
| `POST` | `/auth/login` | Autenticazione Passport |
| `POST` | `/auth/logout` | Termina sessione |

---

## Variabili d'ambiente

Vedi `.env.example`. In sviluppo, copialo in `.env` — lo script `npm start` usa `--env-file-if-exists=.env` quindi funziona anche senza file.

| Variabile | Default | Descrizione |
|---|---|---|
| `PORT` | `3000` | Porta HTTP del server |
| `SESSION_SECRET` | fallback dev-only | Secret per `express-session`. Obbligatoria in production |
| `DB_PATH` | `./database/synesthesia.sqlite` | Percorso del file SQLite (su Render = `/data/synesthesia.sqlite`) |
| `NODE_ENV` | `development` | In production attiva secure cookies e `trust proxy` |

---

## Struttura del progetto

```text
synesthesia/
├── app.js                          bootstrap Express + DI
├── package.json
├── render.yaml                     Blueprint deploy Render.com
├── Procfile                        Fallback deploy heroku-like
├── .env.example / .env
├── .gitignore
├── README.md                       questo file
│
├── config/
│   ├── db.js                       classe Database (mkdir + schema + seed)
│   ├── passport.js                 LocalStrategy + serialize/deserialize
│   └── multer.js                   storage + fileFilter + limits 20MB
│
├── routes/
│   ├── auth.routes.js              /auth/login /auth/register /auth/logout
│   ├── page.routes.js              home, profile, challenges, feed, onboarding
│   ├── api.routes.js               /api/search + /api/entries/:id/{like,save,comments} + POST /api/entries
│   ├── creator.routes.js           /creator/dashboard
│   └── admin.routes.js             /admin + moderate + challenges CRUD
│
├── controllers/                    6 classi ES6
│   ├── auth.controller.js
│   ├── page.controller.js
│   ├── entry.controller.js         EntryApiController: like/save/comment/create
│   ├── creator.controller.js
│   ├── admin.controller.js
│   └── search.controller.js
│
├── services/                       6 classi ES6
│   ├── user.service.js
│   ├── profile.service.js          scoring prisma + promo creator
│   ├── challenge.service.js
│   ├── entry.service.js            create + feed + aggregate stats
│   ├── search.service.js           SQL dinamico con LIKE + JOIN
│   └── zen.service.js              27 caption + 18 task bank
│
├── middlewares/
│   ├── auth.middleware.js          isAuthenticated, isCreator, isAdmin
│   └── upload.middleware.js        wrapper Multer con flash errors
│
├── public/
│   ├── css/style.css               Ink + Prisma design system (~1300 LOC)
│   ├── js/
│   │   ├── app.js                  Page.js router
│   │   ├── entry-detail.js         classe EntryDetailInteractions (like/save/comment)
│   │   ├── admin-dashboard.js      classe AdminDashboard (modal edit)
│   │   └── profile.js              progress bar widths da data-width
│   ├── img/
│   │   ├── prism-mark.svg          logo mark (3 cerchi prism)
│   │   ├── enneagram-wheel.svg     statico (rimpiazzato dal partial)
│   │   └── default-thumbnail.png
│   └── uploads/{images,audio,avatars}/
│
├── views/
│   ├── partials/
│   │   ├── header.ejs              navbar Bone + Logout + navigazione
│   │   ├── footer.ejs              footer Ink con divisore prism
│   │   ├── alerts.ejs              flash messages (success/danger/warning)
│   │   ├── prism-wheel.ejs         SVG parametrico — 9 segmenti + highlight sfaccettatura attiva
│   │   └── type-badge.ejs          componente badge con icona + numero + nome archetipo
│   ├── pages/                      14 viste
│   │   ├── home.ejs                hero con dot-matrix + Bone
│   │   ├── login.ejs
│   │   ├── register.ejs
│   │   ├── onboarding.ejs          "Mappatura del Prisma Interiore"
│   │   ├── feed.ejs                task + challenge + opere affini
│   │   ├── challenge-list.ejs
│   │   ├── challenge-detail.ejs
│   │   ├── entry-detail.ejs        image/audio/text viewer + like/save/commenti
│   │   ├── profile.ejs             ruota + badge + risonanze
│   │   ├── upload-entry.ejs
│   │   ├── creator-dashboard.ejs   6 stat card + tabella opere + task Zen
│   │   ├── admin-dashboard.ejs     coda moderazione + challenge CRUD
│   │   └── search.ejs              form filtri + risultati async
│   ├── 404.ejs
│   └── 500.ejs
│
├── database/
│   ├── schema.sql                  15 tabelle + indici (users, profiles, entries, interactions, ...)
│   └── seeds.sql                   6 utenti + 15 domande + 4 challenge + 11 opere + interazioni
│
└── docs/
    ├── relazione.md                relazione completa per esame (413 righe)
    ├── DEPLOY.md                   guida deploy Render step-by-step
    ├── SCREENSHOT_GUIDE.md         procedura cattura 12 screenshot
    └── screenshots/
```

---

## Schema del database

**15 tabelle** SQLite con FK attive (`PRAGMA foreign_keys = ON`):

| Tabella | Ruolo |
|---|---|
| `users` | Credenziali, ruolo, sblocco creator |
| `profiles` | 9 risonanze + sfaccettatura dominante + onboarding flag |
| `questionnaire_questions` / `questionnaire_answers` | 15 domande con pesi JSON + log risposte |
| `prompts` | Prompt creativi riusabili |
| `challenges` | Sfide pubblicate con date + collegamento prompt |
| `entries` | Opere caricate (titolo, descrizione, media_type, status) |
| `entry_files` | File associati (main/thumbnail) con mime + size |
| `tags` / `entry_tags` | Classificazione tematica per ricerca keyword |
| `likes` | Like utente→opera (PK composta) |
| `comments` | Commenti con supporto thread (`parent_comment_id`) |
| `saved_entries` | Bookmark utente→opera |
| `interactions` | Log completo eventi (view, like, comment, save, search, upload, complete_onboarding, …) |
| `recommended_tasks` | Task Zen persistenti per creator |

---

## Fasi di sviluppo completate

| Fase | Risultato |
|:-:|---|
| 0 | Bootstrap + estrazione scaffold iniziale |
| 1 | Riconciliazione schema + fix DATETIME modifiers |
| 2 | Auth Passport + gates role |
| 3 | Mappatura Prisma (15 domande) + scoring |
| 4 | Catalogo challenge navigabile |
| 5 | Upload Multer (immagini + audio + testo) |
| 6 | Social (like + save + commenti) con modulo ES6 |
| 7 | Motore scoring dinamico + promo auto a Creator |
| 8 | Feed personalizzato + caption Zen deterministiche |
| 9 | Ricerca server-side (testo + tag + sfaccettatura + paginazione) |
| 10 | Creator dashboard con stats aggregate |
| 11 | Admin moderation + challenge CRUD |
| 12 | Audit finale: zero inline JS/CSS, semantic HTML5 |
| 12b | Design polish (Ink+Prisma, Fraunces, dark mode, prism mark, seed remote) |
| 12c | Type badge con icone archetipali |
| 12d | Rebrand lessicale Enneagramma → Prisma Interiore |
| 13 | Deploy config Render.com |

---

## Conformità ai vincoli del corso

| Vincolo bando | Stato |
|---|:-:|
| JS ad oggetti (classi ES6) back+front | ✅ |
| HTML5 + CSS3 + Bootstrap + personalizzazione | ✅ |
| Node.js + Express + SQLite | ✅ |
| async/await appropriato | ✅ |
| EJS templating server-side | ✅ |
| Page.js routing client | ✅ |
| Passport auth | ✅ LocalStrategy |
| ≥ 2 tipi utenti registrati | ✅ 3 ruoli (registered, creator, admin) |
| Funzioni guest + autenticate separate | ✅ |
| Ricerca testuale + keyword + altro | ✅ testo, tag, sfaccettatura |
| DB CRUD non solo credenziali | ✅ 15 tabelle |
| HTML semantico | ✅ `main`, `header`, `footer`, `nav`, `article`, `section`, `aside`, `figure` |
| No tag deprecati | ✅ |
| No variabili globali JS | ✅ `<script type="module">` |
| No inline CSS/JS | ✅ audit Fase 12 + fix Fase 12b |
| `classList` invece di `style` | ✅ |
| HTTP methods appropriati | ✅ GET read, POST write |
| Test Chrome 133+ e Firefox 135+ | ✅ |

Eventuali punti extra potenziali:

- **+ deploy online** — config Render pronta, vedi `docs/DEPLOY.md`
- **+ API esterna** (fino a 2 pt) — non attivata. Possibile integrazione OpenAI per caption reali o Cloudinary per upload persistenti

---

## Deploy online

Config Render.com in `render.yaml`. Guida completa in [`docs/DEPLOY.md`](docs/DEPLOY.md).

Sintesi:

```bash
git init && git add . && git commit -m "Synesthesia v1.0"
git remote add origin https://github.com/<username>/synesthesia.git
git push -u origin main
```

Poi su [dashboard.render.com](https://dashboard.render.com) → **New +** → **Blueprint** → seleziona il repo → **Apply**. Render legge `render.yaml` e crea:

- Web service Node.js sul free tier
- Disk persistente 1 GB montato su `/data` (per il SQLite)
- Env vars `NODE_ENV=production`, `SESSION_SECRET` auto-generato, `DB_PATH=/data/synesthesia.sqlite`

URL pubblico assegnato in 2–3 minuti dopo l'apply.

---

## Design system in sintesi

### Colori

| Token | Valore | Uso |
|---|---|---|
| `--syn-ink` | `#1A1625` | Testo, navbar, footer |
| `--syn-bone` | `#FAF7F2` | Background base |
| `--syn-bone-elevated` | `#FFFFFF` | Card, form |
| `--syn-iris` | `#5B3FD9` | Action primaria, link |
| `--syn-ember` | `#F0552B` | CTA singolo per pagina, badge "live" |
| `--syn-magenta` | `#D946A8` | Mid gradient prism |
| `--syn-type-1` ... `--syn-type-9` | HSL uniformi | Sfaccettature del Prisma |

### Gradient prism (uso parsimonioso)

```css
linear-gradient(135deg, #5B3FD9 0%, #D946A8 50%, #F0552B 100%)
```

Applicato solo a: headline hero (text-clip), progress bar score, logo mark, footer top border.

### Typography

- **Fraunces** (variable, `opsz 9..144`, weights 500-700) — h1..h4, display, blockquote, card title
- **Inter** (400/500/600/700) — body, UI, form, badge numeri

### Responsive

Bootstrap grid + media query custom a `768px` che ridimensiona hero, disabilita hover lift delle card, riduce profile avatar.

### Accessibility

- Contrasto AA: Ink su Bone = 13:1
- Focus ring 3px su tutti gli elementi interattivi
- `prefers-reduced-motion` supportato (disabilita animazioni e hover transform)
- `prefers-color-scheme: dark` per dark mode automatica
- SVG con `role="img"` + `aria-label`
- Form con `<label>` espliciti

---

## Documentazione

- [`docs/relazione.md`](docs/relazione.md) — relazione completa per l'esame (12 sezioni + 2 appendici)
- [`docs/DEPLOY.md`](docs/DEPLOY.md) — guida deploy Render.com
- [`docs/SCREENSHOT_GUIDE.md`](docs/SCREENSHOT_GUIDE.md) — procedura di cattura dei 12 screenshot richiesti dal report

---

## Crediti

- **Studente**: matricola 20051606 — Università del Piemonte Orientale
- **Framework**: Express, Passport, EJS, Bootstrap, Multer (licenza MIT)
- **Font**: Fraunces + Inter (Google Fonts, SIL Open Font License)
- **Icone**: Bootstrap Icons (MIT)
- **Immagini demo**: [Picsum Photos](https://picsum.photos) (CC0)
- **Audio demo**: [SoundHelix](https://www.soundhelix.com) (free)

---

## Licenza

Progetto didattico. Codice sorgente libero per uso accademico e personale.
