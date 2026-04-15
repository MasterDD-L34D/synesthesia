# Synesthesia — Feedback form per tester

Struttura completa del Google Form per raccogliere feedback dai tester del progetto. Ogni sezione mappa a una fase dell'esperienza utente.

## Come creare il form

**Opzione A — Manuale (5 min)**:
1. Apri https://forms.google.com
2. Bottone **+ Vuoto**
3. Titolo: `Synesthesia — Feedback tester`
4. Descrizione: copia dalla sezione "Intro" sotto
5. Per ogni sezione qui sotto, aggiungi le domande con il tipo indicato
6. Settings → **Raccoglie indirizzi email**: OFF (tester anonimi)
7. Settings → **Può inviare più risposte**: ON
8. Invia → copia link → mettilo nel README

**Opzione B — Google Apps Script (2 min)**:
1. Apri https://script.google.com → **New project**
2. Copia il contenuto di `tools/create_feedback_form.gs` nell'editor
3. Click ▶️ **Run** → autorizza → form creato in automatico
4. Edit view URL nella console → apri e verifica
5. Copia link "invia" nel README

---

## Intro (descrizione del form)

> Grazie per testare Synesthesia! Questo form raccoglie feedback sull'esperienza d'uso del sito, sui contenuti e sul design. Compilazione: ~7-10 minuti. Le risposte aiutano a decidere come evolvere il progetto.
>
> **Repository**: https://github.com/MasterDD-L34D/synesthesia
> **Demo live**: https://synesthesia-btr1.onrender.com
>
> Credenziali demo per testare i ruoli: tutti username nel README, password = `password`.

---

## Sezione 1 — Profilo tester

**Q1.** Qual è il tuo background?
- Tipo: *Scelta multipla*
- Opzioni: Sviluppatore/Tech · Designer · Artista/Creator · Studente · Utente generico · Altro

**Q2.** Su quale dispositivo hai testato?
- Tipo: *Caselle di controllo*
- Opzioni: Desktop Windows · macOS · Linux · iPhone · Android · Tablet

**Q3.** Quale browser hai usato?
- Tipo: *Scelta multipla*
- Opzioni: Chrome · Firefox · Safari · Edge · Altro

**Q4.** Quanto tempo hai dedicato al test?
- Tipo: *Scelta multipla*
- Opzioni: < 5 min · 5-15 min · 15-30 min · > 30 min

---

## Sezione 2 — Registrazione & Mappatura del Prisma

**Q5.** La registrazione è stata semplice? (1=molto difficile, 5=molto semplice)
- Tipo: *Scala lineare 1-5*

**Q6.** Hai capito cos'è il Prisma Interiore dal questionario di onboarding?
- Tipo: *Scelta multipla*
- Opzioni: Sì, perfettamente · Più o meno · No, poco chiaro · Non ho fatto l'onboarding

**Q7.** Le 15 domande del questionario ti sono sembrate:
- Tipo: *Caselle di controllo*
- Opzioni: Chiare · Rilevanti · Troppe · Troppo poche · Ripetitive · Banali · Originali

**Q8.** Cosa pensi della tua sfaccettatura dominante assegnata?
- Tipo: *Risposta breve*

**Q9.** Suggerimenti per migliorare il questionario o il concept del Prisma?
- Tipo: *Paragrafo*

---

## Sezione 3 — Navigazione & funzionalità

**Q10.** Hai trovato facilmente le funzionalità che cercavi?
- Tipo: *Scala lineare 1-5*

**Q11.** Quali funzionalità hai testato?
- Tipo: *Caselle di controllo*
- Opzioni: Home · Feed personalizzato · Challenge list · Dettaglio opera · Ricerca · Like/commenti/save · Upload opera (creator) · Dashboard creator · Admin moderation · Profilo altro utente

**Q12.** La ricerca server-side (testo + keyword + sfaccettatura) è utile?
- Tipo: *Scala lineare 1-5*

**Q13.** Il feed personalizzato ti ha mostrato contenuti rilevanti?
- Tipo: *Scelta multipla*
- Opzioni: Sì · Parzialmente · No · Non lo uso

