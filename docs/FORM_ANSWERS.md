# Risposte Form esame — Synesthesia

Testo pronto da copia-incollare nel Google Form *Specifiche del progetto di esame (2025 - 2026)*.

**Studente**: matricola 20051606
**Repository**: https://github.com/MasterDD-L34D/synesthesia
**URL demo**: https://synesthesia-btr1.onrender.com

---

## Descrizione sintetica dello scopo della applicazione scelta *

Synesthesia è una web app dedicata al confronto artistico multimediale. Gli utenti partecipano a sfide tematiche (challenge) caricando opere in tre categorie: disegno digitale, fotografia e composizione audio. Il sistema integra un algoritmo di profilazione dinamica chiamato Prisma Interiore — 9 sfaccettature psicologiche ispirate all'Enneagramma — che personalizza il feed, le raccomandazioni e le caption delle opere in base al temperamento dell'utente. Il nome del sistema psicologico è una reinterpretazione originale.

## Eventuale ispirazione del sito

Combinazione concettuale di tre riferimenti:

- **Dribbble / Behance**: disciplina della griglia card-first dove l'opera è protagonista
- **Are.na**: minimalismo editoriale ed eleganza tipografica
- **Concept originale**: fusione tra sinestesia (cross-modalità sensoriale) e tipologie della personalità (archetipi a 9 facce)

---

## Numero di utenti (con registrazione e login) previsti *

☑ **3 o più utenti**

## Quali sono i tipi di utente registrato? *

**Registered, Creator, Admin** (3 ruoli con promozione automatica).

Dettaglio:

- **Registered** — appena iscritto, completa la Mappatura del Prisma Interiore (15 domande), può mettere like/commentare/salvare opere, vede il proprio profilo con la Ruota del Prisma e le Risonanze
- **Creator** — promosso automaticamente da Registered dopo 10 interazioni significative; può caricare opere (immagini/audio/testo via Multer), accede alla Creator Dashboard con stats aggregate e task Zen personalizzate
- **Admin** — modera la coda delle opere in attesa, crea/modifica/attiva challenge, gestisce gli utenti

---

## Quali operazioni può fare sul sito un utente anonimo (non registrato)? *

Un utente non autenticato può:

- Visualizzare la home con challenge attive e opere recenti
- Navigare il catalogo completo delle challenge (attive e passate)
- Leggere il dettaglio di ogni challenge con le opere partecipanti
- Aprire il dettaglio di una singola opera (immagini, player audio, testi, commenti esistenti)
- Accedere al profilo pubblico di qualsiasi utente
- Eseguire ricerche server-side: per testo (titolo + descrizione), per keyword (tag), per affinità di sfaccettatura del Prisma Interiore dell'autore
- Paginare i risultati di ricerca

---

## Quali operazioni possono fare sul sito gli utenti con registrazione, dopo il login, separate per tipo di utente? *

### Registered

- Completare la Mappatura del Prisma Interiore (questionario da 15 domande con scoring a pesi)
- Accedere al feed personalizzato in base alla sfaccettatura dominante
- Mettere like, commentare (con supporto a thread nested) e salvare opere
- Visualizzare il proprio profilo con la Ruota del Prisma, il badge della sfaccettatura dominante, le 9 Risonanze e l'elenco delle opere pubblicate
- Ogni interazione alimenta dinamicamente lo scoring enneagrammatico
- Dopo 10 interazioni significative (like + commenti + salvataggi) viene promosso automaticamente a Creator

### Creator

Tutte le capacità del Registered, più:

- Caricare nuove opere tramite form multipart con validazione Multer (mime, dimensioni, 20 MB max)
- Selezionare una challenge attiva a cui associare l'opera
- Accedere alla Creator Dashboard con:
  - 6 card di statistiche aggregate (opere totali, pubblicate, in revisione, like ricevuti, commenti, view)
  - Tabella delle opere con contatori e stato moderazione
  - Task Zen personalizzate (auto-generate e persistite al primo accesso)
- Visualizzare le proprie Risonanze in dettaglio

### Admin

Tutte le capacità del Creator, più:

- Accesso alla dashboard di moderazione con coda delle opere in stato `pending`
- Approva o rifiuta opere con un click (form POST standard)
- Crea nuove challenge tramite form (titolo, descrizione, date, attivazione)
- Modifica challenge esistenti tramite modale (popolato via modulo JavaScript ES6)
- Attiva / disattiva challenge con toggle
- Visualizza l'elenco utenti

---

## Quali informazioni si prevede di memorizzare, in aggiunta alle informazioni relative agli utenti? *

Il database SQLite contiene **15 tabelle**:

