// services/entry.service.js
import { Database } from '../config/db.js';

class EntryService {
    constructor(dbInstance) {
        this.db = dbInstance;
    }

    // Fase 5 — Upload: crea una entry + riga in entry_files per il file principale.
    // data: { userId, title, description, mediaType, challengeId,
    //         filePath, mimeType, fileSize }
    async createEntry(data) {
        const {
            userId,
            title,
            description,
            mediaType,
            challengeId = null,
            filePath,
            mimeType,
            fileSize,
        } = data;

        const entryResult = await this.db.run(
            `INSERT INTO entries
             (user_id, challenge_id, title, description, media_type, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, 'pending', DATETIME('now'), DATETIME('now'))`,
            [userId, challengeId || null, title, description, mediaType]
        );
        const entryId = entryResult.lastID;

        await this.db.run(
            `INSERT INTO entry_files (entry_id, path, mime_type, size, type, created_at)
             VALUES (?, ?, ?, ?, 'main', DATETIME('now'))`,
            [entryId, filePath, mimeType, fileSize]
        );

        // Log interazione upload.
        await this.db.run(
            `INSERT INTO interactions (user_id, entry_id, interaction_type)
             VALUES (?, ?, 'upload')`,
            [userId, entryId]
        );

        return entryId;
    }

    // Fase 8 — Feed personalizzato: ritorna opere pubblicate di autori
    // con dominant_type affine al tipo del viewer (tipo ± 1, wrap 1..9).
    // Se dominantType è nullo, fallback a getRecentPublishedEntries.
    async getFeedEntries(dominantType, limit = 12) {
        if (!dominantType) return this.getRecentPublishedEntries(limit);

        const wrap = (t) => ((t - 1 + 9) % 9) + 1; // wrap 1..9
        const affinity = [wrap(dominantType - 1), dominantType, wrap(dominantType + 1)];

        const sql = `
            SELECT
                e.id,
                e.title,
                e.description,
                e.media_type,
                e.created_at,
                u.id AS author_id,
                u.username AS author_username,
                p.dominant_type AS author_dominant_type,
                (SELECT ef.path FROM entry_files ef WHERE ef.entry_id = e.id AND ef.type = 'thumbnail' LIMIT 1) AS thumbnail_path,
                (SELECT COUNT(*) FROM likes l WHERE l.entry_id = e.id) AS likes_count,
                (SELECT COUNT(*) FROM comments c WHERE c.entry_id = e.id) AS comments_count
            FROM entries e
            JOIN users u ON u.id = e.user_id
            LEFT JOIN profiles p ON p.user_id = u.id
            WHERE e.status = 'published'
              AND p.dominant_type IN (?, ?, ?)
            ORDER BY e.created_at DESC
            LIMIT ?;
        `;
        return this.db.all(sql, [...affinity, limit]);
    }

    async getRecentPublishedEntries(limit = 8) {
        const sql = `
            SELECT
                e.id,
                e.title,
                e.description,
                e.media_type,
                u.username AS author_username,
                (SELECT ef.path FROM entry_files ef WHERE ef.entry_id = e.id AND ef.type = 'thumbnail' LIMIT 1) AS thumbnail_path
            FROM
                entries e
            JOIN
                users u ON e.user_id = u.id
            WHERE
                e.status = 'published'
            ORDER BY
                e.created_at DESC
            LIMIT ?;
        `;
        return this.db.all(sql, [limit]);
    }

    // Fase 10 — totali aggregati per la dashboard creator
    async getCreatorAggregateStats(creatorId) {
        const row = await this.db.get(
            `
            SELECT
                (SELECT COUNT(*) FROM entries WHERE user_id = ?) AS total_entries,
                (SELECT COUNT(*) FROM entries WHERE user_id = ? AND status = 'published') AS published_entries,
                (SELECT COUNT(*) FROM entries WHERE user_id = ? AND status = 'pending') AS pending_entries,
                (SELECT COUNT(l.user_id) FROM likes l JOIN entries e ON e.id = l.entry_id WHERE e.user_id = ?) AS total_likes,
                (SELECT COUNT(c.id) FROM comments c JOIN entries e ON e.id = c.entry_id WHERE e.user_id = ?) AS total_comments,
                (SELECT COUNT(i.id) FROM interactions i JOIN entries e ON e.id = i.entry_id WHERE e.user_id = ? AND i.interaction_type = 'view') AS total_views
            `,
            [creatorId, creatorId, creatorId, creatorId, creatorId, creatorId]
        );
        return row || {
            total_entries: 0,
            published_entries: 0,
            pending_entries: 0,
            total_likes: 0,
            total_comments: 0,
            total_views: 0,
        };
    }

    async getCreatorEntriesWithStats(creatorId) {
        const sql = `
            SELECT
                e.id,
                e.title,
                e.description,
                e.media_type,
                e.status,
                e.created_at,
                (SELECT COUNT(l.id) FROM likes l WHERE l.entry_id = e.id) AS likes_count,
                (SELECT COUNT(c.id) FROM comments c WHERE c.entry_id = e.id) AS comments_count,
                (SELECT ef.path FROM entry_files ef WHERE ef.entry_id = e.id AND ef.type = 'thumbnail' LIMIT 1) AS thumbnail_path
            FROM
                entries e
            WHERE
                e.user_id = ?
            ORDER BY
                e.created_at DESC;
        `;
        return this.db.all(sql, [creatorId]);
    }

