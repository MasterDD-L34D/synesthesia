// services/challenge.service.js
import { Database } from '../config/db.js';

class ChallengeService {
    constructor(dbInstance) {
        this.db = dbInstance;
    }

    async getAllChallenges() {
        const sql = `
            SELECT
                c.id,
                c.title,
                c.description,
                c.start_date,
                c.end_date,
                c.is_active,
                p.content AS prompt_content
            FROM
                challenges c
            LEFT JOIN
                prompts p ON c.prompt_id = p.id
            ORDER BY
                c.start_date DESC;
        `;
        return this.db.all(sql);
    }

    async getActiveChallenges() {
        const sql = `
            SELECT
                c.id,
                c.title,
                c.description,
                c.start_date,
                c.end_date,
                c.is_active,
                p.content AS prompt_content
            FROM
                challenges c
            LEFT JOIN
                prompts p ON c.prompt_id = p.id
            WHERE
                c.is_active = 1 AND c.end_date >= DATETIME('now')
            ORDER BY
                c.start_date ASC;
        `;
        return this.db.all(sql);
    }

    async getChallengeById(challengeId) {
        const sql = `
            SELECT
                c.id,
                c.title,
                c.description,
                c.start_date,
                c.end_date,
                c.is_active,
                c.created_at,
                c.updated_at,
                p.content AS prompt_content
            FROM
                challenges c
            LEFT JOIN
                prompts p ON c.prompt_id = p.id
            WHERE
                c.id = ?;
        `;
        return this.db.get(sql, [challengeId]);
    }

    async createChallenge(challengeData) {
        const { title, description, startDate, endDate, isActive = 0, promptId = null } = challengeData;
        const result = await this.db.run(
            `INSERT INTO challenges (title, description, start_date, end_date, is_active, prompt_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, DATETIME('now'), DATETIME('now'))`,
            [title, description, startDate, endDate, isActive, promptId]
        );
        return result.lastID;
    }

    async updateChallenge(challengeId, updateData) {
        const fields = [];
        const params = [];
        for (const key in updateData) {
            if (updateData[key] !== undefined) {
                fields.push(`${key} = ?`);
                params.push(updateData[key]);
            }
        }
        if (fields.length === 0) return false;

        params.push(challengeId);

        const result = await this.db.run(
            `UPDATE challenges SET ${fields.join(', ')}, updated_at = DATETIME('now') WHERE id = ?`,
            params
        );
        return result.changes > 0;
    }

    async toggleChallengeStatus(challengeId, isActive) {
        const result = await this.db.run(`UPDATE challenges SET is_active = ?, updated_at = DATETIME('now') WHERE id = ?`, [isActive ? 1 : 0, challengeId]);
        return result.changes > 0;
    }
}

export default ChallengeService;