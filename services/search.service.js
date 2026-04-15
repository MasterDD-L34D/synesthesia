// services/search.service.js
import { Database } from '../config/db.js';

class SearchService {
    constructor(dbInstance) {
        this.db = dbInstance;
    }

    async search({ query, tags, mediaType, authorEnneagramType, page = 1, pageSize = 10 }) {
        let sql = `
            SELECT
                e.id,
                e.title,
                e.description,
                e.media_type,
                e.status,
                e.created_at,
                u.username AS author_username,
                p.dominant_type AS author_enneagram_type,
                (SELECT COUNT(l.id) FROM likes l WHERE l.entry_id = e.id) AS likes_count,
                (SELECT ef.path FROM entry_files ef WHERE ef.entry_id = e.id AND ef.type = 'thumbnail' LIMIT 1) AS thumbnail_path
            FROM
                entries e
            JOIN
                users u ON e.user_id = u.id
            JOIN
                profiles p ON u.id = p.user_id
        `;
        let countSql = `
            SELECT COUNT(DISTINCT e.id) AS total
            FROM
                entries e
            JOIN
                users u ON e.user_id = u.id
            JOIN
                profiles p ON u.id = p.user_id
        `;
        const params = [];
        const countParams = [];
        const whereClauses = ["e.status = 'published'"];

        if (tags && tags.length > 0) {
            sql += `
                JOIN entry_tags et ON e.id = et.entry_id
                JOIN tags t ON et.tag_id = t.id
            `;
            countSql += `
                JOIN entry_tags et ON e.id = et.entry_id
                JOIN tags t ON et.tag_id = t.id
            `;
            const tagPlaceholders = tags.map(() => '?').join(', ');
            whereClauses.push(`t.name IN (${tagPlaceholders})`);
            params.push(...tags);
            countParams.push(...tags);
        }

        if (query) {
            whereClauses.push(`(e.title LIKE ? OR e.description LIKE ?)`);
            params.push(`%${query}%`, `%${query}%`);
            countParams.push(`%${query}%`, `%${query}%`);
        }

        if (mediaType) {
            whereClauses.push(`e.media_type = ?`);
            params.push(mediaType);
            countParams.push(mediaType);
        }

        if (authorEnneagramType) {
            whereClauses.push(`p.dominant_type = ?`);
            params.push(authorEnneagramType);
            countParams.push(authorEnneagramType);
        }

        if (whereClauses.length > 0) {
            const finalWhere = whereClauses.join(' AND ');
            sql += ` WHERE ${finalWhere}`;
            countSql += ` WHERE ${finalWhere}`;
        }

        sql += ` GROUP BY e.id`;

        const offset = (page - 1) * pageSize;
        sql += ` ORDER BY e.created_at DESC LIMIT ? OFFSET ?`;
        params.push(pageSize, offset);

        const totalResult = await this.db.get(countSql, countParams);
        const total = totalResult ? totalResult.total : 0;

        const entries = await this.db.all(sql, params);

        return {
            entries,
            total,
            page,
            pageSize,
            hasNext: (page * pageSize) < total,
        };
    }
}

export default SearchService;