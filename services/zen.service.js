// services/zen.service.js
//
// Fase 8 — Generatore di caption ispirazionali e task personalizzate per tipo enneagrammatico.
// Banchi di frasi deterministici: 9 tipi × 3 varianti per caption, 9 tipi × 2 per task.
// Selezione: hash deterministico su (entryId|type|mediaType) così le caption restano stabili
// tra un refresh e l'altro invece di cambiare ad ogni render.

import { Database } from '../config/db.js';

class ZenService {
    constructor(dbInstance) {
        this.db = dbInstance;
    }

    // Banca di caption per tipo enneagrammatico.
    static CAPTION_BANK = {
        1: [
            'Ogni dettaglio è il risultato di una scelta consapevole.',
            'La disciplina è la forma più alta della libertà creativa.',
            'Perfezionare senza rigidità: arte che respira.',
        ],
        2: [
            'Opera pensata per chi saprà accoglierla.',
            'Dono silenzioso, emozione condivisa.',
            'Creazione che tende una mano a chi guarda.',
        ],
        3: [
            'Risultato concreto di una visione chiara.',
            'Ambizione espressa con precisione.',
            'Impatto, direzione, segno riconoscibile.',
        ],
        4: [
            'Ogni ombra contiene una nota di colore inaspettata.',
            'L\'unicità non si spiega: si sente.',
            'Melanconia trasformata in forma.',
        ],
        5: [
            'Osservazione distillata fino all\'essenziale.',
            'Cosa si vede quando si smette di guardare?',
            'Conoscenza nascosta dentro una forma semplice.',
        ],
        6: [
            'Fedeltà al processo, coraggio nel presentarlo.',
            'Creazione costruita con cura e vigilanza.',
            'Lealtà verso un\'idea che merita di esistere.',
        ],
        7: [
            'Avventura aperta verso ciò che non conoscevi.',
            'Energia che trasforma il possibile in tangibile.',
            'Salto di prospettiva, sorriso nascosto.',
        ],
        8: [
            'Voce diretta, scelta netta, nessuna esitazione.',
            'Forza al servizio di un\'affermazione necessaria.',
            'Opera che prende posizione.',
        ],
        9: [
            'Quiete che include tutto, senza escludere nulla.',
            'Equilibrio che emerge dal lasciar essere.',
            'Ritmo lento, profondità semplice.',
        ],
    };

    // Genera una caption deterministica: stesso input → stessa caption.
    generateCaption(enneagramType, entryId = 0, mediaType = '') {
        const bank = ZenService.CAPTION_BANK[enneagramType];
        if (!bank) return 'Creazione in cerca del suo tipo.';
        const seed = (Number(entryId) || 0) + (mediaType ? mediaType.length : 0);
        const idx = seed % bank.length;
        return bank[idx];
    }

    async generatePersonalizedTasks(enneagramType) {
        const tasksMap = {
            1: ["Dedica un'ora a perfezionare un dettaglio che hai trascurato.", "Rifletti su come la disciplina può liberare la tua creatività."],
            2: ["Crea qualcosa che possa portare gioia o aiuto a qualcuno che ammiri.", "Esprimi gratitudine per l'ispirazione che ti circonda."],
            3: ["Imposta un obiettivo creativo ambizioso e pianifica i primi tre passi.", "Mostra il tuo lavoro al mondo, non temere di brillare."],
            4: ["Esplora un'emozione complessa e trasformala in un'opera d'arte.", "Trova bellezza nell'insolito, nell'imperfetto. Celebra la tua unicità."],
            5: ["Approfondisci una tecnica o un argomento che ti affascina. Ricerca e sperimenta.", "Osserva il mondo senza giudizio e cattura un dettaglio invisibile."],
            6: ["Collabora con un altro artista per un progetto condiviso. Trova supporto nella creazione.", "Affronta una paura creativa e trasformala in un'opportunità di crescita."],
            7: ["Inizia un nuovo progetto audace e non convenzionale. Lasciati ispirare dall'improvvisazione.", "Cerca ispirazione in luoghi inaspettati, viaggia con la mente e la fantasia."],
            8: ["Crea un'opera che sfidi lo status quo o un'ingiustizia. Usa la tua arte per esprimere forza.", "Lascia il segno con un'affermazione creativa potente e decisa."],
            9: ["Prenditi un momento di pace per connetterti con la tua intuizione creativa. L'armonia è la chiave.", "Crea qualcosa che porti armonia e tranquillità nel tuo spazio o per gli altri."],
        };
        return tasksMap[enneagramType] || ["Esplora la tua creatività oggi con una mente aperta!"];
    }

    async getRecommendedTasks(userId) {
        const sql = `SELECT id, content, created_at, completed FROM recommended_tasks WHERE user_id = ? ORDER BY created_at DESC`;
        return this.db.all(sql, [userId]);
    }

    async saveRecommendedTask(userId, content, completed = false) {
        const result = await this.db.run(
            `INSERT INTO recommended_tasks (user_id, content, created_at, completed) VALUES (?, ?, DATETIME('now'), ?)`,
            [userId, content, completed ? 1 : 0]
        );
        return result.lastID;
    }
}

export default ZenService;