    async getEntryById(entryId) {
        const sql = `
            SELECT
                e.id,
                e.title,
                e.description,
                e.media_type,
                e.status,
                e.created_at,
                u.id AS user_id,
                u.username AS author_username,
                (SELECT ef.path FROM entry_files ef WHERE ef.entry_id = e.id AND ef.type = 'main' LIMIT 1) AS main_file_path,
                (SELECT ef.path FROM entry_files ef WHERE ef.entry_id = e.id AND ef.type = 'thumbnail' LIMIT 1) AS thumbnail_path
            FROM
                entries e
            JOIN
                users u ON e.user_id = u.id
            WHERE
                e.id = ?;
        `;
        return this.db.get(sql, [entryId]);
    }

    async getCommentsForEntry(entryId) {
        const sql = `
            SELECT
                c.id,
                c.content,
                c.created_at,
                u.username AS author_username,
                c.parent_comment_id
            FROM
                comments c
            JOIN
                users u ON c.user_id = u.id
            WHERE
                c.entry_id = ? AND c.status = 'approved'
            ORDER BY
                c.created_at ASC;
        `;
        return this.db.all(sql, [entryId]);
    }

    async getLikesCount(entryId) {
        const result = await this.db.get(`SELECT COUNT(id) as count FROM likes WHERE entry_id = ?`, [entryId]);
        return result ? result.count : 0;
    }

    async isEntryLikedByUser(entryId, userId) {
        const result = await this.db.get(`SELECT id FROM likes WHERE entry_id = ? AND user_id = ?`, [entryId, userId]);
        return !!result;
    }

    async addLike(entryId, userId) {
        const result = await this.db.run(`INSERT INTO likes (entry_id, user_id, created_at) VALUES (?, ?, DATETIME('now'))`, [entryId, userId]);
        return result.lastID;
    }

    async removeLike(entryId, userId) {
        const result = await this.db.run(`DELETE FROM likes WHERE entry_id = ? AND user_id = ?`, [entryId, userId]);
        return result.changes > 0;
    }

    // Fase 6 — Bookmark (saved_entries)
    async isEntrySavedByUser(entryId, userId) {
        const r = await this.db.get(
            `SELECT user_id FROM saved_entries WHERE entry_id = ? AND user_id = ?`,
            [entryId, userId]
        );
        return !!r;
    }

    async addSave(entryId, userId) {
        await this.db.run(
            `INSERT OR IGNORE INTO saved_entries (user_id, entry_id, created_at) VALUES (?, ?, DATETIME('now'))`,
            [userId, entryId]
        );
    }

    // Fase 14 — lista opere salvate da un utente (per sezione profilo)
    async getSavedEntriesByUser(userId, limit = 20) {
        const sql = `
            SELECT
                e.id, e.title, e.media_type,
                u.username AS author_username,
                (SELECT ef.path FROM entry_files ef WHERE ef.entry_id = e.id AND ef.type = 'thumbnail' LIMIT 1) AS thumbnail_path,
                (SELECT COUNT(*) FROM likes l WHERE l.entry_id = e.id) AS likes_count
            FROM saved_entries se
            JOIN entries e ON e.id = se.entry_id
            JOIN users u ON u.id = e.user_id
            WHERE se.user_id = ? AND e.status = 'published'
            ORDER BY se.created_at DESC
            LIMIT ?
        `;
        return this.db.all(sql, [userId, limit]);
    }

    async removeSave(entryId, userId) {
        const r = await this.db.run(
            `DELETE FROM saved_entries WHERE entry_id = ? AND user_id = ?`,
            [entryId, userId]
        );
        return r.changes > 0;
    }

    async getSavesCount(entryId) {
        const r = await this.db.get(
            `SELECT COUNT(user_id) as count FROM saved_entries WHERE entry_id = ?`,
            [entryId]
        );
        return r ? r.count : 0;
    }

    async addComment(entryId, userId, content, parentCommentId = null) {
        const result = await this.db.run(
            `INSERT INTO comments (entry_id, user_id, parent_comment_id, content, created_at, status) VALUES (?, ?, ?, ?, DATETIME('now'), 'approved')`,
            [entryId, userId, parentCommentId, content]
        );
        return result.lastID;
    }

    async getCommentById(commentId) {
        const sql = `
            SELECT
                c.id,
                c.content,
                c.created_at,
                u.username AS author_username,
                c.parent_comment_id
            FROM
                comments c
            JOIN
                users u ON c.user_id = u.id
            WHERE c.id = ?;
        `;
        return this.db.get(sql, [commentId]);
    }

    async getEntriesByChallengeId(challengeId) {
        const sql = `
            SELECT
                e.id,
                e.title,
                e.description,
                e.media_type,
                u.username AS author_username,
                (SELECT ef.path FROM entry_files ef WHERE ef.entry_id = e.id AND ef.type = 'thumbnail' LIMIT 1) AS thumbnail_path
            FROM
                entries e
            JOIN
                users u ON e.user_id = u.id
            WHERE
                e.challenge_id = ? AND e.status = 'published'
            ORDER BY
                e.created_at DESC;
        `;
        return this.db.all(sql, [challengeId]);
    }


    async getPendingEntries() {
        const sql = `
            SELECT
                e.id,
                e.title,
                e.description,
                e.media_type,
                e.status,
                e.created_at,
                u.username AS author_username,
                (SELECT ef.path FROM entry_files ef WHERE ef.entry_id = e.id AND ef.type = 'thumbnail' LIMIT 1) AS thumbnail_path
            FROM
                entries e
            JOIN
                users u ON e.user_id = u.id
            WHERE
                e.status = 'pending'
            ORDER BY
                e.created_at ASC;
        `;
        return this.db.all(sql);
    }

    async updateEntryStatus(entryId, newStatus) {
        const validStatuses = ['published', 'rejected', 'pending'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error(`Invalid entry status: ${newStatus}`);
        }
        const result = await this.db.run(`UPDATE entries SET status = ?, updated_at = DATETIME('now') WHERE id = ?`, [newStatus, entryId]);
        return result.changes > 0;
    }
}

export default EntryService;