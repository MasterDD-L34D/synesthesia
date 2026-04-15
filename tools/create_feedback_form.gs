/**
 * tools/create_feedback_form.gs
 *
 * Google Apps Script che genera automaticamente il Google Form di feedback
 * per i tester del progetto Synesthesia.
 *
 * Uso:
 *   1. Apri https://script.google.com → New project
 *   2. Incolla questo file nell'editor
 *   3. Click ▶ Run → autorizza accesso (popup OAuth Google)
 *   4. Controlla logs: l'URL del form appare in Execution log
 *   5. Copia URL del form creato nel README.md del repo
 */
function createFeedbackForm() {
    const form = FormApp.create('Synesthesia — Feedback tester');

    form.setDescription(
        'Grazie per testare Synesthesia! Questo form raccoglie feedback sull\'esperienza d\'uso del sito, sui contenuti e sul design. Compilazione: ~7-10 minuti.\n\n' +
        'Repository: https://github.com/MasterDD-L34D/synesthesia\n' +
        'Demo live: https://synesthesia-btr1.onrender.com\n\n' +
        'Credenziali demo: tutti username nel README, password = password'
    );

    form.setCollectEmail(false);
    form.setAllowResponseEdits(true);
    form.setShowLinkToRespondAgain(true);

    // ========== SEZIONE 1 — Profilo tester ==========
    form.addPageBreakItem().setTitle('Profilo tester');

    form.addMultipleChoiceItem()
        .setTitle('Q1 — Qual è il tuo background?')
        .setChoiceValues(['Sviluppatore / Tech', 'Designer', 'Artista / Creator', 'Studente', 'Utente generico', 'Altro']);

    form.addCheckboxItem()
        .setTitle('Q2 — Su quale dispositivo hai testato?')
        .setChoiceValues(['Desktop Windows', 'macOS', 'Linux', 'iPhone', 'Android', 'Tablet']);

    form.addMultipleChoiceItem()
        .setTitle('Q3 — Quale browser hai usato?')
        .setChoiceValues(['Chrome', 'Firefox', 'Safari', 'Edge', 'Altro']);

    form.addMultipleChoiceItem()
        .setTitle('Q4 — Quanto tempo hai dedicato al test?')
        .setChoiceValues(['< 5 min', '5-15 min', '15-30 min', '> 30 min']);

    // ========== SEZIONE 2 — Registrazione & Prisma ==========
    form.addPageBreakItem().setTitle('Registrazione e Mappatura del Prisma');

    form.addScaleItem()
        .setTitle('Q5 — La registrazione è stata semplice?')
        .setBounds(1, 5)
        .setLabels('Molto difficile', 'Molto semplice');

    form.addMultipleChoiceItem()
        .setTitle('Q6 — Hai capito cos\'è il Prisma Interiore dal questionario di onboarding?')
        .setChoiceValues(['Sì, perfettamente', 'Più o meno', 'No, poco chiaro', 'Non ho fatto l\'onboarding']);

    form.addCheckboxItem()
        .setTitle('Q7 — Le 15 domande del questionario ti sono sembrate:')
        .setChoiceValues(['Chiare', 'Rilevanti', 'Troppe', 'Troppo poche', 'Ripetitive', 'Banali', 'Originali']);

    form.addTextItem()
        .setTitle('Q8 — Cosa pensi della tua sfaccettatura dominante assegnata?');

    form.addParagraphTextItem()
        .setTitle('Q9 — Suggerimenti per migliorare il questionario o il concept del Prisma?');

    // ========== SEZIONE 3 — Navigazione & funzionalità ==========
    form.addPageBreakItem().setTitle('Navigazione e funzionalità');

    form.addScaleItem()
        .setTitle('Q10 — Hai trovato facilmente le funzionalità che cercavi?')
        .setBounds(1, 5)
        .setLabels('Per niente', 'Perfettamente');

    form.addCheckboxItem()
        .setTitle('Q11 — Quali funzionalità hai testato?')
        .setChoiceValues([
            'Home', 'Feed personalizzato', 'Challenge list', 'Dettaglio opera',
            'Ricerca', 'Like/commenti/save', 'Upload opera (creator)',
            'Dashboard creator', 'Admin moderation', 'Profilo altro utente'
        ]);

    form.addScaleItem()
        .setTitle('Q12 — La ricerca server-side (testo + keyword + sfaccettatura) è utile?')
        .setBounds(1, 5)
        .setLabels('Inutile', 'Molto utile');

    form.addMultipleChoiceItem()
        .setTitle('Q13 — Il feed personalizzato ti ha mostrato contenuti rilevanti?')
        .setChoiceValues(['Sì', 'Parzialmente', 'No', 'Non lo uso']);

    form.addMultipleChoiceItem()
        .setTitle('Q14 — Le caption automatiche Zen sotto le opere sono:')
        .setChoiceValues(['Evocative e azzeccate', 'Troppo generiche', 'Inutili', 'Non le ho notate']);

    form.addParagraphTextItem()
        .setTitle('Q15 — Bug o malfunzionamenti riscontrati:');

    // ========== SEZIONE 4 — Design & brand ==========
    form.addPageBreakItem().setTitle('Design e brand');

    form.addScaleItem()
        .setTitle('Q16 — Prima impressione del design')
        .setBounds(1, 5)
        .setLabels('Brutto', 'Bellissimo');

    form.addMultipleChoiceItem()
        .setTitle('Q17 — La palette Ink + Prisma (viola/coral/crema) ti piace?')
        .setChoiceValues([
            'Sì, forte e riconoscibile',
            'Sì, ma forse troppo saturata',
            'No, preferirei più neutra',
            'No, troppo minimale',
            'Non saprei'
        ]);

    form.addScaleItem()
        .setTitle('Q18 — I font (Fraunces + Inter) sono leggibili?')
        .setBounds(1, 5)
        .setLabels('Illeggibili', 'Perfetti');

    form.addMultipleChoiceItem()
        .setTitle('Q19 — Il logo prism mark (cerchi sovrapposti) racconta il concetto di sinestesia?')
        .setChoiceValues([
            'Sì, perfettamente',
            'Abbastanza',
            'Non capisco il simbolo',
            'Non l\'ho notato'
        ]);

    form.addMultipleChoiceItem()
        .setTitle('Q20 — La Ruota del Prisma nel profilo utente è chiara?')
        .setChoiceValues([
            'Sì, immediata',
            'Capisco ma potrebbe essere più chiara',
            'No, confusa',
            'Non l\'ho vista'
        ]);

    form.addScaleItem()
        .setTitle('Q21 — I badge sfaccettatura aiutano a capire il tipo dell\'autore?')
        .setBounds(1, 5)
        .setLabels('Per niente', 'Molto');

    form.addParagraphTextItem()
        .setTitle('Q22 — Cosa cambieresti nel design? (suggerimenti concreti)');

    form.addCheckboxItem()
        .setTitle('Q23 — Direzione di design preferita per evolvere il progetto:')
        .setChoiceValues([
            'Più minimale (editorial, Are.na-like)',
            'Più espressivo (festival, gradient-heavy)',
            'Più dark (cosmos.so-like)',
            'Più illustrato (pixel-art, doodle)',
            'Più simil-social (Instagram feel)',
            'Lascia così com\'è'
        ]);

    // ========== SEZIONE 5 — Contenuti & futuro ==========
    form.addPageBreakItem().setTitle('Contenuti e direzione futura');

    form.addScaleItem()
        .setTitle('Q24 — I contenuti seed sono sufficienti a capire il progetto?')
        .setBounds(1, 5)
        .setLabels('Per niente', 'Perfettamente');

    form.addCheckboxItem()
        .setTitle('Q25 — Quali contenuti aggiungeresti?')
        .setChoiceValues([
            'Più challenge tematiche',
            'Più opere demo reali',
            'Tutorial onboarding',
            'Video walkthrough',
            'Blog / magazine',
            'Sezione community'
        ]);

    form.addCheckboxItem()
        .setTitle('Q26 — Feature che vorresti vedere in futuro:')
        .setChoiceValues([
            'Dark mode toggle manuale',
            'Notifiche in-app',
            'Messaggistica tra utenti',
            'Storie temporanee',
            'Condivisione social',
            'Export profilo PDF',
            'Gamification / badge',
            'AI per caption reali',
            'Mobile app',
            'Altro'
        ]);

    form.addMultipleChoiceItem()
        .setTitle('Q27 — Pensi che Synesthesia abbia potenziale oltre al progetto d\'esame?')
        .setChoiceValues([
            'Sì, concept forte',
            'Con qualche rifinitura',
            'Come side project',
            'No, demo accademica'
        ]);

    // ========== SEZIONE 6 — Sintesi ==========
    form.addPageBreakItem().setTitle('Sintesi');

    form.addScaleItem()
        .setTitle('Q28 — Voto complessivo')
        .setBounds(1, 10)
        .setLabels('Pessimo', 'Eccellente');

    form.addTextItem()
        .setTitle('Q29 — Una parola che descrive Synesthesia per te:');

    form.addParagraphTextItem()
        .setTitle('Q30 — Commenti liberi o qualsiasi altra osservazione:');

    // ========== Output ==========
    const editUrl = form.getEditUrl();
    const publishUrl = form.getPublishedUrl();
    const shortUrl = form.shortenFormUrl(publishUrl);

    Logger.log('✓ Form creato');
    Logger.log('Edit URL (per te):  ' + editUrl);
    Logger.log('Public URL (tester): ' + publishUrl);
    Logger.log('Short URL (share):   ' + shortUrl);

    return {
        editUrl: editUrl,
        publishUrl: publishUrl,
        shortUrl: shortUrl,
    };
}
