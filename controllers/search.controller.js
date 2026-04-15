// controllers/search.controller.js
import SearchService from '../services/search.service.js';

class SearchController {
    constructor(searchService) {
        this.searchService = searchService;
    }

    async searchEntries(req, res, next) {
        try {
            const { query, tags, mediaType, authorEnneagramType, page, pageSize } = req.query;

            const parsedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : undefined;
            const parsedPage = parseInt(page, 10) || undefined;
            const parsedPageSize = parseInt(pageSize, 10) || undefined;
            const parsedAuthorEnneagramType = parseInt(authorEnneagramType, 10) || undefined;

            const results = await this.searchService.search({
                query,
                tags: parsedTags,
                mediaType,
                authorEnneagramType: parsedAuthorEnneagramType,
                page: parsedPage,
                pageSize: parsedPageSize,
            });

            // Fase 9 — log interazione search (solo utenti autenticati)
            if (req.user && query) {
                this.searchService.db
                    .run(
                        `INSERT INTO interactions (user_id, interaction_type, interaction_value) VALUES (?, 'search', ?)`,
                        [req.user.id, String(query).slice(0, 120)]
                    )
                    .catch((e) => console.error('search log fail:', e));
            }

            res.json({
                success: true,
                data: results.entries,
                meta: {
                    total: results.total,
                    page: results.page,
                    pageSize: results.pageSize,
                    hasNext: results.hasNext,
                },
            });

        } catch (error) {
            console.error('Error during searchEntries:', error);
            next(error);
        }
    }

    async searchAffinity(req, res, next) {
        if (!req.user || !req.user.profile || !req.user.profile.dominant_type) {
            return res.status(401).json({ success: false, error: 'Unauthorized: User not logged in or profile not complete.' });
        }

        try {
            const { page, pageSize } = req.query;
            const parsedPage = parseInt(page, 10) || undefined;
            const parsedPageSize = parseInt(pageSize, 10) || undefined;

            const userDominantType = req.user.profile.dominant_type;

            const results = await this.searchService.search({
                authorEnneagramType: userDominantType,
                page: parsedPage,
                pageSize: parsedPageSize,
            });

            res.json({
                success: true,
                data: results.entries,
                meta: {
                    total: results.total,
                    page: results.page,
                    pageSize: results.pageSize,
                    hasNext: results.hasNext,
                    affinityType: userDominantType,
                },
            });

        } catch (error) {
            console.error('Error during searchAffinity:', error);
            next(error);
        }
    }
}

export default SearchController;