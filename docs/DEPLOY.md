# Synesthesia — guida al deploy

Fase 13 del piano di sviluppo: pubblicazione online dell'applicazione per poter
mostrare la demo ai docenti tramite URL pubblico (fino a 2 punti extra del
punteggio d'esame, cfr. bando).

## Scelta piattaforma

**Render.com** — tier free adeguato, supporto nativo a Node.js + disk persistente,
deploy automatico da GitHub. Alternative: Railway, Fly.io (entrambi richiedono carta
di credito anche per il tier gratuito).

## Prerequisiti

1. Account GitHub con il repository del progetto
2. Account Render.com (registrazione gratuita, basta GitHub)
3. Il repository contiene i file `render.yaml`, `Procfile`, `package.json`

## Passaggi di deploy

### 1. Push del codice su GitHub

```bash
cd C:\Users\VGit\Desktop\synesthesia
git init
git add .
git commit -m "Synesthesia v1.0 - deploy iniziale"
git branch -M main
git remote add origin https://github.com/<tuo-username>/synesthesia.git
git push -u origin main
```

### 2. Creazione del Blueprint su Render

1. Login su [https://dashboard.render.com](https://dashboard.render.com)
2. Bottone **New +** → **Blueprint**
3. Collega il tuo account GitHub e seleziona il repo `synesthesia`
4. Render trova automaticamente `render.yaml` e mostra l'anteprima delle risorse:
   - Web service `synesthesia` (free)
   - Disk `synesthesia-data` (1 GB, `/data`)
5. Clicca **Apply** — il primo deploy impiega 2–3 minuti
6. Al termine, Render assegna un URL del tipo
   `https://synesthesia-<random>.onrender.com`

### 3. Verifica del deploy

Sull'URL pubblico devono funzionare:

- Registrazione nuovo utente + login
- Completamento del questionario di profilazione
- Upload di un file immagine (per creator)
- Ricerca server-side
- Moderazione admin (login `adminuser` / `password`)

### Note importanti

- **Free tier sleep**: dopo 15 minuti di inattività il servizio va in sleep;
  la prima richiesta successiva può impiegare 30–60 secondi. Normale.
- **Disk persistente**: il file `synesthesia.sqlite` vive su `/data/` e sopravvive
  ai redeploy. Upload dei file multimediali sono invece ancora dentro
  `public/uploads/` nel filesystem del container → **vengono persi a ogni deploy**.
  Per demo d'esame va bene; per produzione servirebbe S3/Cloudinary.
- **Secure cookies**: in production (`NODE_ENV=production`) `express-session`
  usa `cookie.secure=true`. Render termina TLS al load balancer e inoltra in
  HTTP al container → `app.set('trust proxy', 1)` in `app.js` dice ad Express
  di fidarsi di `X-Forwarded-Proto: https`.
- **Env vars**:
  - `NODE_ENV=production` — attiva secure cookie
  - `SESSION_SECRET` — generato da Render
  - `DB_PATH=/data/synesthesia.sqlite` — disk persistente
  - `PORT` — iniettato automaticamente da Render

## Rollback

Render mostra tutti i deploy nello storico. Un click su un deploy precedente
→ **Redeploy** ripristina la versione scelta. Il disk persistente non viene
toccato, quindi i dati utente restano.

## Monitoraggio

- **Logs** in tempo reale dal tab *Logs* della dashboard Render
- **Events** per vedere ogni deploy e health check
- **Metrics** per CPU/RAM (limitati su free tier)

## Limiti noti del free tier

| Risorsa | Limite free |
|---|---|
| Ore di run | 750 h/mese (sufficienti per 1 servizio sempre attivo) |
| Sleep dopo inattività | 15 minuti |
| RAM | 512 MB |
| Disk persistente | 1 GB |
| Banda in uscita | 100 GB/mese |

Sufficiente per demo d'esame e sviluppo.
