// services/profile.service.js
//
// Service per la gestione dei profili enneagrammatici.
// Fase 3: onboarding basato su questionnaire_questions con scoring a pesi.
// Fase 7 (futura): updateProfileScores continua a funzionare sulle interazioni.

class ProfileService {
    constructor(dbInstance) {
        this.db = dbInstance;
    }

    async createProfile(userId) {
        const result = await this.db.run(
            `INSERT INTO profiles
             (user_id, dominant_type, wing, description,
              score_type_1, score_type_2, score_type_3, score_type_4, score_type_5,
              score_type_6, score_type_7, score_type_8, score_type_9,
              onboarding_completed)
             VALUES (?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)`,
            [userId, null, null, 'Profilo utente generico.']
        );
        return result.lastID;
    }

    async getProfileByUserId(userId) {
        return this.db.get(`SELECT * FROM profiles WHERE user_id = ?`, [userId]);
    }

    async getProfileByUsername(username) {
        const sql = `
            SELECT p.*, u.id AS user_id, u.username, u.email, u.role,
                   u.is_creator_unlocked, u.created_at AS user_created_at
            FROM profiles p
            JOIN users u ON u.id = p.user_id
            WHERE u.username = ?
        `;
        return this.db.get(sql, [username]);
    }

    // --- Onboarding (Fase 3) ---

    async getAllQuestions() {
        const rows = await this.db.all(
            `SELECT id, question_text, question_type, options_json, enneagram_influence_json
             FROM questionnaire_questions
             ORDER BY id ASC`
        );
        return rows.map((r) => ({
            id: r.id,
            text: r.question_text,
            type: r.question_type,
            options: JSON.parse(r.options_json || '[]'),
            influence: JSON.parse(r.enneagram_influence_json || '{}'),
        }));
    }

    async submitOnboardingAnswers(userId, answers) {
        // answers: { [questionId]: selectedValue } — viene da req.body
        const questions = await this.getAllQuestions();
        const deltas = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // index 0..8 → tipo 1..9
        const rowsToInsert = [];

        for (const q of questions) {
            const picked = answers[`q_${q.id}`];
            if (picked === undefined || picked === null || picked === '') continue;

            const influenceMap = q.influence[picked] || {};
            for (const [type, weight] of Object.entries(influenceMap)) {
                const idx = Number(type) - 1;
                if (idx >= 0 && idx < 9) deltas[idx] += Number(weight);
            }
            rowsToInsert.push([userId, q.id, String(picked)]);
        }

        // Persisti le risposte grezze per audit/ricalcolo futuro.
        for (const row of rowsToInsert) {
            await this.db.run(
                `INSERT INTO questionnaire_answers (user_id, question_id, answer_value) VALUES (?, ?, ?)`,
                row
            );
        }

        // Aggiorna i punteggi del profilo (somma sui punteggi attuali).
        const setClauses = deltas
            .map((_, i) => `score_type_${i + 1} = score_type_${i + 1} + ?`)
            .join(', ');
        await this.db.run(
            `UPDATE profiles
             SET ${setClauses},
                 onboarding_completed = 1,
                 updated_at = DATETIME('now')
             WHERE user_id = ?`,
            [...deltas, userId]
        );

        // Ricalcola il tipo dominante.
        await this.recomputeDominantType(userId);

        // Log interazione.
        await this.db.run(
            `INSERT INTO interactions (user_id, interaction_type, interaction_value)
             VALUES (?, 'complete_onboarding', ?)`,
            [userId, String(rowsToInsert.length)]
        );

        return this.getProfileByUserId(userId);
    }

    async recomputeDominantType(userId) {
        const profile = await this.getProfileByUserId(userId);
        if (!profile) return null;
        let maxScore = -1;
        let dominantType = null;
        for (let i = 1; i <= 9; i++) {
            const s = profile[`score_type_${i}`] || 0;
            if (s > maxScore) {
                maxScore = s;
                dominantType = i;
            }
        }
        if (dominantType !== null && dominantType !== profile.dominant_type) {
            await this.db.run(
                `UPDATE profiles SET dominant_type = ?, updated_at = DATETIME('now') WHERE user_id = ?`,
                [dominantType, userId]
            );
        }
        return dominantType;
    }

    // --- Scoring dinamico da interazioni (Fase 7) ---

    // Soglia di interazioni totali (like+comment+save) oltre la quale
    // un utente `registered` viene promosso a `creator` in modo automatico.
    // Il valore è basso per facilitare la demo; in produzione andrebbe >= 50.
    static CREATOR_PROMO_THRESHOLD = 10;

    // Delta di punteggio (interi) applicati al profilo dell'utente che ha interagito,
    // sul tipo enneagrammatico dell'autore dell'opera con cui ha interagito.
    static SCORE_DELTAS = {
        like: 2,
        comment: 3,
        save: 2,
        view: 0, // view non contribuisce allo scoring
    };

    async updateProfileScores(userId, authorEnneagramType, interactionType) {
        const delta = ProfileService.SCORE_DELTAS[interactionType] || 0;
        const validType =
            Number.isInteger(authorEnneagramType) &&
            authorEnneagramType >= 1 &&
            authorEnneagramType <= 9;

        if (delta > 0 && validType) {
            const scoreField = `score_type_${authorEnneagramType}`;
            await this.db.run(
                `UPDATE profiles
                 SET ${scoreField} = ${scoreField} + ?, updated_at = DATETIME('now')
                 WHERE user_id = ?`,
                [delta, userId]
            );
            await this.recomputeDominantType(userId);
        }

        // Valuta promozione a creator indipendentemente dallo scoring
        // (così conta anche quando l'autore non ha profilo).
        return this.promoteToCreatorIfReady(userId);
    }

    // Promuove l'utente a `creator` se ha superato la soglia di interazioni
    // significative e attualmente è `registered`. Idempotente.
    async promoteToCreatorIfReady(userId) {
        const user = await this.db.get(
            `SELECT id, role, is_creator_unlocked FROM users WHERE id = ?`,
            [userId]
        );
        if (!user || user.role !== 'registered') return null;

        const row = await this.db.get(
            `SELECT COUNT(*) AS c
             FROM interactions
             WHERE user_id = ? AND interaction_type IN ('like', 'comment', 'save')`,
            [userId]
        );
        const count = row ? row.c : 0;
        if (count < ProfileService.CREATOR_PROMO_THRESHOLD) return null;

        await this.db.run(
            `UPDATE users
             SET role = 'creator', is_creator_unlocked = 1, updated_at = DATETIME('now')
             WHERE id = ?`,
            [userId]
        );
        return { promoted: true, interactions: count };
    }
}

export default ProfileService;