**Q14.** Le caption automatiche Zen sotto le opere sono:
- Tipo: *Scelta multipla*
- Opzioni: Evocative e azzeccate · Troppo generiche · Inutili · Non le ho notate

**Q15.** Bug o malfunzionamenti riscontrati:
- Tipo: *Paragrafo*

---

## Sezione 4 — Design & brand

**Q16.** Prima impressione del design (1=brutto, 5=bellissimo)
- Tipo: *Scala lineare 1-5*

**Q17.** La palette Ink + Prisma (viola/coral/crema) ti piace?
- Tipo: *Scelta multipla*
- Opzioni: Sì, forte e riconoscibile · Sì, ma forse troppo saturata · No, preferirei più neutra · No, troppo minimale · Non saprei

**Q18.** I font (Fraunces + Inter) sono leggibili?
- Tipo: *Scala lineare 1-5*

**Q19.** Il logo prism mark (cerchi sovrapposti) racconta il concetto di sinestesia?
- Tipo: *Scelta multipla*
- Opzioni: Sì, perfettamente · Abbastanza · Non capisco il simbolo · Non l'ho notato

**Q20.** La Ruota del Prisma nel profilo utente è chiara?
- Tipo: *Scelta multipla*
- Opzioni: Sì, immediata · Capisco ma potrebbe essere più chiara · No, confusa · Non l'ho vista

**Q21.** I badge sfaccettatura (icona + numero + nome archetipo) ti aiutano a capire il tipo dell'autore?
- Tipo: *Scala lineare 1-5*

**Q22.** Cosa cambieresti nel design? (suggerimenti concreti)
- Tipo: *Paragrafo*

**Q23.** Direzione di design preferita per evolvere il progetto:
- Tipo: *Caselle di controllo*
- Opzioni: Più minimale (editorial, Are.na-like) · Più espressivo (festival, gradient-heavy) · Più dark (cosmos.so-like) · Più illustrato (pixel-art, doodle) · Più simil-social (Instagram feel) · Lascia così com'è

---

## Sezione 5 — Contenuti & direzione futura

**Q24.** I contenuti seed (opere demo, challenge, archetipi) sono sufficienti a capire il progetto?
- Tipo: *Scala lineare 1-5*

**Q25.** Quali contenuti aggiungeresti?
- Tipo: *Caselle di controllo*
- Opzioni: Più challenge tematiche · Più opere demo reali · Tutorial onboarding · Video walkthrough · Blog/magazine · Sezione community

**Q26.** Feature che vorresti vedere in futuro:
- Tipo: *Caselle di controllo*
- Opzioni: Dark mode toggle manuale · Notifiche in-app · Messaggistica tra utenti · Storie temporanee · Condivisione social · Export profilo PDF · Gamification/badge · AI per caption reali · Mobile app · Altro

**Q27.** Pensi che Synesthesia abbia potenziale oltre al progetto d'esame?
- Tipo: *Scelta multipla*
- Opzioni: Sì, concept forte · Con qualche rifinitura · Come side project · No, demo accademica

---

## Sezione 6 — Sintesi

**Q28.** Voto complessivo (1-10)
- Tipo: *Scala lineare 1-10*

**Q29.** Una parola che descrive Synesthesia per te:
- Tipo: *Risposta breve*

**Q30.** Commenti liberi o qualsiasi altra osservazione:
- Tipo: *Paragrafo*

---

## Dopo la creazione del form

1. **Link di invio** (il "Invia" → Link) → **copia URL abbreviato**
2. Incollalo in:
   - `README.md` sezione "Feedback"
   - Issue template GitHub `.github/ISSUE_TEMPLATE/feedback.md` come alternativa
3. Condividilo con i tester via:
   - README badge
   - Link fisso nell'URL demo Render (eventualmente aggiungere bottone "Dai feedback" nella navbar — opzionale)

## Cosa fare con le risposte

1. Google Form raccoglie in automatico → tab **Risposte** del form
2. Per analisi: **Link a Sheets** → esporta CSV → analisi Python/Excel
3. Pattern ricorrenti in domande libere → backlog miglioramenti
4. Voti medi di design/UX → decisione "tenere direzione" vs "iterare"