- **users** — credenziali, ruolo, flag sblocco creator
- **profiles** — 9 punteggi di Risonanza del Prisma, sfaccettatura dominante, flag onboarding, riflesso
- **questionnaire_questions** — 15 domande con opzioni JSON e mappa pesi → sfaccettatura
- **questionnaire_answers** — log delle risposte grezze per audit e ricalcolo
- **prompts** — prompt creativi riusabili associabili a challenge
- **challenges** — sfide pubblicate con date, stato attivo, collegamento a prompt
- **entries** — opere caricate (titolo, descrizione, media_type, status moderazione)
- **entry_files** — file associati alle opere (main/thumbnail, mime, size, path)
- **tags** e **entry_tags** — classificazione tematica per ricerca keyword
- **likes** — relazione many-to-many utente→opera (PK composta)
- **comments** — commenti con supporto a thread (parent_comment_id), stato moderazione
- **saved_entries** — bookmark utente→opera
- **interactions** — log completo di eventi: view, like, comment, save, search, upload, complete_onboarding, challenge_click, open_profile
- **recommended_tasks** — task Zen persistenti per creator

Relazioni FK attive (`PRAGMA foreign_keys = ON`), indici su colonne frequenti.

---

## Quali funzionalità di ricerca il sito metterà a disposizione, e a quali utenti verranno rese disponibili? *

Sistema di ricerca **server-side** implementato come API asincrona. Non si tratta di filtri client: ogni query genera una richiesta HTTP a `/api/search` che esegue SQL dinamico sul database SQLite.

**Query SQL costruita dinamicamente**:

```sql
SELECT e.*, p.dominant_type AS author_sfaccettatura
FROM entries e
JOIN users u ON e.user_id = u.id
JOIN profiles p ON u.id = p.user_id
[LEFT JOIN entry_tags + tags se filtro keyword]
WHERE e.status = 'published'
  [AND (e.title LIKE ? OR e.description LIKE ?)]  -- ricerca testuale
  [AND t.name IN (?, ?, ...)]                     -- filtro keyword
  [AND e.media_type = ?]                          -- categoria
  [AND p.dominant_type = ?]                       -- affinità sfaccettatura
GROUP BY e.id
ORDER BY e.created_at DESC
LIMIT ? OFFSET ?
```

**Disponibile a tutti gli utenti** (inclusi guest), per garantire massima consultabilità del catalogo come indicato nel bando.

Supporta paginazione (`page`, `pageSize`, `hasNext`) e count totale per navigazione efficiente.

Endpoint aggiuntivo `/api/search/affinity` per utenti autenticati: restituisce automaticamente le opere degli autori con la stessa sfaccettatura dominante del viewer.

Ogni query di ricerca da parte di un utente autenticato viene loggata in `interactions` con `type='search'` per audit e analytics.

---

## Quali elementi saranno utilizzati per effettuare la ricerca? *

☑ **Ricerca testuale** — LIKE su titolo + descrizione delle opere
☑ **Per keyword** — JOIN con tabella `tags` via `entry_tags`
☐ Geolocalizzazione
☐ Filtri preimpostati
☐ Selettore a cascata
☑ **Altro**: Ricerca per **sfaccettatura del Prisma Interiore** (reinterpretazione originale del modello Enneagramma) dell'autore, con JOIN reale su `profiles.dominant_type`

---

## Eventuali note per i docenti

**Stack tecnologico** aderente al corso:

- Node.js 22+ / Express 4, EJS server-side rendering, Page.js client routing
- Passport.js (LocalStrategy) + bcrypt + express-session
- SQLite con driver `sqlite`/`sqlite3`
- Multer per upload, Bootstrap 5 personalizzato via `public/css/style.css`
- JavaScript a oggetti (classi ES6) sia backend sia frontend
- Nessun JS/CSS inline, HTML semantico, async/await, classList invece di style diretto

**Design system** originale in direzione "Ink + Prisma": palette Bone + Iris + Ember con gradiente firma, tipografia Fraunces + Inter (Google Fonts variable), dark mode automatica via `prefers-color-scheme`, accessibilità WCAG AA.

**Elementi extra rispetto al minimo del bando**:

1. **Deploy online** su Render.com — URL pubblico disponibile (tier free)
2. **Promozione automatica a Creator** dopo 10 interazioni significative
3. **Scoring dual-channel**: esplicito (questionario) + implicito (interazioni)
4. **Feed personalizzato** con auto-caption deterministiche generate in base al profilo
5. **Design system custom** con 9 colori calibrati per le sfaccettature (HSL uniformi)
6. **Componenti SVG riutilizzabili**: logo mark Prisma, Ruota del Prisma (partial EJS parametrico), badge sfaccettatura con icona

**Repository**: https://github.com/MasterDD-L34D/synesthesia
**Demo live**: https://synesthesia-btr1.onrender.com

**Credenziali demo** (tutte password `password`):

- Admin: `adminuser`
- Creator (sfaccettatura 4 — Lirico): `creative_soul`
- Creator (sfaccettatura 6 — Custode, opere pending): `pending_creator`
- Registered (sfaccettatura 7 — Viandante): `explorer_user`
- Registered (sfaccettatura 9 — Orizzonte): `zen_seeker`
- Registered (sfaccettatura 2 — Donatore): `helper_artist`

Documentazione completa nella relazione (`docs/relazione.md` + `docs/relazione.docx`), guida deploy in `docs/DEPLOY.md`, screenshot in `docs/screenshots/` (12 PNG).
